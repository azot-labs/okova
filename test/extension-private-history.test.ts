import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  appStorage,
  privateHistory,
  clearClosedPrivateHistory,
  type KeyInfo,
} from '../src/extension/utils/storage';
import { initializePopupHistory } from '../src/extension/entrypoints/popup/utils/history';
import * as popup from '../src/extension/entrypoints/popup/utils/history';

const privateWindow = {
  id: 2,
  incognito: true,
  focused: true,
  alwaysOnTop: false,
  type: 'normal',
  state: 'normal',
} as const;
const key: KeyInfo = {
  id: '00112233445566778899aabbccddeeff',
  value: 'ffeeddccbbaa99887766554433221100',
  url: 'https://example.com/private',
  pssh: 'private-pssh',
  createdAt: 1,
};
const capture = async (history: typeof privateHistory, record: KeyInfo) => {
  await history.recentKeys.setForUrl(record.url, [record]);
  await history.allKeys.add(record);
};

beforeEach(() => {
  fakeBrowser.reset();
  vi.spyOn(browser.windows, 'getAll').mockImplementation(async () => [privateWindow]);
});
afterEach(() => vi.restoreAllMocks());

test('isolates private history, recent caches, watchers, and deletion from local storage', async () => {
  const regularKey = { ...key, url: 'https://example.com/public', pssh: 'public-pssh' };
  await capture(appStorage, regularKey);
  const localBefore = await browser.storage.local.get(null);
  const onRegularHistory = vi.fn();
  const unwatch = appStorage.allKeys.raw.watch(onRegularHistory);
  try {
    await capture(privateHistory, key);
    expect(await privateHistory.allKeys.getValue()).toEqual([key]);
    expect(await privateHistory.recentKeysByDomain.getValue()).toEqual({ 'example.com': [key] });
    expect(await browser.storage.local.get(null)).toEqual(localBefore);
    expect(onRegularHistory).not.toHaveBeenCalled();

    const snapshot = await privateHistory.prepareKeyDeletion({ kind: 'all' });
    expect(snapshot.count).toBe(1);
    await privateHistory.deleteKeySnapshot(snapshot.tokens);
    expect(await privateHistory.allKeys.getValue()).toEqual([]);
    expect(await privateHistory.recentKeys.getValue()).toEqual([]);
    expect(await privateHistory.recentKeysByDomain.getValue()).toEqual({ 'example.com': [] });
    expect(await browser.storage.local.get(null)).toEqual(localBefore);

    await capture(privateHistory, key);
    await appStorage.allKeys.clear();
    expect(await privateHistory.allKeys.getValue()).toEqual([key]);
  } finally {
    unwatch();
  }
});

test('retains private history while a private window exists, then clears it and rejects late writes', async () => {
  await capture(appStorage, key);
  await capture(privateHistory, key);
  await clearClosedPrivateHistory();
  expect(await privateHistory.allKeys.getValue()).toEqual([key]);

  vi.mocked(browser.windows.getAll).mockImplementation(async () => []);
  await clearClosedPrivateHistory();
  await capture(privateHistory, key);
  expect(await privateHistory.allKeys.getValue()).toBeNull();
  expect(await privateHistory.recentKeys.getValue()).toBeNull();
  expect(await privateHistory.recentKeysByDomain.getValue()).toBeNull();
  expect(await appStorage.allKeys.getValue()).toEqual([key]);

  vi.mocked(browser.windows.getAll).mockImplementation(async () => [privateWindow]);
  expect(await privateHistory.allKeys.getValue()).toBeNull();
  await capture(privateHistory, key);
  expect(await privateHistory.allKeys.getValue()).toEqual([key]);
});

test.each([true, false])(
  'selects popup history using the window incognito flag %s',
  async (incognito) => {
    vi.spyOn(browser.windows, 'getCurrent').mockImplementation(async () => ({
      ...privateWindow,
      incognito,
    }));
    await initializePopupHistory();
    expect(popup.popupHistory.allKeys).toBe(
      incognito ? privateHistory.allKeys : appStorage.allKeys,
    );
  },
);
