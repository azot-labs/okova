import { beforeEach, afterEach, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import background from '../../src/extension/entrypoints/background';
import { appStorage } from '../../src/extension/utils/storage';

const initData =
  'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
const sender: Browser.runtime.MessageSender = { frameId: 0, documentId: 'document' };
export const pendingRecords = async () =>
  Object.entries(await browser.storage.session.get(null)).filter(([key]) =>
    key.startsWith('pending-session:'),
  );

export const startWorker = () => {
  const now = Date.now();
  vi.clearAllTimers();
  vi.setSystemTime(now);
  const listener = vi.spyOn(browser.runtime.onMessage, 'addListener');
  background.main();
  const onMessage = listener.mock.calls.at(-1)![0];
  return (action: string, token = 'one', extra: Record<string, unknown> = {}) =>
    new Promise<unknown>((resolve) => {
      onMessage(
        {
          action,
          keySystem: 'com.widevine.alpha',
          sessionToken: token,
          initData,
          initDataType: 'cenc',
          url: 'https://example.com/video',
          ...extra,
        },
        sender,
        resolve,
      );
    });
};

export const setupWorkerTests = () => {
  beforeEach(async () => {
    fakeBrowser.reset();
    vi.useFakeTimers();
    vi.spyOn(browser.tabs, 'query').mockImplementation(async () => []);
    await appStorage.settings.setValue({
      spoofing: true,
      emeInterception: true,
      requestInterception: false,
      theme: 'auto',
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
};
