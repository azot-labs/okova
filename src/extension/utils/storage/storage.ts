import { storage } from '#imports';
import { z } from 'zod';
import { remoteConfigSchema } from '@okova/lib/remote/config';
import { RemoteClient } from '../remote-client';
import { WidevineDeviceCredentials } from '../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../lib/playready/device-credentials';
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

export const drmStages = {
  setup: 'Request setup',
  client: 'Client loading',
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

export type Client = WidevineDeviceCredentials | PlayReadyDeviceCredentials | RemoteClient;
export const clientInfoSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wvd'), data: z.string() }),
  z.object({ type: z.literal('prd'), data: z.string() }),
  z.object({ type: z.literal('remote'), config: remoteConfigSchema }),
]);
export type ClientInfo = z.infer<typeof clientInfoSchema>;

export const fromInfoToClient = async (info: ClientInfo) => {
  if (info.type === 'remote') return RemoteClient.from(info.config);
  const data = fromBase64(info.data).toBuffer();
  if (info.type === 'prd') {
    return await PlayReadyDeviceCredentials.from({ prd: data });
  } else if (info.type === 'wvd') {
    return await WidevineDeviceCredentials.from({ wvd: data });
  }
  throw new Error('Unsupported client type');
};

export const fromClientToInfo = async (client: Client): Promise<ClientInfo> => {
  if (client instanceof RemoteClient) return { type: 'remote', config: client.config };
  const type = client instanceof PlayReadyDeviceCredentials ? 'prd' : 'wvd';
  const data = fromBuffer(await client.pack()).toBase64();
  return { type, data };
};

// A shared browser lock serializes background and popup writes, including clears.
// Call raw setters inside the lock to avoid acquiring the same lock recursively.
const mutateKeyHistory = (mutation: () => Promise<void>) =>
  navigator.locks.request('okova:key-history', mutation);

const recentKeys = asJson(storage.defineItem<KeyInfo[]>('local:recent-keys'));

const clientRegistrySchema = z.object({
  clients: z.array(z.object({ id: z.string(), info: clientInfoSchema })),
  activeClientId: z.string().nullable(),
});
type ClientRegistry = z.infer<typeof clientRegistrySchema>;
export type StoredClient = { id: string; client: Client };
export type ClientSnapshot = { clients: StoredClient[]; activeClientId: string | null };
const clientRegistry = storage.defineItem<ClientRegistry>('local:client-registry');
const legacyClients = asJson(storage.defineItem<(string | ClientInfo)[]>('local:clients'));
const legacyActiveClient = storage.defineItem<string | ClientInfo>('local:active-client');
const withClientLock = <T>(operation: () => Promise<T>) =>
  navigator.locks.request('okova:clients', operation);
const sameClientInfo = (left: ClientInfo, right: ClientInfo) =>
  JSON.stringify(left) === JSON.stringify(right);

// Keep legacy data as a backup. Once written, the registry is the only source of truth.
const readClientRegistry = async (): Promise<ClientRegistry> => {
  const stored = await clientRegistry.getValue();
  if (stored) return clientRegistrySchema.parse(stored);
  const registry: ClientRegistry = { clients: [], activeClientId: null };
  const normalizeLegacy = async (value: string | ClientInfo) => {
    const info = typeof value === 'string' ? { type: 'wvd' as const, data: value } : value;
    return fromClientToInfo(await fromInfoToClient(clientInfoSchema.parse(info)));
  };
  for (const value of (await legacyClients.getValue()) ?? []) {
    const info = await normalizeLegacy(value);
    if (!registry.clients.some((entry) => sameClientInfo(entry.info, info))) {
      registry.clients.push({ id: crypto.randomUUID(), info });
    }
  }
  const active = await legacyActiveClient.getValue();
  if (active) {
    const info = await normalizeLegacy(active);
    let entry = registry.clients.find((entry) => sameClientInfo(entry.info, info));
    if (!entry) {
      entry = { id: crypto.randomUUID(), info };
      registry.clients.push(entry);
    }
    registry.activeClientId = entry.id;
  } else {
    registry.activeClientId = registry.clients[0]?.id ?? null;
  }
  return registry;
};

const decodeClientRegistry = async (registry: ClientRegistry): Promise<ClientSnapshot> => ({
  clients: await Promise.all(
    registry.clients.map(async (entry) => ({
      id: entry.id,
      client: await fromInfoToClient(entry.info),
    })),
  ),
  activeClientId: registry.activeClientId,
});

const saveClientRegistry = async (registry: ClientRegistry, settings?: Settings) => {
  // Parse before committing so a decoding failure cannot leave the popup behind storage.
  const snapshot = await decodeClientRegistry(registry);
  await storage.setItems([
    { key: clientRegistry.key, value: registry },
    ...(settings ? [{ key: storedSettings.key, value: JSON.stringify(settings) }] : []),
  ]);
  return snapshot;
};

const addClient = (client: Client, enablePlayback = false) =>
  withClientLock(async () => {
    const registry = await readClientRegistry();
    const info = await fromClientToInfo(client);
    if (registry.clients.some((entry) => sameClientInfo(entry.info, info))) {
      throw new Error('This client is already imported');
    }
    if (registry.clients.length >= 10) throw new Error('You can add a maximum of 10 clients');
    const isFirstClient = registry.clients.length === 0;
    const entry = { id: crypto.randomUUID(), info };
    registry.clients.push(entry);
    registry.activeClientId ??= entry.id;
    const settings =
      enablePlayback && isFirstClient
        ? {
            ...defaultSettings,
            ...(await storedSettings.getValue()),
            emeInterception: true,
            spoofing: true,
            clientPlayback: true,
          }
        : undefined;
    const snapshot = await saveClientRegistry(registry, settings);
    return { ...snapshot, settings };
  });

const clientStorage = {
  getSnapshot: () =>
    withClientLock(async () => {
      const registry = await readClientRegistry();
      if (!(await clientRegistry.getValue())) return saveClientRegistry(registry);
      return decodeClientRegistry(registry);
    }),
  getValue: async () => (await clientStorage.getSnapshot()).clients.map((entry) => entry.client),
  add: (client: Client) => addClient(client),
  import: (client: Client) => addClient(client, true),
  select: (id: string | null) =>
    withClientLock(async () => {
      const registry = await readClientRegistry();
      if (id !== null && !registry.clients.some((entry) => entry.id === id)) {
        throw new Error('Client is no longer available');
      }
      return saveClientRegistry({ ...registry, activeClientId: id });
    }),
  remove: (client: string | Client) =>
    withClientLock(async () => {
      const registry = await readClientRegistry();
      const info = typeof client === 'string' ? null : await fromClientToInfo(client);
      const id =
        typeof client === 'string'
          ? client
          : registry.clients.find((entry) => info && sameClientInfo(entry.info, info))?.id;
      const clients = registry.clients.filter((entry) => entry.id !== id);
      const activeClientId =
        registry.activeClientId === id ? (clients[0]?.id ?? null) : registry.activeClientId;
      return saveClientRegistry({ clients, activeClientId });
    }),
  active: {
    getInfo: () =>
      withClientLock(async () => {
        const registry = await readClientRegistry();
        return registry.clients.find((entry) => entry.id === registry.activeClientId)?.info ?? null;
      }),
    getValue: async (): Promise<Client | null> => {
      const info = await clientStorage.active.getInfo();
      return info ? fromInfoToClient(info) : null;
    },
    // Library-side callers may supply a client before adding it to the popup list.
    setValue: (client: Client | null) =>
      withClientLock(async () => {
        const registry = await readClientRegistry();
        if (!client) return saveClientRegistry({ ...registry, activeClientId: null });
        const info = await fromClientToInfo(client);
        let entry = registry.clients.find((entry) => sameClientInfo(entry.info, info));
        if (!entry) {
          entry = { id: crypto.randomUUID(), info };
          registry.clients.push(entry);
        }
        return saveClientRegistry({ ...registry, activeClientId: entry.id });
      }),
  },
};

export const appStorage = {
  settings: settingsStorage,

  recentKeys: {
    ...recentKeys,
    setValue: (keys: KeyInfo[]) => mutateKeyHistory(() => recentKeys.setValue(retainKeys(keys))),
  },
  recentKeysByDomain: {
    raw: asJson(storage.defineItem<RecentKeysByDomain>('local:recent-keys-by-domain')),
    setValue: (keys: RecentKeysByDomain) =>
      mutateKeyHistory(() => appStorage.recentKeysByDomain.raw.setValue(retainDomains(keys))),
    getValue: async () => {
      return appStorage.recentKeysByDomain.raw.getValue();
    },
    watch: (
      callback: (newValue: RecentKeysByDomain | null, oldValue: RecentKeysByDomain | null) => void,
    ) => {
      return appStorage.recentKeysByDomain.raw.watch(callback);
    },
    clear: () => mutateKeyHistory(() => appStorage.recentKeysByDomain.raw.setValue({})),
    setForUrl: async (url: string | undefined, keys: KeyInfo[]) => {
      const domain = getWebsiteDomain(url);
      if (!domain) return;

      await mutateKeyHistory(async () => {
        const keysByDomain = (await appStorage.recentKeysByDomain.getValue()) || {};
        await appStorage.recentKeysByDomain.raw.setValue(
          retainDomains({ ...keysByDomain, [domain]: keys }),
        );
      });
    },
  },
  allKeys: {
    raw: asJson(storage.defineItem<KeyInfo[]>('local:all-keys')),
    setValue: (keys: KeyInfo[]) =>
      mutateKeyHistory(() => appStorage.allKeys.raw.setValue(retainKeys(keys))),
    getValue: async () => {
      return appStorage.allKeys.raw.getValue();
    },
    clear: () =>
      mutateKeyHistory(async () => {
        await appStorage.allKeys.raw.setValue([]);
        await recentKeys.setValue([]);
        await appStorage.recentKeysByDomain.raw.setValue({});
      }),
    add: (...newKeys: KeyInfo[]) =>
      mutateKeyHistory(async () => {
        const keys = (await appStorage.allKeys.getValue()) || [];
        for (const newKey of newKeys) {
          const index = keys.findIndex(
            (key) =>
              key.id === newKey.id &&
              (!isCapturedKey(key) ||
                !isCapturedKey(newKey) ||
                (key.value === newKey.value && key.pssh === newKey.pssh && key.url === newKey.url)),
          );
          if (index === -1) {
            keys.push(newKey);
          } else if (!isCapturedKey(keys[index]!) && isCapturedKey(newKey)) {
            keys[index] = newKey;
          }
        }
        await appStorage.allKeys.raw.setValue(retainKeys(keys));
      }),
    remove: (key: KeyInfo) =>
      mutateKeyHistory(async () => {
        // Match the history identity; recent captures may have newer timestamps.
        const keepRecord = (storedKey: KeyInfo) =>
          storedKey.id !== key.id ||
          storedKey.value !== key.value ||
          storedKey.pssh !== key.pssh ||
          storedKey.url !== key.url;
        const [keys, recent, domains] = await Promise.all([
          appStorage.allKeys.getValue(),
          recentKeys.getValue(),
          appStorage.recentKeysByDomain.getValue(),
        ]);
        await storage.setItems([
          {
            key: appStorage.allKeys.raw.key,
            value: JSON.stringify((keys ?? []).filter(keepRecord)),
          },
          { key: recentKeys.key, value: JSON.stringify((recent ?? []).filter(keepRecord)) },
          {
            key: appStorage.recentKeysByDomain.raw.key,
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

  clients: clientStorage,
};
