import { appStorage } from '@/utils/storage';
import { fromBase64, fromBuffer } from '@orlan/lib';
import { getMessageType } from '@orlan/lib/widevine/message';
import { WidevineClient } from '@orlan/lib/widevine/client';

export default defineBackground({
  type: 'module',
  main: () => {
    console.log('[orlan] Background service worker started', {
      id: browser.runtime.id,
    });

    const state: {
      client: WidevineClient | null;
      sessions: Map<string, MediaKeySession>;
    } = {
      client: null,
      sessions: new Map(),
    };
    const events = new Map<string, MediaKeyMessageEvent[]>();

    const loadClient = async () => {
      if (state.client) return state.client;
      console.log('[orlan] Loading Widevine client...');
      state.client = await appStorage.clients.active.getValue();
      if (state.client) {
        console.log('[orlan] Widevine client loaded');
        return state.client;
      } else {
        return console.log('[orlan] Unable to load client');
      }
    };

    const parseBinary = (data: Record<string, number>) =>
      new Uint8Array(Object.values(data));

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        console.log('[orlan] Received message', message);

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
          console.log('[orlan] Spoofing disabled, skipping message...');
          sendResponse();
          return;
        }

        const client = await loadClient();
        if (!client) {
          sendResponse();
          return;
        }

        const keySystem = client.requestMediaKeySystemAccess(
          'com.widevine.alpha',
          [],
        );
        const mediaKeys = await keySystem.createMediaKeys();

        if (message.action === 'generateRequest') {
          const { initDataType, initData } = message;
          const keySession = mediaKeys.createSession();
          state.sessions.set(initData, keySession);
          if (!events.has(keySession.sessionId))
            events.set(keySession.sessionId, []);
          keySession.addEventListener(
            'message',
            (event: MediaKeyMessageEvent) => {
              console.log(event);
              events.get(keySession.sessionId)?.push(event);
            },
            false,
          );
          await keySession.generateRequest(initDataType, initData);
          sendResponse();
        } else if (message.action === 'individualization-request') {
          // TODO: Handle individualization request
          sendResponse();
        } else if (message.action === 'license-request') {
          const { initData } = message;
          const session = state.sessions.get(initData);
          console.log('[orlan] Received message license-request', session);
          if (!session) return;
          const event = events
            .get(session.sessionId)
            ?.find((e) => e.messageType === 'license-request');
          if (!event?.message) return console.log(`[orlan] No message`);
          const messageBase64 = fromBuffer(
            new Uint8Array(event.message),
          ).toBase64();
          console.log(events.get(session.sessionId));
          console.log(`[orlan] Sending challenge`, messageBase64, event);
          sendResponse(messageBase64);
        } else if (message.action === 'update') {
          const { initData } = message;
          const type = getMessageType(parseBinary(message.message));
          const serviceCertificateMessageType = 5;
          const isServiceCertificate = type === serviceCertificateMessageType;
          // if (type === serviceCertificateMessageType) {
          //   console.log('[orlan] Service certificate. Skipping');
          //   sendResponse();
          // }
          const session = state.sessions.get(initData);
          if (!session) {
            console.log('[orlan] Unable to find session');
            sendResponse();
          }
          if (isServiceCertificate) {
            session?.update(parseBinary(message.message));
            sendResponse();
          } else {
            session?.addEventListener(
              'keystatuseschange',
              (event) => {
                const keySession = event.target as MediaKeySession;
                const keys = Array.from(
                  keySession.keyStatuses.keys(),
                ) as unknown as Uint8Array[];
                const toKey = (key: Uint8Array) => {
                  const keyPair = fromBuffer(key).toText();
                  const [id, value] = keyPair.split(':');
                  return {
                    id,
                    value,
                    url: message.url,
                    mpd: message.mpd,
                    pssh: message.initData,
                    createdAt: new Date().getTime(),
                  };
                };
                const results = keys.map((key) => toKey(key));
                console.log('[orlan] Received keys', results);
                appStorage.recentKeys.setValue(results);
                appStorage.allKeys.add(...results);
                sendResponse({ keys: results });
              },
              false,
            );
            await session?.update(parseBinary(message.message));
          }
        }
      })();
      return true;
    });
  },
});
