import { getCaptureDiagnosticsStorage, type CaptureDiagnostic } from '@/utils/session-diagnostics';
import { popupHistory } from './history';
import {
  appStorage,
  StoredCredentials,
  CredentialsSnapshot,
  defaultSettings,
  KeyInfo,
  RecentKeysByDomain,
  Settings,
} from '@/utils/storage';
import { getDrmFailureStorage, type DrmFailure } from '@/utils/storage';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

const credentialsImportWarningSignal = createSignal<string>();
export const useCredentialsImportWarning = () => credentialsImportWarningSignal;

const credentialsSignal = createSignal<StoredCredentials[]>([]);
export const useCredentials = () => credentialsSignal;

const activeCredentialsSignal = createSignal<StoredCredentials | null>(null);
export const useActiveCredentials = () => activeCredentialsSignal;

export const syncCredentials = (snapshot: CredentialsSnapshot) => {
  credentialsSignal[1](snapshot.credentials);
  activeCredentialsSignal[1](
    snapshot.credentials.find((entry) => entry.id === snapshot.activeCredentialsId) ?? null,
  );
};

const recentKeysSignal = createSignal<KeyInfo[]>([]);
export const useRecentKeys = () => recentKeysSignal;

const recentKeysByDomainSignal = createSignal<RecentKeysByDomain>({});
export const useRecentKeysByDomain = () => recentKeysByDomainSignal;

const captureDiagnosticsSignal = createSignal<CaptureDiagnostic[]>([]);
export const useCaptureDiagnostics = () => captureDiagnosticsSignal;

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
  let unwatchDiagnostics: (() => void) | undefined;
  let unwatchFailure: (() => void) | undefined;
  let isDisposed = false;
  onCleanup(() => {
    isDisposed = true;
    unwatchFailure?.();
    unwatchDiagnostics?.();
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

    appStorage.credentials.getSnapshot().then(syncCredentials);
    browser.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
      if (isDisposed) return;
      setActiveTabUrl(tab?.url ?? null);
      setDrmFailure(null);
      if (tab?.id === undefined) return;
      const diagnosticStorage = getCaptureDiagnosticsStorage(tab.id);
      let hasDiagnosticUpdate = false;
      unwatchDiagnostics = diagnosticStorage.watch((records) => {
        hasDiagnosticUpdate = true;
        captureDiagnosticsSignal[1](records ?? []);
      });
      const records = await diagnosticStorage.getValue();
      if (!isDisposed && !hasDiagnosticUpdate) captureDiagnosticsSignal[1](records ?? []);
      if (isDisposed) return;
      const failureStorage = getDrmFailureStorage(tab.id);
      let hasUpdate = false;
      unwatchFailure = failureStorage.watch((failure) => {
        hasUpdate = true;
        setDrmFailure(failure);
      });
      const failure = await failureStorage.getValue();
      if (!isDisposed && !hasUpdate) setDrmFailure(failure);
    });
    popupHistory.recentKeys
      .getValue()
      .then((recentKeys) => recentKeys && setRecentKeys(recentKeys));
    popupHistory.recentKeys.watch((newKeys) => setRecentKeys(newKeys || []));
    popupHistory.recentKeysByDomain
      .getValue()
      .then((recentKeysByDomain) => setRecentKeysByDomain(recentKeysByDomain || {}));
    popupHistory.recentKeysByDomain.watch((newKeysByDomain) =>
      setRecentKeysByDomain(newKeysByDomain || {}),
    );
  });
};
