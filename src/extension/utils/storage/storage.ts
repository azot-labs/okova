import { storage } from '#imports';
import { WidevineClient } from '../../../lib/widevine/client';
import { PlayReadyClient } from '../../../lib/playready/client';
import { fromBase64, fromBuffer } from '../../../lib';
import { asJson } from './utils';

export type KeyInfo = {
  id: string;
  value: string;
  url: string;
  mpd: string;
  pssh: string;
  createdAt: number;
};

export type Settings = {
  spoofing: boolean;
  emeInterception: boolean;
  requestInterception: boolean;
};

export type Client = WidevineClient | PlayReadyClient;
export type ClientInfo =
  | { type: 'wvd'; data: string }
  | { type: 'prd'; data: string };

const fromInfoToClient = async (info: ClientInfo) => {
  const data = fromBase64(info.data).toBuffer();
  if (info.type === 'prd') {
    return await PlayReadyClient.from({ prd: data });
  } else if (info.type === 'wvd') {
    return await WidevineClient.from({ wvd: data });
  } else {
    return null;
  }
};

const fromClientToInfo = async (client: Client): Promise<ClientInfo> => {
  const type = client instanceof PlayReadyClient ? 'prd' : 'wvd';
  const data = fromBuffer(await client.pack()).toBase64();
  return { type, data };
};

export const appStorage = {
  settings: asJson(storage.defineItem<Settings>('local:settings')),

  recentKeys: asJson(storage.defineItem<KeyInfo[]>('local:recent-keys')),
  allKeys: {
    raw: asJson(storage.defineItem<KeyInfo[]>('local:all-keys')),
    setValue: async (keys: KeyInfo[]) => {
      await appStorage.allKeys.raw.setValue(keys);
    },
    getValue: async () => {
      return appStorage.allKeys.raw.getValue();
    },
    clear: async () => {
      await appStorage.allKeys.raw.setValue([]);
      await appStorage.recentKeys.setValue([]);
    },
    add: async (...newKeys: KeyInfo[]) => {
      const keys = (await appStorage.allKeys.getValue()) || [];
      for (const newKey of newKeys) {
        const added = keys.some((key) => key.id === newKey.id);
        if (added) continue;
        keys.push(newKey);
      }
      await appStorage.allKeys.setValue(keys);
    },
    remove: async (key: KeyInfo) => {
      const keys = (await appStorage.allKeys.getValue()) || [];
      keys.splice(
        keys.findIndex((k) => k.id === key.id),
        1,
      );
      await appStorage.allKeys.setValue(keys);
    },
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
          const client = await WidevineClient.from({
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
          const client = await WidevineClient.fromPacked(
            fromBase64(value).toBuffer(),
          );
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
