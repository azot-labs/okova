import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing';
import background from '../src/extension/entrypoints/background';
import { appStorage, type KeyInfo } from '../src/extension/utils/storage';
import { fromHex, Widevine } from '../src/lib';
import { Session, setSupportedEngines } from '../src/lib/api';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';

// No device credentials or license server are needed to exercise the background flow.
vi.mock('../src/lib/widevine/device-credentials', () => ({
  WidevineDeviceCredentials: class {
    async pack() {
      return new Uint8Array();
    }
  },
}));

const key: KeyInfo = {
  id: '00112233445566778899aabbccddeeff',
  value: 'ffeeddccbbaa99887766554433221100',
  url: 'https://example.com/video',
  mpd: 'https://example.com/manifest.mpd',
  pssh: 'cHNzaA==',
  createdAt: 1,
};

beforeEach(() => {
  fakeBrowser.reset();
});

afterEach(() => {
  vi.restoreAllMocks();
  setSupportedEngines([]);
});

test.each(['usable', 'expired', 'output-restricted', 'status-pending'])(
  'replaces a stored %s status with a captured key and its metadata',
  async (value) => {
    await appStorage.allKeys.setValue([{ ...key, value }]);
    const capturedKey = { ...key, url: 'https://example.com/replay', createdAt: 2 };

    await appStorage.allKeys.add(capturedKey);

    expect(await appStorage.allKeys.getValue()).toEqual([capturedKey]);
  },
);

test('preserves captured keys when later statuses or duplicate keys arrive', async () => {
  await appStorage.allKeys.add(key);
  await appStorage.allKeys.add({ ...key, value: 'usable' }, { ...key, createdAt: 2 });

  expect(await appStorage.allKeys.getValue()).toEqual([key]);
});

test('upgrades a status within the same batch while retaining distinct key IDs', async () => {
  const otherKey = { ...key, id: '112233445566778899aabbccddeeff00' };
  await appStorage.allKeys.add({ ...key, value: 'usable' }, otherKey, key);

  expect(await appStorage.allKeys.getValue()).toEqual([key, otherKey]);
});

test('retains every key from concurrent captures', async () => {
  const captures = Array.from({ length: 10 }, (_, index) => ({
    ...key,
    id: index.toString(16).padStart(32, '0'),
  }));

  await Promise.all(captures.map((capture) => appStorage.allKeys.add(capture)));

  expect(await appStorage.allKeys.getValue()).toEqual(captures);
});

test('retains recent keys for different domains during concurrent captures', async () => {
  const otherKey = { ...key, url: 'https://other.example/video' };

  await Promise.all([
    appStorage.recentKeysByDomain.setForUrl(key.url, [key]),
    appStorage.recentKeysByDomain.setForUrl(otherKey.url, [otherKey]),
  ]);

  expect(await appStorage.recentKeysByDomain.getValue()).toEqual({
    'example.com': [key],
    'other.example': [otherKey],
  });
});

test('serializes status upgrades and duplicate captures', async () => {
  await Promise.all([
    appStorage.allKeys.add({ ...key, value: 'usable' }),
    appStorage.allKeys.add(key),
    appStorage.allKeys.add({ ...key, value: 'expired' }),
  ]);

  expect(await appStorage.allKeys.getValue()).toEqual([key]);
});

test('serializes removals with captures and ignores repeated removals', async () => {
  const otherKey = { ...key, id: '112233445566778899aabbccddeeff00' };
  await appStorage.allKeys.add(key);

  await Promise.all([
    appStorage.allKeys.add(otherKey),
    appStorage.allKeys.remove(key),
    appStorage.allKeys.remove(key),
  ]);

  expect(await appStorage.allKeys.getValue()).toEqual([otherKey]);
});

test('clears history after pending writes without restoring stale entries', async () => {
  await Promise.all([
    appStorage.allKeys.add(key),
    appStorage.recentKeys.setValue([key]),
    appStorage.recentKeysByDomain.setForUrl(key.url, [key]),
    appStorage.allKeys.clear(),
  ]);

  expect(await appStorage.allKeys.getValue()).toEqual([]);
  expect(await appStorage.recentKeys.getValue()).toEqual([]);
  expect(await appStorage.recentKeysByDomain.getValue()).toEqual({});
});

test('releases the lock after a failed write and reports the failure', async () => {
  const error = new Error('Storage write failed');
  vi.spyOn(appStorage.allKeys.raw, 'setValue').mockRejectedValueOnce(error);

  const results = await Promise.allSettled([
    appStorage.allKeys.add(key),
    appStorage.allKeys.add(key),
  ]);

  expect(results).toEqual([
    { status: 'rejected', reason: error },
    { status: 'fulfilled', value: undefined },
  ]);
  expect(await appStorage.allKeys.getValue()).toEqual([key]);
});

const startBackground = () => {
  const addListener = vi.spyOn(browser.runtime.onMessage, 'addListener');
  vi.spyOn(browser.tabs, 'query').mockImplementation(async () => []);
  background.main();
  const listener = addListener.mock.calls[0]![0];

  return (message: Record<string, unknown>) =>
    new Promise<unknown>((resolve) => {
      listener(
        {
          sessionToken: 'test-session',
          url: key.url,
          mpd: key.mpd,
          initData: key.pssh,
          ...message,
        },
        {},
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
  const loadClient = vi
    .spyOn(appStorage.clients.active, 'getValue')
    .mockResolvedValue(new WidevineDeviceCredentials(new Uint8Array()));
  const createSession = vi.spyOn(Widevine.prototype, 'createSession');
  const generateRequest = vi.spyOn(Session.prototype, 'generateRequest').mockResolvedValue();
  vi.spyOn(Session.prototype, 'pause').mockReturnValue('{}');
  vi.spyOn(Session.prototype, 'waitForLicenseRequest').mockResolvedValue(new Uint8Array());
  vi.spyOn(Session.prototype, 'update').mockResolvedValue();
  vi.spyOn(Session.prototype, 'waitForKeyStatusesChange').mockResolvedValue(
    new Map([[key.id, key.value]]),
  );
  const sendMessage = startBackground();

  await sendMessage({
    action: 'keystatuseschange',
    keyStatuses: { [fromHex(key.id).toBase64()]: 'usable' },
  });
  expect(await appStorage.allKeys.getValue()).toEqual([
    { ...key, value: 'usable', createdAt: expect.any(Number) },
  ]);
  expect(loadClient).not.toHaveBeenCalled();

  await appStorage.settings.setValue({ ...settings, spoofing: true });
  await sendMessage({ action: 'generateRequest', initDataType: 'cenc' });
  expect(createSession).toHaveBeenCalledOnce();
  expect(generateRequest).toHaveBeenCalledExactlyOnceWith('cenc', new TextEncoder().encode('pssh'));

  // SignedMessage type LICENSE (2); license parsing itself is stubbed above.
  const response = await sendMessage({ action: 'update', message: { 0: 8, 1: 2 } });
  const capturedKeys = [{ ...key, createdAt: expect.any(Number) }];
  expect(response).toEqual({ keys: capturedKeys });
  expect(await appStorage.allKeys.getValue()).toEqual(capturedKeys);
  expect(await appStorage.recentKeys.getValue()).toEqual(capturedKeys);

  await sendMessage({ action: 'generateRequest', initDataType: 'cenc' });
  expect(createSession).toHaveBeenCalledOnce();
});

test('cache hits expose only captured keys matching the PSSH with current site metadata', async () => {
  await appStorage.allKeys.setValue([
    { ...key, value: 'usable' },
    { ...key, id: '112233445566778899aabbccddeeff00' },
    { ...key, id: '2233445566778899aabbccddeeff0011', pssh: 'other-pssh' },
  ]);
  const loadClient = vi.spyOn(appStorage.clients.active, 'getValue');
  const sendMessage = startBackground();
  const url = 'https://other.example/video';
  const mpd = 'https://other.example/manifest.mpd';

  await sendMessage({ action: 'generateRequest', initDataType: 'cenc', url, mpd });

  const cachedKeys = [{ ...key, id: '112233445566778899aabbccddeeff00', url, mpd }];
  expect(await appStorage.recentKeys.getValue()).toEqual(cachedKeys);
  expect(await appStorage.recentKeysByDomain.getValue()).toEqual({ 'other.example': cachedKeys });
  expect(loadClient).not.toHaveBeenCalled();
});

test('retains different values and content metadata for a reused KID', async () => {
  const otherValue = { ...key, value: '000102030405060708090a0b0c0d0e0f' };
  const otherContent = { ...key, pssh: 'other-pssh' };
  await appStorage.allKeys.add(key, otherValue, otherContent, otherValue);
  expect(await appStorage.allKeys.getValue()).toEqual([key, otherValue, otherContent]);
  await appStorage.allKeys.remove(otherValue);
  expect(await appStorage.allKeys.getValue()).toEqual([key, otherContent]);
});
