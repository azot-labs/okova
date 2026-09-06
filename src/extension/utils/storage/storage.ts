import { storage } from '#imports';
import { z } from 'zod';
import { remoteConfigSchema } from '@okova/lib/remote/config';
import { RemoteClient } from '../remote-client';
import { WidevineDeviceCredentials } from '../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../lib/playready/device-credentials';
import { fromBase64, fromBuffer } from '../../../lib';
import { asJson } from './utils';

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

export type Settings = {
  spoofing: boolean;
  clientPlayback: boolean;
  emeInterception: boolean;
  requestInterception: boolean;
  theme: ThemeMode;
};

export type ThemeMode = 'light' | 'dark' | 'auto';

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
  } else {
    return null;
  }
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

const storedSettings = asJson(
  storage.defineItem<Omit<Settings, 'clientPlayback'> & { clientPlayback?: boolean }>(
    'local:settings',
  ),
);

const normalizeSettings = (
  settings: Awaited<ReturnType<typeof storedSettings.getValue>>,
): Settings | null =>
  settings ? { ...settings, clientPlayback: settings.clientPlayback ?? false } : null;

export const appStorage = {
  settings: {
    ...storedSettings,
    getValue: async () => normalizeSettings(await storedSettings.getValue()),
    watch: (callback: (newValue: Settings | null, oldValue: Settings | null) => void) =>
      storedSettings.watch((newValue, oldValue) =>
        callback(normalizeSettings(newValue), normalizeSettings(oldValue)),
      ),
  },

  recentKeys: {
    ...recentKeys,
    setValue: (keys: KeyInfo[]) => mutateKeyHistory(() => recentKeys.setValue(keys)),
  },
  recentKeysByDomain: {
    raw: asJson(storage.defineItem<RecentKeysByDomain>('local:recent-keys-by-domain')),
    setValue: (keys: RecentKeysByDomain) =>
      mutateKeyHistory(() => appStorage.recentKeysByDomain.raw.setValue(keys)),
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
        await appStorage.recentKeysByDomain.raw.setValue({ ...keysByDomain, [domain]: keys });
      });
    },
  },
  allKeys: {
    raw: asJson(storage.defineItem<KeyInfo[]>('local:all-keys')),
    setValue: (keys: KeyInfo[]) => mutateKeyHistory(() => appStorage.allKeys.raw.setValue(keys)),
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
        await appStorage.allKeys.raw.setValue(keys);
      }),
    remove: (key: KeyInfo) =>
      mutateKeyHistory(async () => {
        const keys = (await appStorage.allKeys.getValue()) || [];
        const index = keys.findIndex(
          (storedKey) =>
            storedKey.id === key.id &&
            storedKey.value === key.value &&
            storedKey.pssh === key.pssh &&
            storedKey.url === key.url,
        );
        if (index === -1) return;
        keys.splice(index, 1);
        await appStorage.allKeys.raw.setValue(keys);
      }),
  },

  clients: {
    raw: asJson(storage.defineItem<string[] | ClientInfo[]>('local:clients')),
    active: {
      raw: storage.defineItem<string | ClientInfo>('local:active-client'),
      setValue: async (client: Client | null) => {
        if (!client) return appStorage.clients.active.raw.setValue(null);
        const info = await fromClientToInfo(client);
        return appStorage.clients.active.raw.setValue(info);
      },
      getValue: async () => {
        const clientInfo = await appStorage.clients.active.raw.getValue();
        if (!clientInfo) return null;
        if (typeof clientInfo === 'string') {
          // Deprecated
          const client = await WidevineDeviceCredentials.from({
            wvd: fromBase64(clientInfo).toBuffer(),
          });
          return client;
        } else {
          return fromInfoToClient(clientInfo);
        }
      },
    },
    setValue: async (clients: Client[]) => {
      const values: ClientInfo[] = [];
      for (const client of clients) {
        values.push(await fromClientToInfo(client));
      }
      return appStorage.clients.raw.setValue(values);
    },
    getValue: async () => {
      const values = await appStorage.clients.raw.getValue();
      if (!values) return [];
      const clients = [];
      for (const value of values) {
        if (typeof value === 'string') {
          // Deprecated
          const client = await WidevineDeviceCredentials.fromPacked(fromBase64(value).toBuffer());
          clients.push(client);
        } else {
          const client = await fromInfoToClient(value);
          if (client) clients.push(client);
        }
      }
      return clients;
    },
    add: async (client: Client) => {
      const clients = await appStorage.clients.getValue();
      clients.push(client);
      await appStorage.clients.setValue(clients);
    },
    remove: async (client: Client) => {
      const clients = await appStorage.clients.getValue();
      const index = clients.findIndex((c) => c.filename === client.filename);
      if (index === -1) return;
      clients.splice(index, 1);
      await appStorage.clients.setValue(clients);
    },
  },
};
