import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
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
      args: [token],
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
