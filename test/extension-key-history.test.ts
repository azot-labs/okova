import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import background from '../src/extension/entrypoints/background';
import { appStorage, getDrmFailureStorage, type KeyInfo } from '../src/extension/utils/storage';
import { getCaptureDiagnosticsStorage } from '../src/extension/utils/session-diagnostics';
import { fromHex, Widevine } from '../src/lib';
import { Session, setSupportedEngines } from '../src/lib/api';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';

// No client credentials or license server are needed to exercise the background flow.
vi.mock('../src/lib/widevine/client-credentials', () => ({
  WidevineClientCredentials: class {
    async pack() {
      return new Uint8Array();
    }
  },
}));

const key: KeyInfo = {
  drmSystem: 'W',
  id: '00112233445566778899aabbccddeeff',
  value: 'ffeeddccbbaa99887766554433221100',
  url: 'https://example.com/video',
  mpd: 'https://example.com/manifest.mpd',
  pssh: 'cHNzaA==',
  createdAt: 1,
};

beforeEach(() => {
  fakeBrowser.reset();
  vi.spyOn(browser.webRequest.onSendHeaders, 'addListener').mockImplementation(() => {});
  vi.spyOn(browser.webRequest.onBeforeRedirect, 'addListener').mockImplementation(() => {});
  vi.spyOn(browser.webRequest.onErrorOccurred, 'addListener').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  setSupportedEngines([]);
});

const startBackground = (
  sender: Parameters<Parameters<typeof browser.runtime.onMessage.addListener>[0]>[1] = {},
) => {
  const addListener = vi.spyOn(browser.runtime.onMessage, 'addListener');
  vi.spyOn(browser.tabs, 'query').mockImplementation(async () => []);
  background.main();
  const listener = addListener.mock.calls[0]![0];

  return (message: Record<string, unknown>) =>
    new Promise<unknown>((resolve) => {
      listener(
        {
          sessionToken: 'test-session',
          keySystem: 'com.widevine.alpha',
          url: key.url,
          mpd: key.mpd,
          initData: key.pssh,
          ...message,
        },
        sender,
        resolve,
      );
    });
};

test('captures keys after logging a status with spoofing disabled', async () => {
  const settings = {
    spoofing: false,
    emeInterception: true,
    requestInterception: false,
    theme: 'auto',
  } as const;
  await appStorage.settings.setValue(settings);
  const loadCredentials = vi
    .spyOn(appStorage.credentials.active, 'getValue')
    .mockResolvedValue(new WidevineClientCredentials(new Uint8Array()));
  const createSession = vi.spyOn(Widevine.prototype, 'createSession');
  const generateRequest = vi.spyOn(Session.prototype, 'generateRequest').mockResolvedValue();
  vi.spyOn(Session.prototype, 'pause').mockReturnValue('{}');
  vi.spyOn(Session.prototype, 'waitForLicenseRequest').mockResolvedValue(new Uint8Array());
  vi.spyOn(Session.prototype, 'update').mockImplementation(async function (this: Session) {
    this.keys.set(key.id, key.value);
  });
  vi.spyOn(Session.prototype, 'waitForKeyStatusesChange').mockResolvedValue(
    new Map([[key.id, key.value]]),
  );
  const sendMessage = startBackground();

  await sendMessage({
    action: 'keystatuseschange',
    keyStatuses: { [fromHex(key.id).toBase64()]: 'usable' },
  });
  expect(await appStorage.allKeys.getValue()).toEqual([
    expect.objectContaining({ ...key, value: 'usable', createdAt: expect.any(Number) }),
  ]);
  expect(loadCredentials).not.toHaveBeenCalled();

  await appStorage.settings.setValue({ ...settings, spoofing: true });
  await sendMessage({ action: 'generateRequest', initDataType: 'cenc' });
  expect(createSession).toHaveBeenCalledOnce();
  expect(generateRequest).toHaveBeenCalledExactlyOnceWith('cenc', new TextEncoder().encode('pssh'));

  // SignedMessage type LICENSE (2); license parsing itself is stubbed above.
  const response = await sendMessage({ action: 'update', message: { 0: 8, 1: 2 } });
  const capturedKeys = [{ ...key, createdAt: expect.any(Number) }];
  expect(response).toEqual({ keys: capturedKeys });
  expect(await appStorage.allKeys.getValue()).toMatchObject(capturedKeys);
  expect((await appStorage.captures.getValue())[0]?.sessions).toHaveLength(1);

  await sendMessage({ action: 'generateRequest', initDataType: 'cenc' });
  expect(createSession).toHaveBeenCalledTimes(2);
  await sendMessage({ action: 'close' });
});

test('stored captures are not relabeled as current-site results', async () => {
  await appStorage.allKeys.setValue([key]);
  const loadCredentials = vi.spyOn(appStorage.credentials.active, 'getValue');
  const sendMessage = startBackground();

  await sendMessage({
    action: 'license-request',
    keySystem: 'com.widevine.alpha',
    url: 'https://other.example/video',
    mpd: 'https://other.example/manifest.mpd',
  });

  expect(await appStorage.allKeys.getValue()).toMatchObject([key]);
  expect((await appStorage.captures.getValue()).map((capture) => capture.source.url)).toEqual([
    key.url,
  ]);
  expect(loadCredentials).not.toHaveBeenCalled();
});

test.each(['capture-history', 'all-storage'])(
  'reports %s persistence failures and still returns extracted keys',
  async (failedStore) => {
    await appStorage.settings.setValue({
      spoofing: false,
      emeInterception: true,
      requestInterception: false,
      theme: 'auto',
    });
    const originalSet = browser.storage.local.set.bind(browser.storage.local);
    vi.spyOn(browser.storage.local, 'set').mockImplementation(async (items) => {
      if (failedStore === 'all-storage' || failedStore in items)
        throw new Error('QUOTA_BYTES exceeded');
      return originalSet(items);
    });
    if (failedStore === 'all-storage')
      vi.spyOn(browser.storage.session, 'set').mockRejectedValue(
        new Error('Session quota exceeded'),
      );
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setTitle = vi.spyOn(browser.action, 'setTitle');
    const tab = await browser.tabs.create({ url: key.url });
    const sendMessage = startBackground({ tab });
    const license = Buffer.from(
      JSON.stringify({
        keys: [
          {
            kty: 'oct',
            kid: Buffer.from(key.id, 'hex').toString('base64url'),
            k: Buffer.from(key.value, 'hex').toString('base64url'),
          },
        ],
      }),
    ).toString('base64');
    const response = await sendMessage({
      action: 'update',
      keySystem: 'org.w3.clearkey',
      message: [...Buffer.from(license, 'base64')],
    });
    expect(response).toMatchObject({ keys: [{ id: key.id, value: key.value, pssh: key.pssh }] });
    if (failedStore !== 'all-storage')
      expect(await getDrmFailureStorage(tab.id!).getValue()).toMatchObject({
        stage: 'history',
        error: 'Unable to save key history: QUOTA_BYTES exceeded',
      });
    expect(setTitle).toHaveBeenCalledWith({
      tabId: tab.id,
      title: expect.stringContaining(
        failedStore === 'all-storage'
          ? 'Unable to save key history: Session quota exceeded'
          : 'Unable to save key history: QUOTA_BYTES exceeded',
      ),
    });
    if (failedStore !== 'all-storage') {
      await vi.waitFor(async () => {
        const captures = await getCaptureDiagnosticsStorage(tab.id!).getValue();
        expect(captures?.at(-1)).toMatchObject({
          outcome: 'keys-returned',
          events: expect.arrayContaining([
            expect.objectContaining({ stage: 'history', status: 'failed' }),
          ]),
        });
      });
    }
  },
);
