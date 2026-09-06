import {
  getBadgeAppearance,
  getBadgeDrmSystem,
  getBadgeKey,
  getBadgeStorage,
  type BadgeResult,
} from '@/utils/badge';
import { appStorage, getRecentKeysForUrl, isCapturedKey } from '@/utils/storage';
import { getDrmFailureStorage } from '@/utils/storage';
import type { DrmStage, KeyInfo } from '@/utils/storage';
import {
  fromBase64,
  fromBuffer,
  PlayReady,
  NoContentKeysError,
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
import { withAbort } from '@okova/lib/abort';
import { normalizeKeySystem } from '@okova/lib/key-system';
import { Session } from '@okova/lib/api';
import { z } from 'zod';
import { parseClearKeyResponse } from '@/utils/clearkey';

const REQUEST_TIMEOUT_MS = 25_000;
const EXPLICIT_CLOSE_REASON = new Error('DRM request closed');
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

    const activeRequests = new Map<string, AbortController>();
    const tabGenerations = new Map<number, number>();
    const closeTabSessions = (tabId: number) => {
      tabGenerations.set(tabId, (tabGenerations.get(tabId) ?? 0) + 1);
      void getDrmFailureStorage(tabId)
        .removeValue()
        .catch((error: unknown) => {
          console.warn('[okova] Unable to clear DRM diagnostic', error);
        });
      if (isRestoring) invalidatedTabs.add(tabId);
      for (const id of new Set([
        ...state.sessions.keys(),
        ...pending.keys(),
        ...activeRequests.keys(),
      ])) {
        const owner: unknown = JSON.parse(id);
        if (Array.isArray(owner) && owner[0] === tabId) {
          activeRequests.get(id)?.abort(new Error('Tab closed or navigated'));
          // Close active sessions immediately; cancelled client loads cannot open new ones.
          const closing = state.sessions.has(id)
            ? closeSession(id)
            : runForSession(id, () => closeSession(id));
          void closing.catch((error: unknown) => {
            console.warn('[okova] Unable to close tab DRM session', error);
          });
        }
      }
    };
    browser.tabs.onRemoved.addListener((tabId) => {
      closeTabSessions(tabId);
      void (badgeUpdates.get(tabId) ?? Promise.resolve())
        .catch(() => {})
        .then(() => getBadgeStorage(tabId).removeValue())
        .catch((error: unknown) => console.warn('[okova] Unable to clear badge', error));
    });

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

    // Serialize badge writes so an older refresh cannot overwrite a newer result or navigation.
    const badgeUpdates = new Map<number, Promise<void>>();
    const updateBadgeForTab = (tab?: Browser.tabs.Tab | null, result?: BadgeResult | null) => {
      const tabId = tab?.id;
      if (typeof tabId !== 'number') return Promise.resolve();
      const update = (badgeUpdates.get(tabId) ?? Promise.resolve())
        .catch(() => {})
        .then(async () => {
          const badgeStorage = getBadgeStorage(tabId);
          if (result === null) await badgeStorage.removeValue();
          else if (result) {
            const previous = (await badgeStorage.getValue()) ?? [];
            await badgeStorage.setValue([
              ...previous.filter((entry) => entry.system !== result.system),
              result,
            ]);
          }
          const [recentKeys, recentKeysByDomain, storedResult] = await Promise.all([
            appStorage.recentKeys.getValue(),
            appStorage.recentKeysByDomain.getValue(),
            badgeStorage.getValue(),
          ]);
          const keys = getRecentKeysForUrl(tab?.url, recentKeysByDomain, recentKeys);
          const badge = getBadgeAppearance(keys, storedResult);
          await browser.action.setBadgeBackgroundColor({ tabId, color: badge.color });
          await browser.action.setBadgeTextColor?.({ tabId, color: '#FFFFFF' });
          await browser.action.setTitle({ tabId, title: badge.title });
          await browser.action.setBadgeText({ tabId, text: badge.text });
        });
      badgeUpdates.set(tabId, update);
      const cleanup = () => {
        if (badgeUpdates.get(tabId) === update) badgeUpdates.delete(tabId);
      };
      void update.then(cleanup, cleanup);
      return update;
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
      const results = await Promise.allSettled(activeTabs.map((tab) => updateBadgeForTab(tab)));
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
      if (changeInfo.status === 'loading' || changeInfo.url) {
        closeTabSessions(tabId);
        void updateBadgeForTab(tab, null).catch((error: unknown) => {
          console.warn('[okova] Unable to reset badge', error);
        });
      }
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
      if (message.action === 'close' && sessionKey) {
        activeRequests.get(sessionKey)?.abort(EXPLICIT_CLOSE_REASON);
      }
      const controller = new AbortController();
      let hasResponded = false;
      const respond = (response?: unknown) => {
        if (hasResponded) return;
        hasResponded = true;
        clearTimeout(timer);
        sendResponse(response);
      };
      // Include time spent queued behind session work or worker restoration.
      const timer = setTimeout(() => {
        controller.abort(new Error(`DRM request timed out after ${REQUEST_TIMEOUT_MS}ms`));
        respond();
      }, REQUEST_TIMEOUT_MS);
      const run = <T>(operation: T | Promise<T>) =>
        withAbort(Promise.resolve(operation), controller.signal);
      let stage: DrmStage = 'setup';
      const tabId = sender.tab?.id;
      const tabGeneration = tabId === undefined ? 0 : (tabGenerations.get(tabId) ?? 0);
      const system = getBadgeDrmSystem(message.keySystem);
      const recordBadgeResult = async (result: BadgeResult) => {
        if (tabId === undefined || tabGeneration !== (tabGenerations.get(tabId) ?? 0)) return;
        try {
          await updateBadgeForTab(sender.tab, result);
        } catch (error) {
          console.warn('[okova] Unable to update badge result', error);
        }
      };
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
          respond();
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
          await run(persistSession(sessionKey, entry));
        }
        console.log('[okova] Received message', message);

        stage = 'setup';
        const settings = await run(appStorage.settings.getValue());
        const setRecentKeys = async (keys: KeyInfo[]) => {
          await run(appStorage.recentKeys.setValue(keys));
          await run(appStorage.recentKeysByDomain.setForUrl(message.url, keys));
          updateBadgeForTabInBackground(sender.tab);
        };

        // Inspect each response so repeated initialization data can yield new keys.
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
              drmSystem: system,
              url: message.url,
              mpd: message.mpd,
              pssh: message.initData,
              createdAt: Date.now(),
            }));
            stage = 'history';
            await setRecentKeys(results);
            await run(appStorage.allKeys.add(...results));
            await run(clearFailure());
            await recordBadgeResult({ kind: 'success', system, keys: results.map(getBadgeKey) });
            stage = 'close';
            if (sessionKey) await closeSession(sessionKey);
            respond({ keys: results });
            return;
          }
        }

        const { initData } = message;

        if (settings?.emeInterception && message.action === 'keystatuseschange') {
          const keyStatuses = message.keyStatuses as Record<string, string>;
          const keys = Object.entries(keyStatuses).map(([id, status]) => ({
            drmSystem: system,
            id: fromBase64(id).toHex(),
            value: status,
            url: message.url,
            mpd: message.mpd,
            pssh: message.initData,
            createdAt: new Date().getTime(),
          }));
          stage = 'history';
          const recentKeys = getRecentKeysForUrl(
            message.url,
            await run(appStorage.recentKeysByDomain.getValue()),
            await run(appStorage.recentKeys.getValue()),
          );
          // Status events must not replace extracted keys or borrow another capture's metadata.
          const capturedKeys = recentKeys.filter(
            (key) => isCapturedKey(key) && key.url === message.url && key.pssh === initData,
          );
          const capturedIds = new Set(capturedKeys.map((key) => key.id));
          await setRecentKeys([...capturedKeys, ...keys.filter((key) => !capturedIds.has(key.id))]);
          await run(appStorage.allKeys.add(...keys));
          await run(clearFailure());
          respond();
          return;
        }

        if (message.keySystem === 'org.w3.clearkey') {
          respond();
          return;
        }

        if (!settings?.spoofing) {
          console.log('[okova] Spoofing disabled, skipping message...');
          respond();
          return;
        }

        if (!sessionKey) {
          respond();
          return;
        }

        if (message.action === 'generateRequest') {
          if (state.sessions.has(sessionKey)) {
            respond();
            return;
          }
          await run(clearFailure());
          stage = 'client';
          const cdm = await run(loadCdm());
          if (!cdm)
            throw new Error('No active DRM client. Import or select a client in the popup.');
          if (typeof message.keySystem !== 'string') throw new Error('DRM key system is required');
          if (normalizeKeySystem(message.keySystem) !== cdm.keySystem) {
            throw new Error(
              `Selected client uses ${cdm.keySystem}. Select a client for ${message.keySystem} in the popup.`,
            );
          }
          const serverCertificate =
            typeof message.serverCertificate === 'string' ? message.serverCertificate : undefined;
          if (serverCertificate && cdm instanceof Widevine) {
            stage = 'certificate';
            await run(cdm.setServerCertificate(fromBase64(serverCertificate).toBuffer()));
          }
          stage = 'session';
          setSupportedEngines([cdm]);
          const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
          const mediaKeys = await run(keySystemAccess.createMediaKeys());
          const clientData = fromBuffer(await run(cdm.deviceCredentials.pack())).toBase64();
          const session = mediaKeys.createSession();
          // Close after five minutes of inactivity, including silently removed frames.
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
          await run(session.generateRequest(message.initDataType, fromBase64(initData).toBuffer()));
          entry.challenge = fromBuffer(await run(session.waitForLicenseRequest())).toBase64();
          stage = 'storage';
          await run(persistSession(sessionKey, entry));
          respond();
          return;
        }

        const sessionEntry = state.sessions.get(sessionKey);
        if (!sessionEntry) {
          respond();
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
            const { signedDrmCertificate } = await run(parseCertificate(serverCertificate));
            // Replace any session-level override and regenerate with the new certificate.
            await run(
              session.update(
                toBufferSource(
                  SignedMessage.encode({
                    type: SignedMessage.MessageType.SERVICE_CERTIFICATE,
                    msg: SignedDrmCertificate.encode(signedDrmCertificate).finish(),
                  }).finish(),
                ),
              ),
            );
            sessionEntry.serverCertificate = serverCertificate;
            stage = 'challenge';
            sessionEntry.challenge = fromBuffer(
              await run(session.waitForLicenseRequest()),
            ).toBase64();
          }
          stage = 'storage';
          await run(persistSession(sessionKey, sessionEntry));
          respond(sessionEntry.challenge);
        } else if (message.action === 'update') {
          stage = 'license';
          const response = parseBinary(message.message);
          const isServiceCertificate =
            session.engine instanceof Widevine && getMessageType(response) === 5;
          if (isServiceCertificate) stage = 'certificate';
          await run(session.update(response));
          if (isServiceCertificate) {
            stage = 'challenge';
            sessionEntry.challenge = fromBuffer(
              await run(session.waitForLicenseRequest()),
            ).toBase64();
            stage = 'storage';
            await run(persistSession(sessionKey, sessionEntry));
            respond();
            return;
          }

          stage = 'keys';
          const keys = new Map(session.keys);
          if (!keys.size) throw new NoContentKeysError();
          const results = Array.from(keys, ([id, value]) => ({
            drmSystem: system,
            id,
            value,
            url: message.url,
            mpd: message.mpd,
            pssh: message.initData,
            createdAt: new Date().getTime(),
          }));
          stage = 'history';
          await setRecentKeys(results);
          await run(appStorage.allKeys.add(...results));
          await run(clearFailure());
          await recordBadgeResult({ kind: 'success', system, keys: results.map(getBadgeKey) });
          stage = 'close';
          await closeSession(sessionKey);
          respond({ keys: results });
        } else {
          respond();
        }
      };
      const handleSafely = async () => {
        // A timed-out queued request must not mutate or close another request's session.
        if (controller.signal.aborted) return;
        if (sessionKey) activeRequests.set(sessionKey, controller);
        try {
          if (tabId !== undefined && tabGeneration !== (tabGenerations.get(tabId) ?? 0)) {
            respond();
            return;
          }
          await handleMessage();
        } catch (error: unknown) {
          const isExplicitClose = controller.signal.reason === EXPLICIT_CLOSE_REASON;
          if (!isExplicitClose) console.warn('[okova] DRM request failed at', stage, error);
          try {
            if (
              !isExplicitClose &&
              tabId !== undefined &&
              tabGeneration === (tabGenerations.get(tabId) ?? 0)
            ) {
              await getDrmFailureStorage(tabId).setValue({
                stage,
                error: error instanceof Error ? error.message : String(error),
                url: sender.tab?.url ?? message.url ?? '',
                createdAt: Date.now(),
              });
              await recordBadgeResult({
                kind: 'failure',
                system,
                error: error instanceof Error ? error.message : String(error),
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
          respond();
        } finally {
          clearTimeout(timer);
          if (sessionKey && activeRequests.get(sessionKey) === controller)
            activeRequests.delete(sessionKey);
        }
      };
      void (
        sessionKey ? runForSession(sessionKey, handleSafely) : restored.then(handleSafely)
      ).catch((error: unknown) => {
        console.warn('[okova] DRM session storage failed', error);
        respond();
      });
      return true;
    });
  },
});
