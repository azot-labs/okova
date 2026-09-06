import {
  appStorage,
  StoredClient,
  ClientSnapshot,
  defaultSettings,
  KeyInfo,
  RecentKeysByDomain,
  Settings,
} from '@/utils/storage';
import { getDrmFailureStorage, type DrmFailure } from '@/utils/storage';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

const clientImportWarningSignal = createSignal<string>();
export const useClientImportWarning = () => clientImportWarningSignal;

const clientsSignal = createSignal<StoredClient[]>([]);
export const useClients = () => clientsSignal;

const activeClientSignal = createSignal<StoredClient | null>(null);
export const useActiveClient = () => activeClientSignal;

export const syncClients = (snapshot: ClientSnapshot) => {
  clientsSignal[1](snapshot.clients);
  activeClientSignal[1](
    snapshot.clients.find((entry) => entry.id === snapshot.activeClientId) ?? null,
  );
};

const recentKeysSignal = createSignal<KeyInfo[]>([]);
export const useRecentKeys = () => recentKeysSignal;

const recentKeysByDomainSignal = createSignal<RecentKeysByDomain>({});
export const useRecentKeysByDomain = () => recentKeysByDomainSignal;

const drmFailureSignal = createSignal<DrmFailure | null>(null);
export const useDrmFailure = () => drmFailureSignal;

const activeTabUrlSignal = createSignal<string | null>(null);
export const useActiveTabUrl = () => activeTabUrlSignal;

const settingsStore = createStore<Settings>(defaultSettings);
export const useSettings = () => settingsStore;

export const useSyncStateWithStorage = () => {
  const [, setSettings] = useSettings();
  const [, setRecentKeys] = useRecentKeys();
  const [, setRecentKeysByDomain] = useRecentKeysByDomain();
  const [, setActiveTabUrl] = useActiveTabUrl();

  const [, setDrmFailure] = useDrmFailure();
  let unwatchFailure: (() => void) | undefined;
  let isDisposed = false;
  onCleanup(() => {
    isDisposed = true;
    unwatchFailure?.();
  });

  onMount(async () => {
    const settings = await appStorage.settings.getValue();
    if (settings) {
      const syncedSettings = { ...defaultSettings, ...settings };
      setSettings(syncedSettings);
      if (!settings.theme) await appStorage.settings.setValue(syncedSettings);
    } else {
      await appStorage.settings.setValue(defaultSettings);
    }

    appStorage.clients.getSnapshot().then(syncClients);
    browser.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
      if (isDisposed) return;
      setActiveTabUrl(tab?.url ?? null);
      setDrmFailure(null);
      if (tab?.id === undefined) return;
      const failureStorage = getDrmFailureStorage(tab.id);
      let hasUpdate = false;
      unwatchFailure = failureStorage.watch((failure) => {
        hasUpdate = true;
        setDrmFailure(failure);
      });
      const failure = await failureStorage.getValue();
      if (!isDisposed && !hasUpdate) setDrmFailure(failure);
    });
    appStorage.recentKeys.getValue().then((recentKeys) => recentKeys && setRecentKeys(recentKeys));
    appStorage.recentKeys.watch((newKeys) => setRecentKeys(newKeys || []));
    appStorage.recentKeysByDomain
      .getValue()
      .then((recentKeysByDomain) => setRecentKeysByDomain(recentKeysByDomain || {}));
    appStorage.recentKeysByDomain.watch((newKeysByDomain) =>
      setRecentKeysByDomain(newKeysByDomain || {}),
    );
  });
};
