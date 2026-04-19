import { appStorage, Client, KeyInfo, RecentKeysByDomain, Settings } from '@/utils/storage';
import { createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

const clientsSignal = createSignal<Client[]>([]);
export const useClients = () => clientsSignal;

const activeClientSignal = createSignal<Client | null>(null);
export const useActiveClient = () => activeClientSignal;

const recentKeysSignal = createSignal<KeyInfo[]>([]);
export const useRecentKeys = () => recentKeysSignal;

const recentKeysByDomainSignal = createSignal<RecentKeysByDomain>({});
export const useRecentKeysByDomain = () => recentKeysByDomainSignal;

const activeTabUrlSignal = createSignal<string | null>(null);
export const useActiveTabUrl = () => activeTabUrlSignal;

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
  const [, setRecentKeysByDomain] = useRecentKeysByDomain();
  const [, setActiveTabUrl] = useActiveTabUrl();

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
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => setActiveTabUrl(tab?.url ?? null));
    appStorage.recentKeys.getValue().then((recentKeys) => recentKeys && setRecentKeys(recentKeys));
    appStorage.recentKeys.watch((newKeys) => setRecentKeys(newKeys || []));
    appStorage.recentKeysByDomain
      .getValue()
      .then((recentKeysByDomain) => setRecentKeysByDomain(recentKeysByDomain || {}));
    appStorage.recentKeysByDomain.watch((newKeysByDomain) =>
      setRecentKeysByDomain(newKeysByDomain || {}),
    );
    appStorage.clients.active
      .getValue()
      .then((activeClient) => activeClient && setActiveClient(activeClient));
  });
};
