import { appStorage, Client, getRecentKeysForUrl, isCapturedKey } from '@/utils/storage';
import type { KeyInfo } from '@/utils/storage';
import {
  fromBase64,
  fromBuffer,
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
      client: Client | null;
      sessions: Map<
        string,
        { session: Session; tabId: number | undefined; timer: ReturnType<typeof setTimeout> }
      >;
    } = {
      client: null,
      sessions: new Map(),
    };

    const closeSession = async (id: string) => {
      const entry = state.sessions.get(id);
      if (!entry) return;
      state.sessions.delete(id);
      clearTimeout(entry.timer);
      try {
        await entry.session.close();
      } catch (error) {
        console.warn('[okova] Unable to close DRM session', error);
      }
    };

    const closeTabSessions = (tabId: number) => {
      for (const [id, entry] of state.sessions) {
        if (entry.tabId === tabId) void closeSession(id);
      }
    };
    browser.tabs.onRemoved.addListener(closeTabSessions);

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

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') closeTabSessions(tabId);
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
      const sessionKey =
        typeof message.sessionToken === 'string' && message.sessionToken
          ? JSON.stringify([
              sender.tab?.id,
              sender.frameId,
              sender.documentId,
              message.sessionToken,
            ])
          : undefined;
      (async () => {
        if (message.action === 'close') {
          if (sessionKey) await closeSession(sessionKey);
          sendResponse();
          return;
        }
        console.log('[okova] Received message', message);

        const settings = await appStorage.settings.getValue();
        const setRecentKeys = async (keys: KeyInfo[]) => {
          await appStorage.recentKeys.setValue(keys);
          await appStorage.recentKeysByDomain.setForUrl(message.url, keys);
          updateBadgeForTabInBackground(sender.tab);
        };

        const { initData } = message;
        const allKeys = await appStorage.allKeys.raw.getValue();
        const keys = allKeys?.filter(
          (keyInfo) => keyInfo.pssh === initData && isCapturedKey(keyInfo),
        );
        const hasKey = !!keys?.length;
        if (hasKey && (!sessionKey || !state.sessions.has(sessionKey))) {
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

        if (!sessionKey) {
          sendResponse();
          return;
        }

        if (message.action === 'generateRequest') {
          if (state.sessions.has(sessionKey)) {
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
          const session = mediaKeys.createSession();
          // Bound abandoned requests, including frames removed without closing their sessions.
          const timer = setTimeout(() => void closeSession(sessionKey), 5 * 60_000);
          state.sessions.set(sessionKey, { session, tabId: sender.tab?.id, timer });
          await session.generateRequest(message.initDataType, fromBase64(initData).toBuffer());
          sendResponse();
          return;
        }

        const session = state.sessions.get(sessionKey)?.session;
        if (!session) {
          sendResponse();
          return;
        }

        if (message.action === 'license-request') {
          const challenge = await session.waitForLicenseRequest();
          sendResponse(fromBuffer(challenge).toBase64());
        } else if (message.action === 'update') {
          const response = parseBinary(message.message);
          const isServiceCertificate =
            session.engine instanceof Widevine && getMessageType(response) === 5;
          await session.update(response);
          if (isServiceCertificate) {
            sendResponse();
            return;
          }

          try {
            const keys = await session.waitForKeyStatusesChange();
            const results = Array.from(keys, ([id, value]) => ({
              id,
              value,
              url: message.url,
              mpd: message.mpd,
              pssh: message.initData,
              createdAt: new Date().getTime(),
            }));
            await setRecentKeys(results);
            await appStorage.allKeys.add(...results);
            sendResponse({ keys: results });
          } finally {
            await closeSession(sessionKey);
          }
        } else {
          sendResponse();
        }
      })().catch(async (error: unknown) => {
        if (sessionKey) await closeSession(sessionKey);
        console.warn('[okova] DRM request failed', error);
        sendResponse();
      });
      return true;
    });
  },
});
