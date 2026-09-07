import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { getCaptureUrl } from '../src/extension/utils/capture-url';
import {
  appStorage,
  defaultSettings,
  getRecentKeysForUrl,
  privateHistory,
} from '../src/extension/utils/storage';
import background from '../src/extension/entrypoints/background';
import { createPsshBox, psshBoxToBase64, PSSH_SYSTEM_IDS } from '../src/lib/pssh';

beforeEach(() => {
  fakeBrowser.reset();
  vi.spyOn(browser.tabs, 'query').mockImplementation(async () => []);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const tab: Browser.tabs.Tab = {
  id: 12,
  index: 0,
  lastAccessed: 0,
  pinned: false,
  highlighted: false,
  windowId: 1,
  active: true,
  incognito: false,
  selected: true,
  discarded: false,
  autoDiscardable: true,
  groupId: -1,
  frozen: false,
};

const start = () => {
  const listen = vi.spyOn(browser.runtime.onMessage, 'addListener');
  background.main();
  const listener = listen.mock.calls[0]![0];
  return (message: Record<string, unknown>, sender: Parameters<typeof listener>[1] = {}) =>
    new Promise<unknown>((resolve) => {
      listener(message, sender, resolve);
    });
};

const widevineId = '00112233445566778899aabbccddeeff';
const playreadyId = 'ffeeddccbbaa99887766554433221100';
const box = (systemId: string, id: string) =>
  psshBoxToBase64(createPsshBox({ systemId, version: 1, keyIds: [id] }));
const initData = btoa(
  atob(box(PSSH_SYSTEM_IDS.widevine, widevineId)) +
    atob(box(PSSH_SYSTEM_IDS.playready, playreadyId)),
);

test.each([
  ['com.widevine.alpha', widevineId],
  ['com.microsoft.playready.recommendation', playreadyId],
  ['com.microsoft.playready', playreadyId],
])('extracts playback key IDs for %s in the worker', async (keySystem, id) => {
  const send = start();
  await expect(send({ action: 'playback-keyids', keySystem, initData })).resolves.toEqual([id]);
});

test.each([
  { keySystem: 'unsupported', initData },
  { keySystem: 'com.widevine.alpha', initData: 'broken' },
  { keySystem: 'com.widevine.alpha', initData: 'A'.repeat(1024 * 1024 + 1) },
])('rejects invalid playback initialization data', async (request) => {
  const send = start();
  await expect(send({ action: 'playback-keyids', ...request })).resolves.toBeUndefined();
});

test('loads only the requesting frame and requires an installation acknowledgement', async () => {
  const execute = vi.spyOn(browser.scripting, 'executeScript');
  execute.mockImplementationOnce(async () => [{ frameId: 3, result: undefined }]);
  execute.mockImplementationOnce(async () => [{ frameId: 3, result: true }]);
  const send = start();
  const token = crypto.randomUUID();
  await expect(send({ action: 'load-eme', token }, { tab, frameId: 3 })).resolves.toBe(true);
  expect(execute).toHaveBeenNthCalledWith(1, {
    target: { tabId: 12, frameIds: [3] },
    world: 'MAIN',
    files: ['/eme-runtime.js'],
    injectImmediately: true,
  });
  expect(execute).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      target: { tabId: 12, frameIds: [3] },
      world: 'MAIN',
      args: [token, false],
    }),
  );
});

test('does not inject for requests without a tab/frame', async () => {
  const execute = vi.spyOn(browser.scripting, 'executeScript');
  const send = start();
  await expect(send({ action: 'load-eme', token: crypto.randomUUID() })).resolves.toBeUndefined();
  expect(execute).not.toHaveBeenCalled();
});

test('reports injection failures without proceeding to installation', async () => {
  const execute = vi
    .spyOn(browser.scripting, 'executeScript')
    .mockRejectedValueOnce(new Error('Frame closed'));
  const send = start();
  await expect(
    send({ action: 'load-eme', token: crypto.randomUUID() }, { tab, frameId: 3 }),
  ).resolves.toBeUndefined();
  expect(execute).toHaveBeenCalledOnce();
});

test('does not load a runtime when stored EME interception is disabled', async () => {
  const execute = vi.spyOn(browser.scripting, 'executeScript');
  await appStorage.settings.setValue({ ...defaultSettings, emeInterception: false });
  const send = start();
  await expect(
    send(
      { action: 'load-eme', token: crypto.randomUUID(), emeInterception: true },
      { tab, frameId: 3 },
    ),
  ).resolves.toBe(false);
  expect(execute).not.toHaveBeenCalled();
});

test.each([
  ['about:blank', 'https://example.com', 'https://example.com/'],
  ['about:srcdoc', 'https://example.com', 'https://example.com/'],
  ['data:text/html,hello', 'null', 'https://example.com/watch'],
  ['blob:https://example.com/uuid', undefined, 'https://example.com/'],
  ['blob:null/uuid', 'null', 'https://example.com/watch'],
  ['https://frame.example/watch', 'https://frame.example', 'https://frame.example/watch'],
])('retains captures from %s under their site', async (url, origin, expectedUrl) => {
  await appStorage.settings.setValue(defaultSettings);
  const send = start();
  const sender = { tab: { ...tab, url: 'https://example.com/watch' }, frameId: 3, url, origin };
  expect(getCaptureUrl(sender)).toBe(expectedUrl);
  const license = new TextEncoder().encode(
    JSON.stringify({
      keys: [
        {
          kty: 'oct',
          kid: 'AAAAAAAAAAAAAAAAAAAAAA',
          k: 'AQEBAQEBAQEBAQEBAQEBAQ',
        },
      ],
    }),
  );
  await send(
    {
      action: 'update',
      keySystem: 'org.w3.clearkey',
      url: 'https://forged.example/',
      message: Object.fromEntries(license.entries()),
    },
    sender,
  );
  const history = await appStorage.allKeys.getValue();
  expect(history).toEqual([
    expect.objectContaining({ url: expectedUrl, value: '01010101010101010101010101010101' }),
  ]);
  expect(
    getRecentKeysForUrl(expectedUrl, await appStorage.recentKeysByDomain.getValue(), []),
  ).toEqual(history);
});

test.each(['keystatuseschange', 'update'])(
  'routes private %s captures using sender metadata',
  async (action) => {
    vi.spyOn(browser.windows, 'getAll').mockImplementation(async () => [
      {
        id: 1,
        incognito: true,
        focused: true,
        alwaysOnTop: false,
      },
    ]);
    await appStorage.settings.setValue(defaultSettings);
    const localBefore = await browser.storage.local.get(null);
    const send = start();
    const license = new TextEncoder().encode(
      JSON.stringify({
        keys: [{ kty: 'oct', kid: 'AAAAAAAAAAAAAAAAAAAAAA', k: 'AQEBAQEBAQEBAQEBAQEBAQ' }],
      }),
    );
    const message = {
      action,
      keySystem: 'org.w3.clearkey',
      initData: '',
      message: Object.fromEntries(license.entries()),
      keyStatuses: { AAAAAAAAAAAAAAAAAAAAAA: 'usable' },
      incognito: false,
    };
    await send(message, {
      tab: { ...tab, incognito: true, url: 'https://example.com/private' },
      url: 'https://example.com/private',
      frameId: 0,
    });
    expect(await privateHistory.allKeys.getValue()).toEqual([
      expect.objectContaining({ url: 'https://example.com/private' }),
    ]);
    expect(await privateHistory.recentKeys.getValue()).toEqual(
      await privateHistory.allKeys.getValue(),
    );
    expect(await browser.storage.local.get(null)).toEqual(localBefore);
    expect(await appStorage.allKeys.getValue()).toBeNull();
  },
);

test('clears private history on the last window removal', async () => {
  const windows = vi
    .spyOn(browser.windows, 'getAll')
    .mockImplementation(async () => [
      { id: 1, incognito: true, focused: true, alwaysOnTop: false },
    ]);
  const onRemoved = vi.spyOn(browser.windows.onRemoved, 'addListener');
  start();
  await privateHistory.allKeys.add({
    id: widevineId,
    value: 'usable',
    url: 'https://example.com/private',
    pssh: '',
    createdAt: 1,
  });
  windows.mockImplementation(async () => []);
  onRemoved.mock.calls[0]![0](1);
  await expect.poll(() => privateHistory.allKeys.getValue()).toBeNull();
});

test('clears the closed private session when a replacement window opens during a history write', async () => {
  const privateWindow = { id: 1, incognito: true, focused: true, alwaysOnTop: false };
  const windows = vi
    .spyOn(browser.windows, 'getAll')
    .mockImplementation(async () => [privateWindow]);
  const onRemoved = vi.spyOn(browser.windows.onRemoved, 'addListener');
  start();
  const key = {
    id: widevineId,
    value: 'usable',
    url: 'https://example.com/private',
    pssh: '',
    createdAt: 1,
  };
  await appStorage.allKeys.add(key);
  await privateHistory.recentKeys.setForUrl(key.url, [key]);
  const writeStarted = Promise.withResolvers<void>();
  const releaseWrite = Promise.withResolvers<void>();
  const setValue = privateHistory.allKeys.raw.setValue;
  vi.spyOn(privateHistory.allKeys.raw, 'setValue').mockImplementationOnce(async (records) => {
    writeStarted.resolve();
    await releaseWrite.promise;
    await setValue(records);
  });
  const writing = privateHistory.allKeys.add(key);
  await writeStarted.promise;
  try {
    windows.mockImplementation(async () => []);
    onRemoved.mock.calls[0]![0](privateWindow.id);
    windows.mockImplementation(async () => [{ ...privateWindow, id: 2 }]);
  } finally {
    releaseWrite.resolve();
  }
  await writing;
  await expect.poll(() => privateHistory.allKeys.getValue()).toBeNull();
  expect(await privateHistory.recentKeys.getValue()).toBeNull();
  expect(await privateHistory.recentKeysByDomain.getValue()).toBeNull();
  expect(await appStorage.allKeys.getValue()).toEqual([key]);

  await privateHistory.allKeys.add({ ...key, createdAt: 2 });
  expect(await privateHistory.allKeys.getValue()).toEqual([{ ...key, createdAt: 2 }]);
});

test('does not show ordinary same-site keys on a private tab badge', async () => {
  await appStorage.recentKeys.setForUrl('https://example.com/public', [
    {
      id: widevineId,
      value: '1'.repeat(32),
      url: 'https://example.com/public',
      pssh: '',
      createdAt: 1,
    },
  ]);
  vi.mocked(browser.tabs.query).mockImplementation(async () => [
    { ...tab, incognito: true, url: 'https://example.com/private' },
  ]);
  const setBadgeText = vi.spyOn(browser.action, 'setBadgeText');
  start();
  await expect.poll(() => setBadgeText.mock.calls).toContainEqual([{ tabId: tab.id, text: '' }]);
});
