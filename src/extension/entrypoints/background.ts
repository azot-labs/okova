import { appStorage, getRecentKeysForUrl, isCapturedKey } from '@/utils/storage';
import { getDrmFailureStorage } from '@/utils/storage';
import type { DrmStage, KeyInfo } from '@/utils/storage';
import {
  fromBase64,
  fromBuffer,
  PlayReady,
  requestMediaKeySystemAccess,
  setSupportedEngines,
  toBufferSource,
  Widevine,
} from '@okova/lib';
import { parseCertificate } from '@okova/lib/widevine/certificate';
import { SignedDrmCertificate, SignedMessage } from '@okova/lib/widevine/proto';
import { getMessageType } from '@okova/lib/widevine/message';
import { WidevineDeviceCredentials } from '@okova/lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '@okova/lib/playready/device-credentials';
import { Session } from '@okova/lib/api';
import { z } from 'zod';
import { parseClearKeyResponse } from '@/utils/clearkey';

const SESSION_IDLE_TIMEOUT_MS = 5 * 60_000;

const SESSION_STORAGE_PREFIX = 'pending-session:';
const storedSessionSchema = z.object({
  state: z.string(),
  client: z.discriminatedUnion('type', [
    z.object({ type: z.literal('wvd'), data: z.string() }),
    z.object({ type: z.literal('prd'), data: z.string() }),
  ]),
  tabId: z.number().optional(),
  expiresAt: z.number(),
  serverCertificate: z.string().optional(),
  challenge: z.string(),
});

type SessionEntry = {
  client: z.infer<typeof storedSessionSchema>['client'];
  expiresAt: number;
  challenge: string;
  session: Session;
  tabId: number | undefined;
  timer: ReturnType<typeof setTimeout>;
  serverCertificate: string | undefined;
};

export default defineBackground({
  type: 'module',
  main: () => {
    console.log('[okova] Background service worker started', {
      id: browser.runtime.id,
    });

    const state: {
      sessions: Map<string, SessionEntry>;
    } = {
      sessions: new Map(),
    };

    const closeSession = async (id: string) => {
      const entry = state.sessions.get(id);
      state.sessions.delete(id);
      if (entry) clearTimeout(entry.timer);
      try {
        await browser.storage.session.remove(SESSION_STORAGE_PREFIX + id);
      } finally {
        try {
          await entry?.session.close();
        } catch (error) {
          console.warn('[okova] Unable to close DRM session', error);
        }
      }
    };

    // Serialize work for each owner without delaying unrelated sessions.
    const pending = new Map<string, Promise<unknown>>();
    const runForSession = (id: string, action: () => Promise<void>) => {
      const operation = (pending.get(id) ?? restored).then(action);
      const settled = operation.catch((error: unknown) => {
        console.warn('[okova] Unable to process DRM session', error);
      });
      pending.set(id, settled);
      void settled.then(() => {
        if (pending.get(id) === settled) pending.delete(id);
      });
      return operation;
    };

    const scheduleExpiry = (id: string, expiresAt: number) =>
      setTimeout(
        () => {
          const entry = state.sessions.get(id);
          if (entry && entry.expiresAt <= Date.now()) {
            void closeSession(id).catch((error: unknown) => {
              console.warn('[okova] Unable to expire DRM session', error);
            });
          }
        },
        Math.max(0, expiresAt - Date.now()),
      );

    const persistSession = async (id: string, entry: SessionEntry) => {
      if (state.sessions.get(id) !== entry) throw new Error('DRM session closed');
      await browser.storage.session.set({
        [SESSION_STORAGE_PREFIX + id]: {
          state: entry.session.pause(),
          client: entry.client,
          tabId: entry.tabId,
          expiresAt: entry.expiresAt,
          serverCertificate: entry.serverCertificate,
          challenge: entry.challenge,
        } satisfies z.infer<typeof storedSessionSchema>,
      });
      // A lifecycle close can interrupt an in-flight storage write.
      if (state.sessions.get(id) !== entry) {
        await browser.storage.session.remove(SESSION_STORAGE_PREFIX + id);
        throw new Error('DRM session closed');
      }
    };

    const invalidatedTabs = new Set<number>();
    let isRestoring = true;
    const restored = (async () => {
      const records = await browser.storage.session.get(null);
      for (const [key, value] of Object.entries(records)) {
        if (!key.startsWith(SESSION_STORAGE_PREFIX)) continue;
        const id = key.slice(SESSION_STORAGE_PREFIX.length);
        try {
          const record = storedSessionSchema.parse(value);
          if (record.expiresAt <= Date.now()) {
            await browser.storage.session.remove(key);
            continue;
          }
          const data = fromBase64(record.client.data).toBuffer();
          const engine =
            record.client.type === 'wvd'
              ? new Widevine({
                  deviceCredentials: await WidevineDeviceCredentials.from({ wvd: data }),
                })
              : new PlayReady({
                  deviceCredentials: await PlayReadyDeviceCredentials.from({ prd: data }),
                });
          if (record.serverCertificate && engine instanceof Widevine) {
            await engine.setServerCertificate(fromBase64(record.serverCertificate).toBuffer());
          }
          if (record.tabId !== undefined && invalidatedTabs.has(record.tabId)) {
            await browser.storage.session.remove(key);
            continue;
          }
          state.sessions.set(id, {
            ...record,
            tabId: record.tabId,
            serverCertificate: record.serverCertificate,
            session: Session.resume(record.state, engine),
            timer: scheduleExpiry(id, record.expiresAt),
          });
        } catch (error) {
          await browser.storage.session.remove(key);
          console.warn('[okova] Unable to restore DRM session', error);
        }
      }
    })()
      .catch((error: unknown) => {
        console.warn('[okova] Unable to restore pending DRM sessions', error);
      })
      .finally(() => {
        isRestoring = false;
        invalidatedTabs.clear();
      });

    const tabGenerations = new Map<number, number>();
    const closeTabSessions = (tabId: number) => {
      tabGenerations.set(tabId, (tabGenerations.get(tabId) ?? 0) + 1);
      void getDrmFailureStorage(tabId)
        .removeValue()
        .catch((error: unknown) => {
          console.warn('[okova] Unable to clear DRM diagnostic', error);
        });
      if (isRestoring) invalidatedTabs.add(tabId);
      for (const id of new Set([...state.sessions.keys(), ...pending.keys()])) {
        const owner: unknown = JSON.parse(id);
        if (Array.isArray(owner) && owner[0] === tabId) {
          // Active sessions must close now to unblock pending key-status waits.
          // A session still loading its client is cleaned up once it is created.
          const closing = state.sessions.has(id)
            ? closeSession(id)
            : runForSession(id, () => closeSession(id));
          void closing.catch((error: unknown) => {
            console.warn('[okova] Unable to close tab DRM session', error);
          });
        }
      }
    };
    browser.tabs.onRemoved.addListener(closeTabSessions);

    const loadClient = async () => {
      console.log('[okova] Loading DRM client...');
      const client = await appStorage.clients.active.getValue();
      if (client) {
        console.log('[okova] DRM client loaded');
        return client;
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
      let stage: DrmStage = 'setup';
      const tabId = sender.tab?.id;
      const tabGeneration = tabId === undefined ? 0 : (tabGenerations.get(tabId) ?? 0);
      const clearFailure = async () => {
        if (tabId === undefined || tabGeneration !== (tabGenerations.get(tabId) ?? 0)) return;
        try {
          await getDrmFailureStorage(tabId).removeValue();
        } catch (error) {
          console.warn('[okova] Unable to clear DRM diagnostic', error);
        }
      };
      const handleMessage = async () => {
        if (message.action === 'close') {
          stage = 'close';
          if (sessionKey) await closeSession(sessionKey);
          sendResponse();
          return;
        }
        if (sessionKey) {
          const current = state.sessions.get(sessionKey);
          if (current && current.expiresAt <= Date.now()) await closeSession(sessionKey);
        }
        const entry = sessionKey ? state.sessions.get(sessionKey) : undefined;
        if (sessionKey && entry) {
          clearTimeout(entry.timer);
          entry.expiresAt = Date.now() + SESSION_IDLE_TIMEOUT_MS;
          entry.timer = scheduleExpiry(sessionKey, entry.expiresAt);
          stage = 'storage';
          await persistSession(sessionKey, entry);
        }
        console.log('[okova] Received message', message);

        stage = 'setup';
        const settings = await appStorage.settings.getValue();
        const setRecentKeys = async (keys: KeyInfo[]) => {
          await appStorage.recentKeys.setValue(keys);
          await appStorage.recentKeysByDomain.setForUrl(message.url, keys);
          updateBadgeForTabInBackground(sender.tab);
        };

        // Inspect before the history shortcut so later responses can add rotated keys.
        if (
          settings?.emeInterception &&
          message.action === 'update' &&
          message.keySystem === 'org.w3.clearkey'
        ) {
          stage = 'license';
          const clearKeys = parseClearKeyResponse(parseBinary(message.message));
          if (clearKeys?.length) {
            const results = clearKeys.map((key) => ({
              ...key,
              url: message.url,
              mpd: message.mpd,
              pssh: message.initData,
              createdAt: Date.now(),
            }));
            stage = 'history';
            await setRecentKeys(results);
            await appStorage.allKeys.add(...results);
            await clearFailure();
            stage = 'close';
            if (sessionKey) await closeSession(sessionKey);
            sendResponse({ keys: results });
            return;
          }
        }

        const { initData } = message;
        const allKeys = await appStorage.allKeys.raw.getValue();
        const keys = allKeys?.filter(
          (keyInfo) =>
            keyInfo.pssh === initData &&
            isCapturedKey(keyInfo) &&
            (message.keySystem !== 'org.w3.clearkey' || keyInfo.url === message.url),
        );
        const hasKey = !!keys?.length;
        if (hasKey && (!sessionKey || !state.sessions.has(sessionKey))) {
          const currentSiteKeys = keys.map((keyInfo: KeyInfo) => ({
            ...keyInfo,
            url: message.url ?? keyInfo.url,
            mpd: message.mpd ?? keyInfo.mpd,
          }));
          stage = 'history';
          await setRecentKeys(currentSiteKeys);
          await clearFailure();
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
          stage = 'history';
          await setRecentKeys(keys);
          await appStorage.allKeys.add(...keys);
          await clearFailure();
          sendResponse();
          return;
        }

        if (message.keySystem === 'org.w3.clearkey') {
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
          await clearFailure();
          stage = 'client';
          const cdm = await loadCdm();
          if (!cdm)
            throw new Error('No active DRM client. Import or select a client in the popup.');
          const serverCertificate =
            typeof message.serverCertificate === 'string' ? message.serverCertificate : undefined;
          if (serverCertificate && cdm instanceof Widevine) {
            stage = 'certificate';
            await cdm.setServerCertificate(fromBase64(serverCertificate).toBuffer());
          }
          stage = 'session';
          setSupportedEngines([cdm]);
          const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
          const mediaKeys = await keySystemAccess.createMediaKeys();
          const session = mediaKeys.createSession();
          // Close after five minutes of inactivity, including silently removed frames.
          const clientData = fromBuffer(await cdm.deviceCredentials.pack()).toBase64();
          const expiresAt = Date.now() + SESSION_IDLE_TIMEOUT_MS;
          const timer = scheduleExpiry(sessionKey, expiresAt);
          const entry: SessionEntry = {
            session,
            client: {
              type: cdm instanceof Widevine ? 'wvd' : 'prd',
              data: clientData,
            },
            expiresAt,
            challenge: '',
            tabId: sender.tab?.id,
            timer,
            serverCertificate,
          };
          state.sessions.set(sessionKey, entry);
          stage = 'challenge';
          await session.generateRequest(message.initDataType, fromBase64(initData).toBuffer());
          entry.challenge = fromBuffer(await session.waitForLicenseRequest()).toBase64();
          stage = 'storage';
          await persistSession(sessionKey, entry);
          sendResponse();
          return;
        }

        const sessionEntry = state.sessions.get(sessionKey);
        if (!sessionEntry) {
          sendResponse();
          return;
        }

        const { session } = sessionEntry;
        if (message.action === 'license-request') {
          stage = 'challenge';
          const serverCertificate = message.serverCertificate;
          if (
            session.engine instanceof Widevine &&
            typeof serverCertificate === 'string' &&
            serverCertificate !== sessionEntry.serverCertificate
          ) {
            stage = 'certificate';
            const { signedDrmCertificate } = await parseCertificate(serverCertificate);
            // Replace any session-level override and regenerate with the new certificate.
            await session.update(
              toBufferSource(
                SignedMessage.encode({
                  type: SignedMessage.MessageType.SERVICE_CERTIFICATE,
                  msg: SignedDrmCertificate.encode(signedDrmCertificate).finish(),
                }).finish(),
              ),
            );
            sessionEntry.serverCertificate = serverCertificate;
            stage = 'challenge';
            sessionEntry.challenge = fromBuffer(await session.waitForLicenseRequest()).toBase64();
          }
          stage = 'storage';
          await persistSession(sessionKey, sessionEntry);
          sendResponse(sessionEntry.challenge);
        } else if (message.action === 'update') {
          stage = 'license';
          const response = parseBinary(message.message);
          const isServiceCertificate =
            session.engine instanceof Widevine && getMessageType(response) === 5;
          if (isServiceCertificate) stage = 'certificate';
          await session.update(response);
          if (isServiceCertificate) {
            stage = 'challenge';
            sessionEntry.challenge = fromBuffer(await session.waitForLicenseRequest()).toBase64();
            stage = 'storage';
            await persistSession(sessionKey, sessionEntry);
            sendResponse();
            return;
          }

          stage = 'keys';
          const keys = await session.waitForKeyStatusesChange();
          const results = Array.from(keys, ([id, value]) => ({
            id,
            value,
            url: message.url,
            mpd: message.mpd,
            pssh: message.initData,
            createdAt: new Date().getTime(),
          }));
          stage = 'history';
          await setRecentKeys(results);
          await appStorage.allKeys.add(...results);
          await clearFailure();
          stage = 'close';
          await closeSession(sessionKey);
          sendResponse({ keys: results });
        } else {
          sendResponse();
        }
      };
      const handleSafely = async () => {
        try {
          await handleMessage();
        } catch (error: unknown) {
          console.warn('[okova] DRM request failed at', stage, error);
          try {
            if (tabId !== undefined && tabGeneration === (tabGenerations.get(tabId) ?? 0)) {
              await getDrmFailureStorage(tabId).setValue({
                stage,
                error: error instanceof Error ? error.message : String(error),
                url: sender.tab?.url ?? message.url ?? '',
                createdAt: Date.now(),
              });
            }
          } catch (diagnosticError) {
            console.warn('[okova] Unable to store DRM diagnostic', diagnosticError);
          }
          try {
            if (sessionKey) await closeSession(sessionKey);
          } catch (cleanupError) {
            console.warn('[okova] Unable to clean up failed DRM session', cleanupError);
          }
          sendResponse();
        }
      };
      void (
        sessionKey ? runForSession(sessionKey, handleSafely) : restored.then(handleSafely)
      ).catch((error: unknown) => {
        console.warn('[okova] DRM session storage failed', error);
        sendResponse();
      });
      return true;
    });
  },
});
