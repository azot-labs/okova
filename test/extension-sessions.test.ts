import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing';
import background from '../src/extension/entrypoints/background';
import { appStorage } from '../src/extension/utils/storage';
import { Session, setSupportedEngines } from '../src/lib/api';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';

vi.mock('../src/lib/widevine/device-credentials', () => ({
  WidevineDeviceCredentials: class {},
}));

const sessions: Session[] = [];
const tab = (id: number): Browser.tabs.Tab => ({
  id,
  index: 0,
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
});

beforeEach(async () => {
  fakeBrowser.reset();
  vi.useFakeTimers();
  await appStorage.settings.setValue({
    spoofing: true,
    emeInterception: true,
    requestInterception: false,
    theme: 'auto',
  });
  vi.spyOn(appStorage.clients.active, 'getValue').mockResolvedValue(
    new WidevineDeviceCredentials(new Uint8Array()),
  );
  vi.spyOn(browser.tabs, 'query').mockImplementation(async () => []);
  vi.spyOn(browser.action, 'setBadgeText').mockResolvedValue();
  sessions.length = 0;
  vi.spyOn(Session.prototype, 'generateRequest').mockImplementation(async function (this: Session) {
    sessions.push(this);
  });
  vi.spyOn(Session.prototype, 'close').mockResolvedValue();
  vi.spyOn(Session.prototype, 'update').mockResolvedValue();
  vi.spyOn(Session.prototype, 'waitForLicenseRequest').mockImplementation(
    async function (this: Session) {
      return new TextEncoder().encode(this.sessionId);
    },
  );
  vi.spyOn(Session.prototype, 'waitForKeyStatusesChange').mockResolvedValue(
    new Map([['00112233445566778899aabbccddeeff', 'ffeeddccbbaa99887766554433221100']]),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  setSupportedEngines([]);
});

const startBackground = () => {
  const addListener = vi.spyOn(browser.runtime.onMessage, 'addListener');
  background.main();
  const listener = addListener.mock.calls[0]![0];
  return (
    action: string,
    sessionToken: string,
    sender: Browser.runtime.MessageSender = {},
    message: Record<string, unknown> = {},
  ) =>
    new Promise<unknown>((resolve) => {
      listener(
        {
          action,
          sessionToken,
          initData: 'cHNzaA==',
          initDataType: 'cenc',
          url: 'https://example.com/video',
          message: { 0: 8, 1: 2 },
          ...message,
        },
        sender,
        resolve,
      );
    });
};

test('same-PSSH sessions keep their challenges and updates across tabs, frames and documents', async () => {
  const send = startBackground();
  const owners = [
    { token: 'first', sender: { tab: tab(1), frameId: 0, documentId: 'one' } },
    { token: 'second', sender: { tab: tab(1), frameId: 0, documentId: 'one' } },
    { token: 'first', sender: { tab: tab(2), frameId: 0, documentId: 'two' } },
    { token: 'first', sender: { tab: tab(1), frameId: 1, documentId: 'three' } },
    { token: 'first', sender: { tab: tab(1), frameId: 0, documentId: 'four' } },
  ];
  await Promise.all(owners.map(({ token, sender }) => send('generateRequest', token, sender)));
  expect(new Set(sessions).size).toBe(owners.length);

  for (const [index, { token, sender }] of owners.entries()) {
    await expect(send('license-request', token, sender)).resolves.toBe(
      btoa(sessions[index]!.sessionId),
    );
  }
  for (const [index, { token, sender }] of [...owners.entries()].reverse()) {
    await expect(send('update', token, sender)).resolves.toMatchObject({ keys: expect.any(Array) });
    expect(vi.mocked(Session.prototype.update).mock.contexts.at(-1)).toBe(sessions[index]);
    expect(vi.mocked(Session.prototype.close).mock.contexts.at(-1)).toBe(sessions[index]);
  }
  expect(Session.prototype.close).toHaveBeenCalledTimes(owners.length);
  expect(vi.getTimerCount()).toBe(0);
});

test('retains the session for a service certificate and cleans up failed license parsing', async () => {
  const send = startBackground();
  await send('generateRequest', 'one');
  await send('update', 'one', {}, { message: { 0: 8, 1: 5 } });
  expect(Session.prototype.close).not.toHaveBeenCalled();
  await expect(send('license-request', 'one')).resolves.toEqual(expect.any(String));

  vi.mocked(Session.prototype.update).mockRejectedValueOnce(new Error('Invalid license'));
  await expect(send('update', 'one')).resolves.toBeUndefined();
  expect(Session.prototype.close).toHaveBeenCalledOnce();
  await expect(send('license-request', 'one')).resolves.toBeUndefined();
  expect(vi.getTimerCount()).toBe(0);
});

test('cleans up failed generation, explicit close and abandoned sessions', async () => {
  const send = startBackground();
  vi.mocked(Session.prototype.generateRequest).mockRejectedValueOnce(new Error('Invalid PSSH'));
  await expect(send('generateRequest', 'failed')).resolves.toBeUndefined();
  expect(Session.prototype.close).toHaveBeenCalledOnce();
  await send('generateRequest', 'closed');
  await send('close', 'closed');
  await expect(send('license-request', 'closed')).resolves.toBeUndefined();
  await send('generateRequest', 'abandoned');
  await vi.advanceTimersByTimeAsync(5 * 60_000);
  await expect(send('license-request', 'abandoned')).resolves.toBeUndefined();
  expect(Session.prototype.close).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});

test.each(['navigation', 'removal'])('cleans up only the affected tab on %s', async (action) => {
  const updated = vi.spyOn(browser.tabs.onUpdated, 'addListener');
  const removed = vi.spyOn(browser.tabs.onRemoved, 'addListener');
  const send = startBackground();
  await send('generateRequest', 'one', { tab: tab(1) });
  await send('generateRequest', 'two', { tab: tab(2) });
  if (action === 'navigation') {
    updated.mock.calls[0]![0](1, { status: 'loading' }, tab(1));
  } else {
    removed.mock.calls[0]![0](1, { windowId: 1, isWindowClosing: false });
  }
  await expect(send('license-request', 'one', { tab: tab(1) })).resolves.toBeUndefined();
  await expect(send('license-request', 'two', { tab: tab(2) })).resolves.toEqual(
    expect.any(String),
  );
  expect(Session.prototype.close).toHaveBeenCalledOnce();
  await send('close', 'two', { tab: tab(2) });
});
