import type { Credentials } from '../../../lib/credentials';
import { browser, storage } from '#imports';
import { z } from 'zod';
import { remoteCredentialsSchema } from '@okova/lib/remote/credentials';
import { RemoteCredentials } from '../../../lib/remote/credentials';
import { WidevineClientCredentials } from '../../../lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../../../lib/playready/client-credentials';
import { fromBase64, fromBuffer } from '../../../lib';
import { asJson } from './json';
import { defaultSettings, settingsStorage, storedSettings, type Settings } from './settings';

export { defaultSettings, type Settings, type ThemeMode } from './settings';

export type BadgeDrmSystem = 'W' | 'P' | 'C';

export type KeyInfo = {
  drmSystem?: BadgeDrmSystem;
  id: string;
  value: string;
  url: string;
  mpd?: string;
  pssh: string;
  createdAt: number;
};

// Include the capture time so a later capture of the same key survives confirmation.
export const keyRecordToken = (key: KeyInfo) =>
  JSON.stringify([key.id, key.value, key.url, key.pssh, key.createdAt, key.mpd, key.drmSystem]);

export type KeyDeletionScope =
  | { kind: 'all' }
  | { kind: 'site'; domain: string }
  | { kind: 'selected'; records: KeyInfo[] };

const sameKeyRecord = (left: KeyInfo, right: KeyInfo) =>
  left.id === right.id &&
  left.url === right.url &&
  left.pssh === right.pssh &&
  ((!isCapturedKey(left) && !isCapturedKey(right)) || left.value === right.value);

export const drmStages = {
  setup: 'Request setup',
  credentials: 'Credentials loading',
  certificate: 'Server certificate',
  session: 'Session creation',
  challenge: 'Challenge generation',
  license: 'License processing',
  keys: 'Key extraction',
  storage: 'Session storage',
  history: 'Key storage',
  close: 'Session cleanup',
} as const;

export type DrmStage = keyof typeof drmStages;
export type DrmFailure = { stage: DrmStage; error: string; url: string; createdAt: number };

// Session storage keeps diagnostics across popup/worker restarts, but not browser restarts.
export const getDrmFailureStorage = (tabId: number) =>
  storage.defineItem<DrmFailure>(`session:drm-failure:${tabId}`);

export type RecentKeysByDomain = Record<string, KeyInfo[]>;

export const MAX_HISTORY_RECORDS = 1_000;

// Keep input order for the UI; timestamps decide which records survive overflow.
const retainNewest = <T>(records: T[], createdAt: (record: T) => number): T[] => {
  if (records.length <= MAX_HISTORY_RECORDS) return records;
  const oldest = records
    .map((record, index) => ({ index, createdAt: createdAt(record) }))
    .sort((left, right) => left.createdAt - right.createdAt || left.index - right.index);
  const removed = new Set(
    oldest.slice(0, records.length - MAX_HISTORY_RECORDS).map((record) => record.index),
  );
  return records.filter((_, index) => !removed.has(index));
};

const retainKeys = (keys: KeyInfo[]) => retainNewest(keys, (key) => key.createdAt);

// The domain cache has one shared record budget, not 1,000 records per domain.
const retainDomains = (domains: RecentKeysByDomain): RecentKeysByDomain => {
  const entries = Object.entries(domains).flatMap(
    ([domain, keys]): { domain: string; key: KeyInfo | null }[] =>
      keys.length ? keys.map((key) => ({ domain, key })) : [{ domain, key: null }],
  );
  const retained = retainNewest(entries, (entry) => entry.key?.createdAt ?? 0);
  const result: RecentKeysByDomain = Object.create(null);
  for (const { domain, key } of retained) {
    const keys = (result[domain] ??= []);
    if (key) keys.push(key);
  }
  return result;
};

// History also contains EME statuses, which cannot be reused as content keys.
export const isCapturedKey = (key: KeyInfo) => /^[0-9a-f]{32}$/i.test(key.value);

export const getWebsiteDomain = (url?: string | null) => {
  if (!url) return null;

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  } catch {
    return null;
  }
};

export const getRecentKeysForUrl = (
  url: string | undefined | null,
  recentKeysByDomain: RecentKeysByDomain | null | undefined,
  recentKeys: KeyInfo[] | null | undefined,
) => {
  const domain = getWebsiteDomain(url);
  if (!domain) return [];

  const scopedKeys = recentKeysByDomain?.[domain];
  if (scopedKeys) return scopedKeys;

  const legacyKeys = recentKeys ?? [];
  const legacyDomain = getWebsiteDomain(legacyKeys[0]?.url);
  return legacyDomain === domain ? legacyKeys : [];
};

export type { Credentials } from '../../../lib/credentials';
export const credentialsInfoSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wvd'), data: z.string() }),
  z.object({ type: z.literal('prd'), data: z.string() }),
  z.object({ type: z.literal('remote'), config: remoteCredentialsSchema }),
]);
export type CredentialsInfo = z.infer<typeof credentialsInfoSchema>;

export const deserializeCredentials = async (info: CredentialsInfo) => {
  if (info.type === 'remote') return RemoteCredentials.from(info.config);
  const data = fromBase64(info.data).toBuffer();
  if (info.type === 'prd') {
    return await PlayReadyClientCredentials.from({ prd: data });
  } else if (info.type === 'wvd') {
    return await WidevineClientCredentials.from({ wvd: data });
  }
  throw new Error('Unsupported credentials type');
};

export const serializeCredentials = async (credentials: Credentials): Promise<CredentialsInfo> => {
  if (credentials instanceof RemoteCredentials)
    return { type: 'remote', config: credentials.config };
  const type = credentials instanceof PlayReadyClientCredentials ? 'prd' : 'wvd';
  const data = fromBuffer(await credentials.pack()).toBase64();
  return { type, data };
};

const credentialsRegistrySchema = z.object({
  credentials: z.array(z.object({ id: z.string(), info: credentialsInfoSchema })),
  activeCredentialsId: z.string().nullable(),
});
type CredentialsRegistry = z.infer<typeof credentialsRegistrySchema>;
export type StoredCredentials = { id: string; credentials: Credentials };
export type CredentialsSnapshot = {
  credentials: StoredCredentials[];
  activeCredentialsId: string | null;
};
const credentialsRegistry = storage.defineItem<CredentialsRegistry>('local:credentials-registry');
const legacyRegistry = storage.defineItem<unknown>('local:client-registry');
const legacyRegistrySchema = z.object({
  clients: z.array(z.object({ id: z.string(), info: credentialsInfoSchema })),
  activeClientId: z.string().nullable(),
});
const legacyCredentials = asJson(storage.defineItem<(string | CredentialsInfo)[]>('local:clients'));
const legacyActiveCredentials = storage.defineItem<string | CredentialsInfo>('local:active-client');
const withCredentialsLock = <T>(operation: () => Promise<T>) =>
  navigator.locks.request('okova:credentials', operation);
const sameCredentialsInfo = (left: CredentialsInfo, right: CredentialsInfo) =>
  JSON.stringify(left) === JSON.stringify(right);

// Keep legacy data as a backup. Once written, the registry is the only source of truth.
const readCredentialsRegistry = async (): Promise<CredentialsRegistry> => {
  const stored = await credentialsRegistry.getValue();
  if (stored) return credentialsRegistrySchema.parse(stored);
  const previous = await legacyRegistry.getValue();
  if (previous) {
    const legacy = legacyRegistrySchema.parse(previous);
    return { credentials: legacy.clients, activeCredentialsId: legacy.activeClientId };
  }
  const registry: CredentialsRegistry = { credentials: [], activeCredentialsId: null };
  const normalizeLegacy = async (value: string | CredentialsInfo) => {
    const info = typeof value === 'string' ? { type: 'wvd' as const, data: value } : value;
    return serializeCredentials(await deserializeCredentials(credentialsInfoSchema.parse(info)));
  };
  for (const value of (await legacyCredentials.getValue()) ?? []) {
    const info = await normalizeLegacy(value);
    if (!registry.credentials.some((entry) => sameCredentialsInfo(entry.info, info))) {
      registry.credentials.push({ id: crypto.randomUUID(), info });
    }
  }
  const active = await legacyActiveCredentials.getValue();
  if (active) {
    const info = await normalizeLegacy(active);
    let entry = registry.credentials.find((entry) => sameCredentialsInfo(entry.info, info));
    if (!entry) {
      entry = { id: crypto.randomUUID(), info };
      registry.credentials.push(entry);
    }
    registry.activeCredentialsId = entry.id;
  } else {
    registry.activeCredentialsId = registry.credentials[0]?.id ?? null;
  }
  return registry;
};

const decodeCredentialsRegistry = async (
  registry: CredentialsRegistry,
): Promise<CredentialsSnapshot> => ({
  credentials: await Promise.all(
    registry.credentials.map(async (entry) => ({
      id: entry.id,
      credentials: await deserializeCredentials(entry.info),
    })),
  ),
  activeCredentialsId: registry.activeCredentialsId,
});

const saveCredentialsRegistry = async (registry: CredentialsRegistry, settings?: Settings) => {
  // Parse before committing so a decoding failure cannot leave the popup behind storage.
  const snapshot = await decodeCredentialsRegistry(registry);
  await storage.setItems([
    { key: credentialsRegistry.key, value: registry },
    ...(settings ? [{ key: storedSettings.key, value: JSON.stringify(settings) }] : []),
  ]);
  return snapshot;
};

const addCredentials = (credentials: Credentials, enablePlayback = false) =>
  withCredentialsLock(async () => {
    const registry = await readCredentialsRegistry();
    const info = await serializeCredentials(credentials);
    if (registry.credentials.some((entry) => sameCredentialsInfo(entry.info, info))) {
      throw new Error('These credentials are already imported');
    }
    if (registry.credentials.length >= 10)
      throw new Error('You can add a maximum of 10 credentials');
    const isFirstCredentials = registry.credentials.length === 0;
    const entry = { id: crypto.randomUUID(), info };
    registry.credentials.push(entry);
    registry.activeCredentialsId ??= entry.id;
    const settings =
      enablePlayback && isFirstCredentials
        ? {
            ...defaultSettings,
            ...(await storedSettings.getValue()),
            emeInterception: true,
            spoofing: true,
            clientPlayback: true,
          }
        : undefined;
    const snapshot = await saveCredentialsRegistry(registry, settings);
    return { ...snapshot, settings };
  });

const credentialsStorage = {
  getSnapshot: () =>
    withCredentialsLock(async () => {
      const registry = await readCredentialsRegistry();
      if (!(await credentialsRegistry.getValue())) return saveCredentialsRegistry(registry);
      return decodeCredentialsRegistry(registry);
    }),
  getValue: async () =>
    (await credentialsStorage.getSnapshot()).credentials.map((entry) => entry.credentials),
  add: (credentials: Credentials) => addCredentials(credentials),
  import: (credentials: Credentials) => addCredentials(credentials, true),
  select: (id: string | null) =>
    withCredentialsLock(async () => {
      const registry = await readCredentialsRegistry();
      if (id !== null && !registry.credentials.some((entry) => entry.id === id)) {
        throw new Error('Credentials are no longer available');
      }
      return saveCredentialsRegistry({ ...registry, activeCredentialsId: id });
    }),
  remove: (credentials: string | Credentials) =>
    withCredentialsLock(async () => {
      const registry = await readCredentialsRegistry();
      const info = typeof credentials === 'string' ? null : await serializeCredentials(credentials);
      const id =
        typeof credentials === 'string'
          ? credentials
          : registry.credentials.find((entry) => info && sameCredentialsInfo(entry.info, info))?.id;
      const remainingCredentials = registry.credentials.filter((entry) => entry.id !== id);
      const activeCredentialsId =
        registry.activeCredentialsId === id
          ? (remainingCredentials[0]?.id ?? null)
          : registry.activeCredentialsId;
      return saveCredentialsRegistry({ credentials: remainingCredentials, activeCredentialsId });
    }),
  active: {
    getInfo: () =>
      withCredentialsLock(async () => {
        const registry = await readCredentialsRegistry();
        return (
          registry.credentials.find((entry) => entry.id === registry.activeCredentialsId)?.info ??
          null
        );
      }),
    getValue: async (): Promise<Credentials | null> => {
      const info = await credentialsStorage.active.getInfo();
      return info ? deserializeCredentials(info) : null;
    },
    // Library-side callers may supply credentials before adding it to the popup list.
    setValue: (credentials: Credentials | null) =>
      withCredentialsLock(async () => {
        const registry = await readCredentialsRegistry();
        if (!credentials)
          return saveCredentialsRegistry({ ...registry, activeCredentialsId: null });
        const info = await serializeCredentials(credentials);
        let entry = registry.credentials.find((entry) => sameCredentialsInfo(entry.info, info));
        if (!entry) {
          entry = { id: crypto.randomUUID(), info };
          registry.credentials.push(entry);
        }
        return saveCredentialsRegistry({ ...registry, activeCredentialsId: entry.id });
      }),
  },
};

type PrivateSession = { generation: string; windowIds: number[] };
const privateSession = storage.defineItem<PrivateSession>('session:incognito:history-session');
const PRIVATE_HISTORY_LOCK = 'okova:incognito-key-history';
const PRIVATE_HISTORY_KEYS = [
  'session:incognito:all-keys',
  'session:incognito:recent-keys',
  'session:incognito:recent-keys-by-domain',
] as const;

// Queue the observation immediately, before awaiting the window snapshot. Window events,
// capture binding, and writes must observe session transitions in the same lock order.
const withPrivateSession = <T>(operation: (session: PrivateSession | null) => Promise<T>) => {
  const observedSession = privateSession.getValue();
  const windows = browser.windows.getAll();
  return navigator.locks.request(PRIVATE_HISTORY_LOCK, async () => {
    const observedGeneration = (await observedSession)?.generation;
    const previous = await privateSession.getValue();
    // Another extension context may have advanced the generation before this lock.
    // Its records cannot be cleared using a window snapshot from the old generation.
    const snapshot = await windows;
    const currentWindows =
      previous?.generation === observedGeneration ? snapshot : await browser.windows.getAll();
    const windowIds = currentWindows
      .filter((window) => window.incognito)
      .flatMap((window) => (window.id === undefined ? [] : [window.id]));
    const isSameSession = previous?.windowIds.some((id) => windowIds.includes(id));
    let session = previous;
    if (!isSameSession) {
      // Only this generation can own the shared history keys while the lock is held.
      await storage.removeItems([...PRIVATE_HISTORY_KEYS]);
      session = windowIds.length ? { generation: crypto.randomUUID(), windowIds } : null;
    } else if (session) {
      session = { ...session, windowIds };
    }
    if (session) await privateSession.setValue(session);
    else await privateSession.removeValue();
    return operation(session);
  });
};

// Both contexts share extension storage, so private records need their own session keys.
const createKeyHistory = (isIncognito: boolean, generation?: string) => {
  const prefix = isIncognito ? 'session:incognito:' : 'local:';
  const lockName = isIncognito ? PRIVATE_HISTORY_LOCK : 'okova:key-history';
  const mutateKeyHistory = (mutation: () => Promise<void>) => {
    if (!isIncognito) return navigator.locks.request(lockName, mutation);
    const expectedGeneration =
      generation === undefined
        ? withPrivateSession(async (session) => session?.generation)
        : Promise.resolve(generation);
    return withPrivateSession(async (session) => {
      if (!session || session.generation !== (await expectedGeneration)) return;
      await mutation();
    });
  };
  const recentKeys = asJson(storage.defineItem<KeyInfo[]>(`${prefix}recent-keys`));

  // Read all three stores under the writer lock before showing the confirmation.
  const prepareKeyDeletion = (scope: KeyDeletionScope) =>
    navigator.locks.request(lockName, async () => {
      const [history, recent, domains] = await Promise.all([
        keyHistory.allKeys.getValue(),
        keyHistory.recentKeys.getValue(),
        keyHistory.recentKeysByDomain.getValue(),
      ]);
      const records = [
        ...(history ?? []),
        ...(recent ?? []),
        ...Object.values(domains ?? {}).flat(),
      ].filter((key) => {
        switch (scope.kind) {
          case 'all':
            return true;
          case 'site':
            return getWebsiteDomain(key.url) === scope.domain;
          case 'selected':
            return scope.records.some((record) => sameKeyRecord(key, record));
        }
      });
      const unique: KeyInfo[] = [];
      for (const record of records) {
        if (!unique.some((key) => sameKeyRecord(key, record))) unique.push(record);
      }
      return { count: unique.length, tokens: [...new Set(records.map(keyRecordToken))] };
    });

  const deleteKeySnapshot = (tokens: string[]) =>
    mutateKeyHistory(async () => {
      const targets = new Set(tokens);
      const keep = (key: KeyInfo) => !targets.has(keyRecordToken(key));
      const [history, recent, domains] = await Promise.all([
        keyHistory.allKeys.getValue(),
        keyHistory.recentKeys.getValue(),
        keyHistory.recentKeysByDomain.getValue(),
      ]);
      await storage.setItems([
        { key: keyHistory.allKeys.raw.key, value: JSON.stringify((history ?? []).filter(keep)) },
        { key: keyHistory.recentKeys.key, value: JSON.stringify((recent ?? []).filter(keep)) },
        {
          key: keyHistory.recentKeysByDomain.raw.key,
          value: JSON.stringify(
            Object.fromEntries(
              Object.entries(domains ?? {}).map(([domain, records]) => [
                domain,
                records.filter(keep),
              ]),
            ),
          ),
        },
      ]);
    });

  const keyHistory = {
    prepareKeyDeletion,
    deleteKeySnapshot,

    recentKeys: {
      ...recentKeys,
      setValue: (keys: KeyInfo[]) => mutateKeyHistory(() => recentKeys.setValue(retainKeys(keys))),
      setForUrl: (url: string | undefined, keys: KeyInfo[]) =>
        mutateKeyHistory(async () => {
          const domain = getWebsiteDomain(url);
          const items = [{ key: recentKeys.key, value: JSON.stringify(retainKeys(keys)) }];
          if (domain) {
            const domains = (await keyHistory.recentKeysByDomain.getValue()) ?? {};
            items.push({
              key: keyHistory.recentKeysByDomain.raw.key,
              value: JSON.stringify(retainDomains({ ...domains, [domain]: keys })),
            });
          }
          await storage.setItems(items);
        }),
    },
    recentKeysByDomain: {
      raw: asJson(storage.defineItem<RecentKeysByDomain>(`${prefix}recent-keys-by-domain`)),
      setValue: (keys: RecentKeysByDomain) =>
        mutateKeyHistory(() => keyHistory.recentKeysByDomain.raw.setValue(retainDomains(keys))),
      getValue: async () => {
        return keyHistory.recentKeysByDomain.raw.getValue();
      },
      watch: (
        callback: (
          newValue: RecentKeysByDomain | null,
          oldValue: RecentKeysByDomain | null,
        ) => void,
      ) => {
        return keyHistory.recentKeysByDomain.raw.watch(callback);
      },
      clear: () => mutateKeyHistory(() => keyHistory.recentKeysByDomain.raw.setValue({})),
      setForUrl: async (url: string | undefined, keys: KeyInfo[]) => {
        const domain = getWebsiteDomain(url);
        if (!domain) return;

        await mutateKeyHistory(async () => {
          const keysByDomain = (await keyHistory.recentKeysByDomain.getValue()) || {};
          await keyHistory.recentKeysByDomain.raw.setValue(
            retainDomains({ ...keysByDomain, [domain]: keys }),
          );
        });
      },
    },
    allKeys: {
      raw: asJson(storage.defineItem<KeyInfo[]>(`${prefix}all-keys`)),
      setValue: (keys: KeyInfo[]) =>
        mutateKeyHistory(() => keyHistory.allKeys.raw.setValue(retainKeys(keys))),
      getValue: async () => {
        return keyHistory.allKeys.raw.getValue();
      },
      clear: () =>
        mutateKeyHistory(async () => {
          await keyHistory.allKeys.raw.setValue([]);
          await recentKeys.setValue([]);
          await keyHistory.recentKeysByDomain.raw.setValue({});
        }),
      add: (...newKeys: KeyInfo[]) =>
        mutateKeyHistory(async () => {
          const keys = (await keyHistory.allKeys.getValue()) || [];
          for (const newKey of newKeys) {
            const index = keys.findIndex(
              (key) =>
                key.id === newKey.id &&
                (!isCapturedKey(key) ||
                  !isCapturedKey(newKey) ||
                  (key.value === newKey.value &&
                    key.pssh === newKey.pssh &&
                    key.url === newKey.url)),
            );
            if (index === -1) {
              keys.push(newKey);
            } else if (!isCapturedKey(keys[index]!) && isCapturedKey(newKey)) {
              keys[index] = newKey;
            }
          }
          await keyHistory.allKeys.raw.setValue(retainKeys(keys));
        }),
      remove: (key: KeyInfo) =>
        mutateKeyHistory(async () => {
          // Status values can change in recent caches while history retains the original.
          // Captured keys still require an exact value match; timestamps may differ.
          const keepRecord = (storedKey: KeyInfo) =>
            storedKey.id !== key.id ||
            ((isCapturedKey(storedKey) || isCapturedKey(key)) && storedKey.value !== key.value) ||
            storedKey.pssh !== key.pssh ||
            storedKey.url !== key.url;
          const [keys, recent, domains] = await Promise.all([
            keyHistory.allKeys.getValue(),
            recentKeys.getValue(),
            keyHistory.recentKeysByDomain.getValue(),
          ]);
          await storage.setItems([
            {
              key: keyHistory.allKeys.raw.key,
              value: JSON.stringify((keys ?? []).filter(keepRecord)),
            },
            { key: recentKeys.key, value: JSON.stringify((recent ?? []).filter(keepRecord)) },
            {
              key: keyHistory.recentKeysByDomain.raw.key,
              value: JSON.stringify(
                Object.fromEntries(
                  Object.entries(domains ?? {}).map(([domain, records]) => [
                    domain,
                    records.filter(keepRecord),
                  ]),
                ),
              ),
            },
          ]);
        }),
    },
  };

  return keyHistory;
};

export const regularHistory = createKeyHistory(false);
export const privateHistory = createKeyHistory(true);
// Bind before asynchronous capture work, so an old request cannot join a replacement session.
export const getKeyHistory = async (isIncognito: boolean, windowId?: number) => {
  if (!isIncognito) return regularHistory;
  return withPrivateSession(async (session) =>
    createKeyHistory(
      true,
      session && (windowId === undefined || session.windowIds.includes(windowId))
        ? session.generation
        : crypto.randomUUID(),
    ),
  );
};

export const clearClosedPrivateHistory = () => withPrivateSession(async () => {});

export const { prepareKeyDeletion, deleteKeySnapshot } = regularHistory;
export const appStorage = {
  settings: settingsStorage,
  ...regularHistory,
  credentials: credentialsStorage,
};
