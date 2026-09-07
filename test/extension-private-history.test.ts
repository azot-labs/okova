import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  appStorage,
  privateHistory,
  clearClosedPrivateHistory,
  getKeyHistory,
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
    expect(popup.popupHistory.allKeys.raw.key).toBe(
      (incognito ? privateHistory : appStorage).allKeys.raw.key,
    );
  },
);

test('rejects captures bound to a closed generation after a replacement session starts', async () => {
  const oldHistory = await getKeyHistory(true, privateWindow.id);
  await capture(oldHistory, key);
  await capture(appStorage, key);
  vi.mocked(browser.windows.getAll).mockImplementation(async () => []);
  await clearClosedPrivateHistory();
  vi.mocked(browser.windows.getAll).mockImplementation(async () => [{ ...privateWindow, id: 3 }]);
  const replacementHistory = await getKeyHistory(true, 3);
  const replacementKey = { ...key, pssh: 'replacement', createdAt: 2 };
  await capture(replacementHistory, replacementKey);

  await capture(oldHistory, key);
  await oldHistory.allKeys.clear();
  const closedWindowHistory = await getKeyHistory(true, privateWindow.id);
  await capture(closedWindowHistory, key);

  expect(await replacementHistory.allKeys.getValue()).toEqual([replacementKey]);
  expect(await replacementHistory.recentKeys.getValue()).toEqual([replacementKey]);
  expect(await replacementHistory.recentKeysByDomain.getValue()).toEqual({
    'example.com': [replacementKey],
  });
  expect(await appStorage.allKeys.getValue()).toEqual([key]);
});

test('orders a delayed closure snapshot before replacement-session captures', async () => {
  const oldHistory = await getKeyHistory(true, privateWindow.id);
  await capture(oldHistory, key);
  const snapshot = Promise.withResolvers<Browser.windows.Window[]>();
  vi.mocked(browser.windows.getAll).mockImplementationOnce(() => snapshot.promise);
  const clearing = clearClosedPrivateHistory();
  vi.mocked(browser.windows.getAll).mockImplementation(async () => [{ ...privateWindow, id: 3 }]);
  const replacementKey = { ...key, pssh: 'replacement', createdAt: 2 };
  const capturing = Promise.resolve(getKeyHistory(true, 3)).then((history) =>
    capture(history, replacementKey),
  );
  snapshot.resolve([]);
  await Promise.all([clearing, capturing]);
  expect(await privateHistory.allKeys.getValue()).toEqual([replacementKey]);
  expect(await privateHistory.recentKeys.getValue()).toEqual([replacementKey]);
  expect(await privateHistory.recentKeysByDomain.getValue()).toEqual({
    'example.com': [replacementKey],
  });
});

test('keeps a generation while private windows overlap and across history-handle recreation', async () => {
  const firstHistory = await getKeyHistory(true, privateWindow.id);
  await capture(firstHistory, key);
  vi.mocked(browser.windows.getAll).mockImplementation(async () => [
    privateWindow,
    { ...privateWindow, id: 3 },
  ]);
  await clearClosedPrivateHistory();
  vi.mocked(browser.windows.getAll).mockImplementation(async () => [{ ...privateWindow, id: 3 }]);
  await clearClosedPrivateHistory();
  const restoredHistory = await getKeyHistory(true, 3);
  expect(await restoredHistory.allKeys.getValue()).toEqual([key]);
  const laterKey = { ...key, id: 'another-id', createdAt: 2 };
  await firstHistory.allKeys.add(laterKey);
  expect(await restoredHistory.allKeys.getValue()).toEqual([key, laterKey]);
});

test('does not apply an old cleanup snapshot after another context advances the generation', async () => {
  await capture(await getKeyHistory(true, privateWindow.id), key);
  const locked = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const holding = navigator.locks.request('okova:incognito-key-history', async () => {
    locked.resolve();
    await release.promise;
  });
  await locked.promise;
  vi.mocked(browser.windows.getAll).mockImplementation(async () => [{ ...privateWindow, id: 3 }]);
  const replacement = getKeyHistory(true, 3);
  vi.mocked(browser.windows.getAll).mockImplementationOnce(async () => []);
  const clearing = clearClosedPrivateHistory();
  release.resolve();
  const history = await replacement;
  await Promise.all([holding, clearing]);
  const replacementKey = { ...key, pssh: 'replacement', createdAt: 2 };
  await capture(history, replacementKey);
  expect(await history.allKeys.getValue()).toEqual([replacementKey]);
  expect(await history.recentKeys.getValue()).toEqual([replacementKey]);
});
