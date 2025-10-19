import { appStorage, Client } from '@/utils/storage';
import {
  Cdm,
  fromBase64,
  fromBuffer,
  PlayReadyCdm,
  requestMediaKeySystemAccess,
  WidevineCdm,
} from '@okova/lib';
import { getMessageType } from '@okova/lib/widevine/message';
import { WidevineClient } from '@okova/lib/widevine/client';
import { PlayReadyClient } from '@okova/lib/playready/client';
import { Key, Session } from '@okova/lib/api';

export default defineBackground({
  type: 'module',
  main: () => {
    console.log('[okova] Background service worker started', {
      id: browser.runtime.id,
    });

    const state: {
      cdm: Cdm | null;
      client: Client | null;
      sessions: Map<string, Session>;
      events: Map<string, MediaKeyMessageEvent[]>;
    } = {
      cdm: null,
      client: null,
      sessions: new Map(),
      events: new Map<string, MediaKeyMessageEvent[]>(),
    };

    const loadClient = async () => {
      if (state.client) return state.client;
      console.log('[okova] Loading DRM client...');
      state.client = await appStorage.clients.active.getValue();
      if (state.client) {
        console.log('[okova] DRM client loaded');
        return state.client;
      } else {
        console.log('[okova] Unable to load client');
        return null;
      }
    };

    const loadCdm = async () => {
      const client = await loadClient();
      if (!client) return null;
      if (client instanceof WidevineClient) {
        return new WidevineCdm({ client });
      } else if (client instanceof PlayReadyClient) {
        return new PlayReadyCdm({ client });
      } else {
        return null;
      }
    };

    const parseBinary = (data: Record<string, number>) =>
      new Uint8Array(Object.values(data));

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        console.log('[okova] Received message', message);

        const settings = await appStorage.settings.getValue();

        const { initData } = message;
        const allKeys = await appStorage.allKeys.raw.getValue();
        const keys = allKeys?.filter(
          (keyInfo: any) => keyInfo.pssh === initData,
        );
        const hasKey = !!keys?.length;
        if (hasKey) {
          await appStorage.recentKeys.setValue(keys);
          sendResponse();
          return;
        }

        if (
          settings?.emeInterception &&
          message.action === 'keystatuseschange'
        ) {
          const keys = Object.entries(message.keyStatuses).map(
            ([id, status]: any) => ({
              id: fromBase64(id).toHex(),
              value: status,
              url: message.url,
              mpd: message.mpd,
              pssh: message.initData,
              createdAt: new Date().getTime(),
            }),
          );
          appStorage.recentKeys.setValue(keys);
          appStorage.allKeys.add(...keys);
          sendResponse();
          return;
        }

        if (!settings?.spoofing) {
          console.log('[okova] Spoofing disabled, skipping message...');
          sendResponse();
          return;
        }

        const cdm = await loadCdm();
        if (!cdm) {
          sendResponse();
          return;
        }

        const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
        const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });

        if (message.action === 'generateRequest') {
          const { initDataType, initData } = message;
          const keySession = mediaKeys.createSession();
          state.sessions.set(initData, keySession);
          if (!state.events.has(keySession.sessionId))
            state.events.set(keySession.sessionId, []);
          keySession.addEventListener(
            'message',
            (event: MediaKeyMessageEvent) => {
              console.log(event);
              state.events.get(keySession.sessionId)?.push(event);
            },
            false,
          );
          await keySession.generateRequest(
            initDataType,
            fromBase64(initData).toBuffer(),
          );
          sendResponse();
        } else if (message.action === 'individualization-request') {
          // TODO: Handle individualization request
          sendResponse();
        } else if (message.action === 'license-request') {
          const { initData } = message;
          const session = state.sessions.get(initData);
          console.log('[okova] Received message license-request', session);
          if (!session) return;
          const event = state.events
            .get(session.sessionId)
            ?.find((e) => e.messageType === 'license-request');
          if (!event?.message) return console.log(`[okova] No message`);
          const messageBase64 = fromBuffer(
            new Uint8Array(event.message),
          ).toBase64();
          console.log(state.events.get(session.sessionId));
          console.log(`[okova] Sending challenge`, messageBase64, event);
          sendResponse(messageBase64);
        } else if (message.action === 'update') {
          const { initData } = message;

          let isServiceCertificate = false;
          if (cdm instanceof WidevineCdm) {
            console.log(`[okova] Checking for service certificate`);
            const type = getMessageType(parseBinary(message.message));
            const serviceCertificateMessageType = 5;
            isServiceCertificate = type === serviceCertificateMessageType;
            console.log({ isServiceCertificate });
            // if (type === serviceCertificateMessageType) {
            //   console.log('[okova] Service certificate. Skipping');
            //   sendResponse();
            // }
          }

          const session = state.sessions.get(initData);
          if (!session) {
            console.log('[okova] Unable to find session');
            sendResponse();
          }

          if (isServiceCertificate) {
            console.log(
              `[okova] Updating session with service certificate`,
              message.messageBase64,
            );
            session?.update(parseBinary(message.message));
            sendResponse();
          } else {
            console.log(`[okova] Updating session`, message.messageBase64);
            session?.update(parseBinary(message.message));
            console.log(`[okova] Waiting for keys`);
            const keys = await session?.waitForKeyStatusesChange();
            console.log(keys);

            const toKey = (key: Key) => {
              return {
                id: key.keyId,
                value: key.key,
                url: message.url,
                mpd: message.mpd,
                pssh: message.initData,
                createdAt: new Date().getTime(),
              };
            };

            const results = keys?.map((key) => toKey(key)) ?? [];
            console.log('[okova] Received keys', results);
            appStorage.recentKeys.setValue(results);
            appStorage.allKeys.add(...results);
            sendResponse({ keys: results });
          }
        }
      })();
      return true;
    });
  },
});
