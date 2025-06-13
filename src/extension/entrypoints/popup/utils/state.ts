import { appStorage, KeyInfo, Settings } from '@/utils/storage';
import { WidevineClient } from '@orlan/lib/widevine/client';
import { createSignal } from 'solid-js';

const clientsSignal = createSignal<WidevineClient[]>([]);
export const useClients = () => clientsSignal;

const activeClientSignal = createSignal<WidevineClient | null>(null);
export const useActiveClient = () => activeClientSignal;

const recentKeysSignal = createSignal<KeyInfo[]>([]);
export const useRecentKeys = () => recentKeysSignal;

const defaultSettings: Settings = {
  emeInterception: true,
  spoofing: false,
  requestInterception: false,
};
const settingsStore = createStore<Settings>(defaultSettings);
export const useSettings = () => settingsStore;

export const useSyncStateWithStorage = () => {
  const [, setSettings] = useSettings();
  const [, setClients] = useClients();
  const [, setActiveClient] = useActiveClient();
  const [, setRecentKeys] = useRecentKeys();

  onMount(async () => {
    const settings = await appStorage.settings.getValue();
    if (settings) setSettings(settings);
    else appStorage.settings.setValue(defaultSettings);

    appStorage.clients.getValue().then((clients) => setClients(clients));
    appStorage.recentKeys
      .getValue()
      .then((recentKeys) => recentKeys && setRecentKeys(recentKeys));
    appStorage.recentKeys.watch((newKeys) => setRecentKeys(newKeys || []));
    appStorage.clients.active
      .getValue()
      .then((activeClient) => activeClient && setActiveClient(activeClient));
  });
};
