import { getManifestMetadata } from '@/utils/manifest';
import { getCredentialFingerprint } from '@/utils/credential-fingerprint';
import {
  clearCaptureDiagnostics,
  closeCaptureDiagnostics,
  diagnosticOrigin,
  getCaptureDiagnosticsStorage,
  saveCaptureDiagnostic,
  type CaptureDiagnostic,
} from '@/utils/session-diagnostics';
import {
  getBadgeAppearance,
  getBadgeDrmSystem,
  getBadgeKey,
  getBadgeStorage,
  type BadgeResult,
} from '@/utils/badge';
import {
  appStorage,
  getKeyHistory,
  privateHistory,
  clearClosedPrivateHistory,
  defaultSettings,
  credentialsInfoSchema,
  serializeCredentials,
  deserializeCredentials,
  getRecentKeysForUrl,
  isCapturedKey,
} from '@/utils/storage';
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
  Remote,
} from '@okova/lib';
import { parseCertificate } from '@okova/lib/widevine/certificate';
import { SignedDrmCertificate, SignedMessage } from '@okova/lib/widevine/proto';
import { isServiceCertificate as isWidevineServiceCertificate } from '@okova/lib/widevine/message';
import { WidevineClientCredentials } from '@okova/lib/widevine/client-credentials';
import { withAbort } from '@okova/lib/abort';
import { CLIENT_KEY_SYSTEMS, normalizeKeySystem } from '@okova/lib/key-system';
import { Session } from '@okova/lib/api';
import { RemoteCredentials } from '@okova/lib/remote/credentials';
import type { Credentials } from '@/utils/storage';
import { z } from 'zod';
import { getPsshKeyIds, parsePsshBoxes, PSSH_SYSTEM_IDS } from '@okova/lib/pssh';
import type {} from '@/utils/eme-runtime';
import { syncInterceptionScripts } from '@/utils/interception-scripts';
import { getCaptureUrl } from '@/utils/capture-url';
import { parseClearKeyResponse } from '@/utils/clearkey';

const REQUEST_TIMEOUT_MS = 25_000;
const EXPLICIT_CLOSE_REASON = new Error('DRM request closed');
const SESSION_IDLE_TIMEOUT_MS = 5 * 60_000;

const SESSION_STORAGE_PREFIX = 'pending-session:';
const storedSessionSchema = z.object({
  state: z.string(),
  credentials: credentialsInfoSchema,
  tabId: z.number().optional(),
  expiresAt: z.number(),
  serverCertificate: z.string().optional(),
  challenge: z.string(),
  captureId: z.string().optional(),
});

type SessionEntry = {
  credentials: z.infer<typeof storedSessionSchema>['credentials'];
  captureId?: string;
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
    const clearPrivateHistory = () => {
      void clearClosedPrivateHistory().catch((error: unknown) =>
        console.warn('[okova] Unable to clear private history', error),
      );
    };
    browser.windows.onCreated.addListener(clearPrivateHistory);
    browser.windows.onRemoved.addListener(clearPrivateHistory);
    clearPrivateHistory();

    let scriptUpdates = Promise.resolve();
    const updateInterceptionScripts = () => {
      scriptUpdates = scriptUpdates
        .then(syncInterceptionScripts)
        .catch((error) => console.warn('[okova] Startup script registration failed', error));
    };
    appStorage.settings.watch(updateInterceptionScripts);
    updateInterceptionScripts();
    browser.runtime.onInstalled.addListener(() => {
      updateInterceptionScripts();
      void navigator.locks
        .request('okova:settings', async () => {
          if (!(await appStorage.settings.getValue())) {
            await appStorage.settings.setValue(defaultSettings);
          }
        })
        .catch((error) => console.warn('[okova] Settings initialization failed', error));
    });

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
            if (entry.tabId !== undefined)
              void closeCaptureDiagnostics(entry.tabId, id).catch(() => {});
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
          credentials: entry.credentials,
          tabId: entry.tabId,
          expiresAt: entry.expiresAt,
          serverCertificate: entry.serverCertificate,
          challenge: entry.challenge,
          captureId: entry.captureId,
        } satisfies z.infer<typeof storedSessionSchema>,
      });
      // A lifecycle close can interrupt an in-flight storage write.
      if (state.sessions.get(id) !== entry) {
        await browser.storage.session.remove(SESSION_STORAGE_PREFIX + id);
        throw new Error('DRM session closed');
      }
    };

    const createCdm = (credentials: Credentials) => {
      if (credentials instanceof RemoteCredentials) {
        // Leave time for multi-request operations inside the extension's 25s deadline.
        return new Remote({
          ...credentials.config,
          requestTimeoutMs: Math.min(credentials.config.requestTimeoutMs ?? 7_000, 7_000),
        });
      }
      if (credentials instanceof WidevineClientCredentials)
        return new Widevine({ clientCredentials: credentials });
      return new PlayReady({ clientCredentials: credentials });
    };

    const closeRestoredSession = (session: Session) => {
      void session.close().catch((error: unknown) => {
        console.warn('[okova] Unable to close restored DRM session', error);
      });
    };

    const invalidatedTabs = new Set<number>();
    let isRestoring = true;
    const restored = (async () => {
      const records = await browser.storage.session.get(null);
      for (const [key, value] of Object.entries(records)) {
        if (!key.startsWith(SESSION_STORAGE_PREFIX)) continue;
        const id = key.slice(SESSION_STORAGE_PREFIX.length);
        try {
          // Pending sessions from earlier versions used `client` for credential data.
          const record = storedSessionSchema.parse(
            typeof value === 'object' &&
              value !== null &&
              'client' in value &&
              !('credentials' in value)
              ? { ...value, credentials: value.client }
              : value,
          );
          if (record.expiresAt <= Date.now()) {
            if (record.tabId !== undefined) await closeCaptureDiagnostics(record.tabId, id);
            await browser.storage.session.remove(key);
            if (record.credentials.type === 'remote') {
              const credentials = await RemoteCredentials.from(record.credentials.config);
              closeRestoredSession(Session.resume(record.state, createCdm(credentials)));
            }
            continue;
          }
          const credentials = await deserializeCredentials(record.credentials);
          if (!credentials) throw new Error('Stored credentials are unavailable');
          const engine = createCdm(credentials);
          if (record.serverCertificate && engine.keySystem === 'com.widevine.alpha') {
            await engine.setServerCertificate(fromBase64(record.serverCertificate).toBuffer());
          }
          const session = Session.resume(record.state, engine);
          if (record.tabId !== undefined && invalidatedTabs.has(record.tabId)) {
            await browser.storage.session.remove(key);
            closeRestoredSession(session);
            continue;
          }
          state.sessions.set(id, {
            ...record,
            tabId: record.tabId,
            serverCertificate: record.serverCertificate,
            session,
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
      void closeCaptureDiagnostics(tabId).catch(() => {});
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
          // Close active sessions immediately; cancelled credentials loads cannot open new ones.
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
      void clearCaptureDiagnostics(tabId).catch(() => {});
      void (badgeUpdates.get(tabId) ?? Promise.resolve())
        .catch(() => {})
        .then(() => getBadgeStorage(tabId).removeValue())
        .catch((error: unknown) => console.warn('[okova] Unable to clear badge', error));
    });

    const loadCredentials = async () => {
      console.log('[okova] Loading DRM credentials...');
      const credentials = await appStorage.credentials.active.getValue();
      if (credentials) {
        console.log('[okova] DRM credentials loaded');
        return credentials;
      } else {
        console.log('[okova] Unable to load credentials');
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
          const history = await getKeyHistory(tab?.incognito === true, tab?.windowId);
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
            history.recentKeys.getValue(),
            history.recentKeysByDomain.getValue(),
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

    privateHistory.recentKeys.watch(updateActiveTabBadgesInBackground);
    privateHistory.recentKeysByDomain.watch(updateActiveTabBadgesInBackground);

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

    browser.runtime.onMessage.addListener((incoming, sender, sendResponse) => {
      const message = { ...incoming, url: getCaptureUrl(sender) ?? incoming.url };
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
      let diagnostic: CaptureDiagnostic | undefined;
      let isNewCapture = false;
      const saveDiagnostic = async () => {
        if (!diagnostic || tabId === undefined) return;
        try {
          await saveCaptureDiagnostic(
            tabId,
            diagnostic,
            () => tabGeneration === (tabGenerations.get(tabId) ?? 0),
            isNewCapture,
          );
        } catch {
          // Diagnostics must not prevent playback when storage is unavailable.
        } finally {
          isNewCapture = false;
        }
      };
      const advance = async (next: DrmStage) => {
        if (diagnostic) {
          const previous = diagnostic.events.at(-1);
          if (previous?.status === 'started') {
            previous.status = 'succeeded';
            previous.completedAt = Date.now();
          }
          diagnostic.events.push({ stage: next, status: 'started', at: Date.now() });
          diagnostic.events = diagnostic.events.slice(-100);
        }
        stage = next;
        await saveDiagnostic();
      };
      const historyReady = getKeyHistory(sender.tab?.incognito === true, sender.tab?.windowId);
      void historyReady.catch(() => {});
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
        const history = await run(historyReady);
        if (message.action === 'load-eme') {
          if (tabId === undefined || sender.frameId === undefined)
            throw new Error('Missing injection frame');
          const token = z.string().uuid().parse(message.token);
          // The token check below also protects Firefox versions without documentIds.
          const target = { tabId, frameIds: [sender.frameId] };
          const settings = (await run(appStorage.settings.getValue())) ?? defaultSettings;
          if (!settings.emeInterception) {
            respond(false);
            return;
          }
          await run(
            browser.scripting.executeScript({
              target,
              world: 'MAIN',
              files: ['/eme-runtime.js'],
              injectImmediately: true,
            }),
          );
          const results = await run(
            browser.scripting.executeScript({
              target,
              world: 'MAIN',
              injectImmediately: true,
              func: (token: string, playback: boolean) =>
                window.__okovaStartEme?.(token, window.__okovaEmeInstaller, playback) ?? false,
              args: [token, settings.spoofing && settings.clientPlayback],
            }),
          );
          respond(results.some((result) => result.result === true));
          return;
        }
        if (message.action === 'playback-keyids') {
          const request = z
            .object({
              keySystem: z.enum([
                'com.widevine.alpha',
                'com.microsoft.playready',
                'com.microsoft.playready.recommendation',
              ]),
              initData: z.string().max(1024 * 1024),
            })
            .parse(message);
          const systemId =
            request.keySystem === CLIENT_KEY_SYSTEMS.widevine
              ? PSSH_SYSTEM_IDS.widevine
              : PSSH_SYSTEM_IDS.playready;
          respond(
            parsePsshBoxes(request.initData)
              .filter((box) => box.systemId === systemId)
              .flatMap(getPsshKeyIds),
          );
          return;
        }
        if (message.action === 'playback-config') {
          const credentials = await run(appStorage.credentials.active.getInfo());
          if (!credentials) respond(null);
          else if (credentials.type === 'remote') respond(credentials.config.keySystem);
          else
            respond(
              credentials.type === 'wvd'
                ? CLIENT_KEY_SYSTEMS.widevine
                : CLIENT_KEY_SYSTEMS.playready,
            );
          return;
        }
        if (message.action === 'close') {
          await advance('close');
          if (sessionKey) await closeSession(sessionKey);
          respond();
          return;
        }
        if (sessionKey) {
          const current = state.sessions.get(sessionKey);
          if (current && current.expiresAt <= Date.now()) {
            if (tabId !== undefined) await closeCaptureDiagnostics(tabId, sessionKey);
            await closeSession(sessionKey);
          }
        }
        const entry = sessionKey ? state.sessions.get(sessionKey) : undefined;
        if (sessionKey && entry) {
          clearTimeout(entry.timer);
          entry.expiresAt = Date.now() + SESSION_IDLE_TIMEOUT_MS;
          entry.timer = scheduleExpiry(sessionKey, entry.expiresAt);
          await advance('storage');
          await run(persistSession(sessionKey, entry));
        }

        await advance('setup');
        const settings = await run(appStorage.settings.getValue());
        const setRecentKeys = async (keys: KeyInfo[]) => {
          await run(history.recentKeys.setForUrl(message.url, keys));
          updateBadgeForTabInBackground(sender.tab);
        };

        // Inspect each response so repeated initialization data can yield new keys.
        if (
          settings?.emeInterception &&
          message.action === 'update' &&
          message.keySystem === 'org.w3.clearkey'
        ) {
          await advance('license');
          const clearKeys = parseClearKeyResponse(parseBinary(message.message));
          if (clearKeys?.length) {
            const results = clearKeys.map((key) => ({
              ...key,
              captureId: diagnostic?.captureId,
              drmSystem: system,
              url: message.url,
              ...getManifestMetadata(message),
              pssh: message.initData,
              createdAt: Date.now(),
            }));
            await advance('history');
            if (diagnostic) {
              diagnostic.outcome = 'keys-returned';
              diagnostic.keyCount = results.length;
            }
            await setRecentKeys(results);
            await run(history.allKeys.add(...results));
            await run(clearFailure());
            await recordBadgeResult({ kind: 'success', system, keys: results.map(getBadgeKey) });
            await advance('close');
            if (sessionKey) await closeSession(sessionKey);
            respond({ keys: results });
            return;
          }
          if (diagnostic) {
            if (clearKeys) await advance('keys');
            diagnostic.outcome = clearKeys ? 'no-content-keys' : 'failed';
            const last = diagnostic.events.at(-1);
            if (last) {
              last.status = 'failed';
              last.completedAt = Date.now();
            }
          }
        }

        const { initData } = message;

        if (settings?.emeInterception && message.action === 'keystatuseschange') {
          const keyStatuses = message.keyStatuses as Record<string, string>;
          const keys = Object.entries(keyStatuses).map(([id, status]) => ({
            captureId: diagnostic?.captureId,
            drmSystem: system,
            id: fromBase64(id).toHex(),
            value: status,
            url: message.url,
            ...getManifestMetadata(message),
            pssh: message.initData,
            createdAt: new Date().getTime(),
          }));
          await advance('history');
          const recentKeys = getRecentKeysForUrl(
            message.url,
            await run(history.recentKeysByDomain.getValue()),
            await run(history.recentKeys.getValue()),
          );
          // Status events must not replace extracted keys or borrow another capture's metadata.
          const capturedKeys = recentKeys.filter(
            (key) => isCapturedKey(key) && key.url === message.url && key.pssh === initData,
          );
          const capturedIds = new Set(capturedKeys.map((key) => key.id));
          await setRecentKeys([...capturedKeys, ...keys.filter((key) => !capturedIds.has(key.id))]);
          await run(history.allKeys.add(...keys));
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
          await advance('credentials');
          const credentials = await run(loadCredentials());
          if (!credentials)
            throw new Error(
              'No active DRM credentials. Import or select credentials in the popup.',
            );
          const credentialsInfo = await run(serializeCredentials(credentials));
          if (diagnostic) {
            diagnostic.credential = {
              type: credentialsInfo.type,
              name: credentials.label,
              keySystem:
                credentialsInfo.type === 'remote'
                  ? credentialsInfo.config.keySystem
                  : credentialsInfo.type === 'wvd'
                    ? 'com.widevine.alpha'
                    : 'com.microsoft.playready',
              fingerprint: await getCredentialFingerprint(credentialsInfo).catch(() => ''),
            };
            diagnostic.outcome = 'pending';
          }
          const cdm = createCdm(credentials);
          if (typeof message.keySystem !== 'string') throw new Error('DRM key system is required');
          if (normalizeKeySystem(message.keySystem) !== cdm.keySystem) {
            throw new Error(
              `Selected credentials use ${cdm.keySystem}. Select credentials for ${message.keySystem} in the popup.`,
            );
          }
          const serverCertificate =
            typeof message.serverCertificate === 'string' ? message.serverCertificate : undefined;
          if (serverCertificate && cdm.keySystem === 'com.widevine.alpha') {
            await advance('certificate');
            await run(cdm.setServerCertificate(fromBase64(serverCertificate).toBuffer()));
          }
          await advance('session');
          setSupportedEngines([cdm]);
          const keySystemAccess = await requestMediaKeySystemAccess(cdm.keySystem, [{}]);
          const mediaKeys = await run(keySystemAccess.createMediaKeys());
          const session = mediaKeys.createSession();
          // Close after five minutes of inactivity, including silently removed frames.
          const expiresAt = Date.now() + SESSION_IDLE_TIMEOUT_MS;
          const timer = scheduleExpiry(sessionKey, expiresAt);
          const entry: SessionEntry = {
            session,
            credentials: credentialsInfo,
            captureId: diagnostic?.captureId,
            expiresAt,
            challenge: '',
            tabId: sender.tab?.id,
            timer,
            serverCertificate,
          };
          state.sessions.set(sessionKey, entry);
          await advance('challenge');
          await run(session.generateRequest(message.initDataType, fromBase64(initData).toBuffer()));
          if (diagnostic) diagnostic.sessionId = session.sessionId;
          entry.challenge = fromBuffer(await run(session.waitForLicenseRequest())).toBase64();
          await advance('storage');
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
          await advance('challenge');
          const serverCertificate = message.serverCertificate;
          if (
            session.engine.keySystem === 'com.widevine.alpha' &&
            typeof serverCertificate === 'string' &&
            serverCertificate !== sessionEntry.serverCertificate
          ) {
            await advance('certificate');
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
            await advance('challenge');
            sessionEntry.challenge = fromBuffer(
              await run(session.waitForLicenseRequest()),
            ).toBase64();
          }
          await advance('storage');
          await run(persistSession(sessionKey, sessionEntry));
          respond(sessionEntry.challenge);
        } else if (message.action === 'update') {
          const response = parseBinary(message.message);
          const isServiceCertificate =
            session.engine.keySystem === 'com.widevine.alpha' &&
            isWidevineServiceCertificate(response);
          await advance(isServiceCertificate ? 'certificate' : 'license');
          await run(session.update(response));
          if (isServiceCertificate) {
            await advance('challenge');
            sessionEntry.challenge = fromBuffer(
              await run(session.waitForLicenseRequest()),
            ).toBase64();
            await advance('storage');
            await run(persistSession(sessionKey, sessionEntry));
            respond({ challenge: sessionEntry.challenge });
            return;
          }

          await advance('keys');
          const keys = new Map(session.keys);
          if (!keys.size) throw new NoContentKeysError();
          const results = Array.from(keys, ([id, value]) => ({
            captureId: diagnostic?.captureId ?? sessionEntry.captureId,
            drmSystem: system,
            id,
            value,
            url: message.url,
            ...getManifestMetadata(message),
            pssh: message.initData,
            createdAt: new Date().getTime(),
          }));
          await advance('history');
          if (diagnostic) {
            diagnostic.outcome = 'keys-returned';
            diagnostic.keyCount = results.length;
          }
          await setRecentKeys(results);
          await run(history.allKeys.add(...results));
          await run(clearFailure());
          await recordBadgeResult({ kind: 'success', system, keys: results.map(getBadgeKey) });
          await advance('close');
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
          if (
            tabId !== undefined &&
            sessionKey &&
            ['generateRequest', 'license-request', 'update', 'keystatuseschange', 'close'].includes(
              message.action,
            )
          ) {
            try {
              const records = await getCaptureDiagnosticsStorage(tabId).getValue();
              diagnostic = records?.find((record) => record.owner === sessionKey);
              if (
                !diagnostic &&
                !state.sessions.get(sessionKey)?.captureId &&
                ['generateRequest', 'update', 'keystatuseschange'].includes(message.action)
              ) {
                isNewCapture = true;
                diagnostic = {
                  captureId: crypto.randomUUID(),
                  owner: sessionKey,
                  createdAt: Date.now(),
                  origin: diagnosticOrigin(sender.tab?.url ?? message.url),
                  frameOrigin: diagnosticOrigin(sender.url),
                  frameId: sender.frameId ?? null,
                  documentId: sender.documentId ?? null,
                  keySystem: String(message.keySystem).slice(0, 100),
                  credential: null,
                  sessionId: null,
                  outcome: 'observed',
                  keyCount: 0,
                  events: [{ stage: 'eme', status: 'succeeded', at: Date.now() }],
                };
              }
              await saveDiagnostic();
            } catch {
              /* Capture remains usable if diagnostics storage fails. */
            }
          }
          await handleMessage();
          if (diagnostic) {
            const last = diagnostic.events.at(-1);
            if (last?.status === 'started') {
              last.status = 'succeeded';
              last.completedAt = Date.now();
            }
            if (message.action === 'close' && diagnostic.outcome === 'pending')
              diagnostic.outcome = 'closed';
          }
        } catch (error: unknown) {
          if (diagnostic) {
            const last = diagnostic.events.at(-1);
            if (last) {
              last.status =
                controller.signal.reason === EXPLICIT_CLOSE_REASON ? 'interrupted' : 'failed';
              last.completedAt = Date.now();
            }
            diagnostic.outcome =
              controller.signal.reason === EXPLICIT_CLOSE_REASON
                ? 'closed'
                : error instanceof NoContentKeysError
                  ? 'no-content-keys'
                  : controller.signal.aborted
                    ? 'timed-out'
                    : 'failed';
          }
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
          await saveDiagnostic();
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
