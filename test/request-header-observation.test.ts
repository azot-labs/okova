import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  appStorage,
  defaultSettings,
  keyRecordToken,
  type KeyInfo,
} from '../src/extension/utils/storage';
import { installRequestHeaderObservation } from '../src/extension/utils/request-header-observation';

beforeEach(() => {
  fakeBrowser.reset();
  vi.useFakeTimers();
  vi.setSystemTime(1000);
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
const key: KeyInfo = {
  id: 'id',
  value: 'key',
  url: 'https://example.com/watch',
  pssh: 'data',
  createdAt: 1000,
  mpd: 'https://example.com/manifest',
};
const headers = [{ name: 'Cookie', value: 'session=test' }];
const setup = () => {
  const settings =
    Promise.withResolvers<Awaited<ReturnType<typeof appStorage.settings.getValue>>>();
  vi.spyOn(appStorage.settings, 'getValue').mockReturnValue(settings.promise);
  const watch = vi.spyOn(appStorage.settings, 'watch').mockImplementation(() => () => {});
  const send = vi
    .spyOn(browser.webRequest.onSendHeaders, 'addListener')
    .mockImplementation(() => {});
  vi.spyOn(browser.webRequest.onBeforeRedirect, 'addListener').mockImplementation(() => {});
  vi.spyOn(browser.webRequest.onErrorOccurred, 'addListener').mockImplementation(() => {});
  const observer = installRequestHeaderObservation();
  const onSend = send.mock.calls[0]?.[0];
  const onSettings = watch.mock.calls[0]?.[0];
  if (!onSend || !onSettings) throw new Error('Missing observation listeners');
  onSend({
    documentLifecycle: 'active',
    frameType: 'outermost_frame',
    requestId: 'first',
    tabId: 1,
    frameId: 0,
    parentFrameId: -1,
    timeStamp: 1000,
    method: 'GET',
    url: key.mpd ?? '',
    type: 'xmlhttprequest',
    requestHeaders: headers,
  });
  return { settings, observer, onSettings };
};

test('retains the first request, page supplement and capture while settings load', async () => {
  const { settings, observer } = setup();
  observer.observePage(
    {
      url: key.mpd,
      headers: [{ name: 'Authorization', value: 'Bearer test' }],
      startedAt: 999,
      completedAt: 1000,
    },
    1,
    0,
  );
  observer.capture([key], 1, 0, false);
  settings.resolve(defaultSettings);
  await settings.promise;
  expect(await observer.read(keyRecordToken(key), key.mpd ?? '', false)).toEqual([
    ...headers,
    { name: 'Authorization', value: 'Bearer test' },
  ]);
});

test.each(['disabled', 'failed'] as const)(
  'discards startup headers when settings are %s',
  async (outcome) => {
    const { settings, observer, onSettings } = setup();
    observer.capture([key], 1, 0, false);
    if (outcome === 'disabled')
      settings.resolve({ ...defaultSettings, requestInterception: false });
    else settings.reject(new Error('storage unavailable'));
    await settings.promise.catch(() => {});
    expect(await observer.read(keyRecordToken(key), key.mpd ?? '', false)).toEqual([]);
    onSettings(defaultSettings, null);
    expect(await observer.read(keyRecordToken(key), key.mpd ?? '', false)).toEqual([]);
  },
);

test('a settings change wins over the pending startup read', async () => {
  const { settings, observer, onSettings } = setup();
  observer.capture([key], 1, 0, false);
  onSettings({ ...defaultSettings, requestInterception: false }, null);
  settings.resolve(defaultSettings);
  await settings.promise;
  expect(await observer.read(keyRecordToken(key), key.mpd ?? '', false)).toEqual([]);
});
