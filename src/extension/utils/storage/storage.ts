import { storage } from '#imports';
import { WidevineClient } from '../../../lib/widevine/client';
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
    raw: asJson(storage.defineItem<string[]>('local:clients')),
    active: {
      raw: storage.defineItem<string>('local:active-client'),
      setValue: async (client: WidevineClient | null) => {
        if (!client) return appStorage.clients.active.raw.setValue(null);
        const clientBase64 = fromBuffer(await client.pack()).toBase64();
        return appStorage.clients.active.raw.setValue(clientBase64);
      },
      getValue: async () => {
        const clientBase64 = await appStorage.clients.active.raw.getValue();
        if (!clientBase64) return null;
        const client = await WidevineClient.fromPacked(
          fromBase64(clientBase64).toBuffer(),
        );
        return client;
      },
    },
    setValue: async (clients: WidevineClient[]) => {
      const values = [];
      for (const client of clients) {
        const clientBuffer = await client.pack();
        const clientBase64 = fromBuffer(clientBuffer).toBase64();
        values.push(clientBase64);
      }
      return appStorage.clients.raw.setValue(values);
    },
    getValue: async () => {
      const values = await appStorage.clients.raw.getValue();
      if (!values) return [];
      const clients = [];
      for (const value of values) {
        const client = await WidevineClient.fromPacked(
          fromBase64(value).toBuffer(),
        );
        clients.push(client);
      }
      return clients;
    },
    add: async (client: WidevineClient) => {
      const clients = await appStorage.clients.getValue();
      clients.push(client);
      await appStorage.clients.setValue(clients);
    },
    remove: async (client: WidevineClient) => {
      const clients = await appStorage.clients.getValue();
      const index = clients.findIndex(
        (c) => c.info.get('model_name') === client.info.get('model_name'),
      );
      if (index === -1) return;
      clients.splice(index, 1);
      await appStorage.clients.setValue(clients);
    },
  },
};
