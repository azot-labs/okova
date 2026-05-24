import { appStorage, Client, getRecentKeysForUrl } from '@/utils/storage';
import type { KeyInfo } from '@/utils/storage';
import {
  fromBase64,
  fromBuffer,
  type MediaKeysEngine,
  PlayReady,
  requestMediaKeySystemAccess,
  setSupportedEngines,
  Widevine,
} from '@okova/lib';
import { getMessageType } from '@okova/lib/widevine/message';
import { WidevineDeviceCredentials } from '@okova/lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '@okova/lib/playready/device-credentials';
import { Session } from '@okova/lib/api';

export default defineBackground({
  type: 'module',
  main: () => {
    console.log('[okova] Background service worker started', {
      id: browser.runtime.id,
    });

    const state: {
      cdm: MediaKeysEngine | null;
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
      if (client instanceof WidevineDeviceCredentials) {
        return new Widevine({ deviceCredentials: client });
      } else if (client instanceof PlayReadyDeviceCredentials) {
        return new PlayReady({ deviceCredentials: client });
      } else {
        return null;
      }
    };

    const getBadgeText = (count: number) => {
      if (count === 0) return '';
      if (count > 99) return '99+';
      return String(count);
    };

    const getKeysCountForUrl = async (url?: string | null) => {
      const [recentKeys, recentKeysByDomain] = await Promise.all([
        appStorage.recentKeys.getValue(),
        appStorage.recentKeysByDomain.getValue(),
      ]);
      return getRecentKeysForUrl(url, recentKeysByDomain, recentKeys).length;
    };

    const updateBadgeForTab = async (tab?: Browser.tabs.Tab | null) => {
      if (typeof tab?.id !== 'number') return;

      const count = await getKeysCountForUrl(tab.url);
      await browser.action.setBadgeText({
        tabId: tab.id,
        text: getBadgeText(count),
      });
    };

    const updateBadgeForTabInBackground = (tab?: Browser.tabs.Tab | null) => {
      void updateBadgeForTab(tab).catch((error) => {
        console.warn('[okova] Unable to update extension badge', error);
      });
    };

    const updateBadgeForTabId = async (tabId: number) => {
      try {
        await updateBadgeForTab(await browser.tabs.get(tabId));
      } catch (error) {
        // The tab may have been closed before the async badge update runs.
        console.warn('[okova] Unable to update extension badge', error);
      }
    };

    const updateActiveTabBadges = async () => {
      const activeTabs = await browser.tabs.query({ active: true });
      const results = await Promise.allSettled(activeTabs.map(updateBadgeForTab));
      for (const result of results) {
        if (result.status === 'rejected') {
          console.warn('[okova] Unable to update extension badge', result.reason);
        }
      }
    };

    const updateActiveTabBadgesInBackground = () => {
      void updateActiveTabBadges().catch((error) => {
        console.warn('[okova] Unable to update extension badge', error);
      });
    };

    updateActiveTabBadgesInBackground();

    appStorage.recentKeys.watch(() => {
      updateActiveTabBadgesInBackground();
    });

    appStorage.recentKeysByDomain.watch(() => {
      updateActiveTabBadgesInBackground();
    });

    browser.tabs.onActivated.addListener(({ tabId }) => {
      void updateBadgeForTabId(tabId);
    });

    browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
      if (changeInfo.url || changeInfo.status === 'complete') {
        updateBadgeForTabInBackground(tab);
      }
    });

    browser.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === browser.windows.WINDOW_ID_NONE) return;
      updateActiveTabBadgesInBackground();
    });

    const parseBinary = (data: Record<string, number>) => new Uint8Array(Object.values(data));

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        console.log('[okova] Received message', message);

        const settings = await appStorage.settings.getValue();
        const setRecentKeys = async (keys: KeyInfo[]) => {
          await appStorage.recentKeys.setValue(keys);
          await appStorage.recentKeysByDomain.setForUrl(message.url, keys);
          updateBadgeForTabInBackground(sender.tab);
        };

        const { initData } = message;
        const allKeys = await appStorage.allKeys.raw.getValue();
        const keys = allKeys?.filter((keyInfo) => keyInfo.pssh === initData);
        const hasKey = !!keys?.length;
        if (hasKey) {
          const currentSiteKeys = keys.map((keyInfo: KeyInfo) => ({
            ...keyInfo,
            url: message.url ?? keyInfo.url,
            mpd: message.mpd ?? keyInfo.mpd,
          }));
          await setRecentKeys(currentSiteKeys);
          sendResponse();
          return;
        }

        if (settings?.emeInterception && message.action === 'keystatuseschange') {
          const keyStatuses = message.keyStatuses as Record<string, string>;
          const keys = Object.entries(keyStatuses).map(([id, status]) => ({
            id: fromBase64(id).toHex(),
            value: status,
            url: message.url,
            mpd: message.mpd,
            pssh: message.initData,
            createdAt: new Date().getTime(),
          }));
          await setRecentKeys(keys);
          await appStorage.allKeys.add(...keys);
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

        setSupportedEngines([cdm]);
        const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
        const mediaKeys = await keySystemAccess.createMediaKeys();

        if (message.action === 'generateRequest') {
          const { initDataType, initData } = message;
          const keySession = mediaKeys.createSession();
          state.sessions.set(initData, keySession);
          if (!state.events.has(keySession.sessionId)) state.events.set(keySession.sessionId, []);
          keySession.addEventListener(
            'message',
            (event) => {
              const messageEvent = event as MediaKeyMessageEvent;
              console.log(messageEvent);
              state.events.get(keySession.sessionId)?.push(messageEvent);
            },
            false,
          );
          await keySession.generateRequest(initDataType, fromBase64(initData).toBuffer());
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
          const messageBase64 = fromBuffer(new Uint8Array(event.message)).toBase64();
          console.log(state.events.get(session.sessionId));
          console.log(`[okova] Sending challenge`, messageBase64, event);
          sendResponse(messageBase64);
        } else if (message.action === 'update') {
          const { initData } = message;

          let isServiceCertificate = false;
          if (cdm instanceof Widevine) {
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
            console.log(`[okova] Updating session with service certificate`, message.messageBase64);
            session?.update(parseBinary(message.message));
            sendResponse();
          } else {
            console.log(`[okova] Updating session`, message.messageBase64);
            session?.update(parseBinary(message.message));
            console.log(`[okova] Waiting for keys`);
            const keys = await session?.waitForKeyStatusesChange();
            console.log(keys);

            const results = keys
              ? Array.from(keys, ([id, value]) => ({
                  id,
                  value,
                  url: message.url,
                  mpd: message.mpd,
                  pssh: message.initData,
                  createdAt: new Date().getTime(),
                }))
              : [];
            console.log('[okova] Received keys', results);
            await setRecentKeys(results);
            await appStorage.allKeys.add(...results);
            sendResponse({ keys: results });
          }
        }
      })();
      return true;
    });
  },
});
