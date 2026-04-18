import { appStorage, Client, KeyInfo, Settings } from '@/utils/storage';
import { createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

const clientsSignal = createSignal<Client[]>([]);
export const useClients = () => clientsSignal;

const activeClientSignal = createSignal<Client | null>(null);
export const useActiveClient = () => activeClientSignal;

const recentKeysSignal = createSignal<KeyInfo[]>([]);
export const useRecentKeys = () => recentKeysSignal;

const defaultSettings: Settings = {
  emeInterception: true,
  spoofing: false,
  requestInterception: false,
  theme: 'auto',
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
    if (settings) {
      const syncedSettings = { ...defaultSettings, ...settings };
      setSettings(syncedSettings);
      if (!settings.theme) appStorage.settings.setValue(syncedSettings);
    } else {
      appStorage.settings.setValue(defaultSettings);
    }

    appStorage.clients.getValue().then((clients) => setClients(clients));
    appStorage.recentKeys.getValue().then((recentKeys) => recentKeys && setRecentKeys(recentKeys));
    appStorage.recentKeys.watch((newKeys) => setRecentKeys(newKeys || []));
    appStorage.clients.active
      .getValue()
      .then((activeClient) => activeClient && setActiveClient(activeClient));
  });
};
