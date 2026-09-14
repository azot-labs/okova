import type { StoredCapture } from '@/utils/storage/capture-history';
import { popupHistory } from './history';
import {
  appStorage,
  StoredCredentials,
  FailedCredentials,
  CredentialsSnapshot,
  defaultSettings,
  Settings,
} from '@/utils/storage';
import { getDrmFailureStorage, type DrmFailure } from '@/utils/storage';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

const credentialsImportWarningSignal = createSignal<string>();
export const useCredentialsImportWarning = () => credentialsImportWarningSignal;

const credentialsSignal = createSignal<StoredCredentials[]>([]);
export const useCredentials = () => credentialsSignal;

const failedCredentialsSignal = createSignal<FailedCredentials[]>([]);
export const useFailedCredentials = () => failedCredentialsSignal;

const activeCredentialsSignal = createSignal<StoredCredentials[]>([]);
export const useActiveCredentials = () => activeCredentialsSignal;

export const syncCredentials = (snapshot: CredentialsSnapshot) => {
  credentialsSignal[1](snapshot.credentials);
  failedCredentialsSignal[1](snapshot.failedCredentials);
  activeCredentialsSignal[1](
    snapshot.credentials.filter((entry) =>
      Object.values(snapshot.activeCredentialsIds).includes(entry.id),
    ),
  );
};

const capturesSignal = createSignal<StoredCapture[]>([]);
export const useCaptures = () => capturesSignal;

const drmFailureSignal = createSignal<DrmFailure | null>(null);
export const useDrmFailure = () => drmFailureSignal;

const activeTabUrlSignal = createSignal<string | null>(null);
export const useActiveTabUrl = () => activeTabUrlSignal;

const settingsStore = createStore<Settings>(defaultSettings);
export const useSettings = () => settingsStore;

export const useSyncStateWithStorage = () => {
  const [, setSettings] = useSettings();
  const [, setActiveTabUrl] = useActiveTabUrl();

  const [, setDrmFailure] = useDrmFailure();
  let unwatchFailure: (() => void) | undefined;
  let isDisposed = false;
  const disposers: (() => void)[] = [];
  onCleanup(() => {
    isDisposed = true;
    for (const dispose of disposers) dispose();
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

    if (isDisposed) return;
    appStorage.credentials.getSnapshot().then((snapshot) => {
      if (!isDisposed) syncCredentials(snapshot);
    });
    let activeTabGeneration = 0;
    const syncTab = async () => {
      const generation = ++activeTabGeneration;
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (isDisposed || generation !== activeTabGeneration) return;
      unwatchFailure?.();
      setActiveTabUrl(tab?.url ?? null);
      setDrmFailure(null);
      if (tab?.id === undefined) return;
      const failureStorage = getDrmFailureStorage(tab.id);
      unwatchFailure = failureStorage.watch((failure) => setDrmFailure(failure));
      const failure = await failureStorage.getValue();
      if (!isDisposed && generation === activeTabGeneration) setDrmFailure(failure);
    };
    void syncTab();
    browser.tabs.onActivated.addListener(syncTab);
    browser.tabs.onUpdated.addListener(syncTab);
    let hasUpdate = false;
    const syncCaptures = (captures: StoredCapture[]) => {
      capturesSignal[1](captures);
    };
    const unwatch = popupHistory.captures.watch((captures) => {
      hasUpdate = true;
      syncCaptures(captures);
    });
    disposers.push(() => {
      unwatch();
      browser.tabs.onActivated.removeListener(syncTab);
      browser.tabs.onUpdated.removeListener(syncTab);
    });
    const captures = await popupHistory.captures.getValue();
    if (!isDisposed && !hasUpdate) syncCaptures(captures);
  });
};
