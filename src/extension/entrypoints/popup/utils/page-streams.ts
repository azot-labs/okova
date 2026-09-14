import { browser } from 'wxt/browser';
import { isManifestUrl } from '@/utils/manifest';
import type { StreamRecord } from '@/utils/streams';
import { getTabStreams } from './streams';

export const createPageStreams = () => {
  const [records, setRecords] = createSignal<StreamRecord[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string>();
  const [notice, setNotice] = createSignal<string>();
  let generation = 0;
  let currentTabId: number | undefined;
  let isDisposed = false;

  const refresh = async () => {
    const request = ++generation;
    setIsLoading(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (isDisposed || request !== generation) return;
      if (tab?.id !== currentTabId) setRecords([]);
      currentTabId = tab?.id;
      if (tab?.id === undefined || !isManifestUrl(tab.url)) {
        setRecords([]);
        setNotice('Open a website to discover more captures.');
        return;
      }
      const result = await getTabStreams(tab.id);
      if (isDisposed || request !== generation) return;
      await Promise.all(
        result.records.flatMap((stream) =>
          [stream.manifest, ...stream.playlists].map((manifest) =>
            browser.runtime.sendMessage({
              action: 'refresh-manifest',
              tabId: tab.id,
              source: {
                url: stream.frameUrl,
                tabId: tab.id,
                frameId: stream.frameId,
                documentId: stream.documentId,
              },
              manifest: { ...manifest, initData: [] },
            }),
          ),
        ),
      );
      if (isDisposed || request !== generation) return;
      setRecords(result.records);
      const notices = [];
      if (result.unavailableFrames)
        notices.push('Some page frames could not be read. Refresh to retry.');
      if (result.limited)
        notices.push('This page exceeds the observation limit; some manifests are omitted.');
      setNotice(notices.join(' ') || undefined);
    } catch {
      if (isDisposed || request !== generation) return;
      setRecords([]);
      setError('Unable to read this page. Reload the website, then refresh this list.');
    } finally {
      if (!isDisposed && request === generation) setIsLoading(false);
    }
  };

  onMount(() => {
    void refresh();
    const onActivated = () => void refresh();
    const onCommitted = ({ tabId }: { tabId: number }) => {
      if (tabId !== currentTabId) return;
      setRecords([]);
      void refresh();
    };
    browser.tabs.onActivated.addListener(onActivated);
    browser.webNavigation.onCommitted.addListener(onCommitted);
    onCleanup(() => {
      isDisposed = true;
      generation++;
      browser.tabs.onActivated.removeListener(onActivated);
      browser.webNavigation.onCommitted.removeListener(onCommitted);
    });
  });

  return { records, refresh, isLoading, error, notice };
};
