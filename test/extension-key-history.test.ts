import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
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
          keySystem: 'com.widevine.alpha',
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
  expect(createSession).toHaveBeenCalledTimes(2);
  await sendMessage({ action: 'close' });
});

test('stored captures are not relabeled as current-site results', async () => {
  await appStorage.allKeys.setValue([key]);
  const loadClient = vi.spyOn(appStorage.clients.active, 'getValue');
  const sendMessage = startBackground();

  await sendMessage({
    action: 'license-request',
    keySystem: 'com.widevine.alpha',
    url: 'https://other.example/video',
    mpd: 'https://other.example/manifest.mpd',
  });

  expect(await appStorage.allKeys.getValue()).toEqual([key]);
  expect((await appStorage.recentKeys.getValue()) ?? []).toEqual([]);
  expect((await appStorage.recentKeysByDomain.getValue()) ?? {}).toEqual({});
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

test.each([
  { url: key.url, pssh: key.pssh, preservesCapture: true },
  { url: 'https://example.com/another-video', pssh: key.pssh, preservesCapture: false },
  { url: key.url, pssh: 'another-pssh', preservesCapture: false },
])('scopes captured recent keys to the status event context: $url, $pssh', async (context) => {
  await appStorage.settings.setValue({
    spoofing: false,
    emeInterception: true,
    requestInterception: false,
    theme: 'auto',
  });
  await appStorage.recentKeys.setValue([key]);
  await appStorage.recentKeysByDomain.setForUrl(key.url, [key]);
  const sendMessage = startBackground();
  const otherId = '112233445566778899aabbccddeeff00';
  await sendMessage({
    action: 'keystatuseschange',
    url: context.url,
    initData: context.pssh,
    keyStatuses: {
      [fromHex(key.id).toBase64()]: 'usable',
      [fromHex(otherId).toBase64()]: 'expired',
    },
  });
  const status = (id: string, value: string) => ({
    ...key,
    id,
    value,
    url: context.url,
    pssh: context.pssh,
    createdAt: expect.any(Number),
  });
  const expected = [
    context.preservesCapture ? key : status(key.id, 'usable'),
    status(otherId, 'expired'),
  ];
  expect(await appStorage.recentKeys.getValue()).toEqual(expected);
  expect(await appStorage.recentKeysByDomain.getValue()).toEqual({ 'example.com': expected });
});

test('evicts the oldest timestamps at 1,001 records, preserving newer captures', async () => {
  const keys = Array.from({ length: 1_000 }, (_, index) => ({
    ...key,
    id: String(index),
    createdAt: 1_000 - index,
  }));
  await appStorage.allKeys.setValue(keys);
  await appStorage.allKeys.add({ ...key, id: 'new', createdAt: 1_001 });
  const stored = await appStorage.allKeys.getValue();
  expect(stored).toHaveLength(1_000);
  expect(stored?.some((key) => key.id === '999')).toBe(false);
  expect(stored?.at(-1)?.id).toBe('new');
});

test('bounds legacy oversized history and concurrent additions', async () => {
  const keys = Array.from({ length: 1_050 }, (_, index) => ({
    ...key,
    id: String(index),
    createdAt: index,
  }));
  await appStorage.allKeys.raw.setValue(keys);
  await Promise.all([
    appStorage.allKeys.add({ ...key, id: 'a', createdAt: 1_050 }),
    appStorage.allKeys.add({ ...key, id: 'b', createdAt: 1_051 }),
  ]);
  const stored = await appStorage.allKeys.getValue();
  expect(stored).toHaveLength(1_000);
  expect(stored?.[0]?.id).toBe('52');
  expect(stored?.slice(-2).map((key) => key.id)).toEqual(['a', 'b']);
});

test('bounds direct and recent writes, including the shared domain cache budget', async () => {
  const keys = Array.from({ length: 1_005 }, (_, index) => ({
    ...key,
    id: String(index),
    createdAt: index,
  }));
  await appStorage.allKeys.setValue(keys);
  await appStorage.recentKeys.setValue(keys);
  expect(await appStorage.allKeys.getValue()).toEqual(keys.slice(5));
  expect(await appStorage.recentKeys.getValue()).toEqual(keys.slice(5));
  await appStorage.recentKeysByDomain.setValue(
    Object.fromEntries(keys.map((key) => [`${key.id}.example`, [key]])),
  );
  await appStorage.recentKeysByDomain.setForUrl('https://latest.example', [
    { ...key, id: 'latest', createdAt: 2_000 },
  ]);
  const domains = await appStorage.recentKeysByDomain.getValue();
  expect(Object.values(domains ?? {}).flat()).toHaveLength(1_000);
  expect(domains?.['5.example']).toBeUndefined();
  expect(domains?.['latest.example']?.[0]?.id).toBe('latest');
  await appStorage.recentKeysByDomain.setForUrl('https://latest.example', keys);
  expect(Object.values((await appStorage.recentKeysByDomain.getValue()) ?? {}).flat()).toHaveLength(
    1_000,
  );
});

test('preserves explicit empty domain results without allowing empty domains to grow unbounded', async () => {
  await appStorage.recentKeysByDomain.setForUrl(key.url, []);
  expect(await appStorage.recentKeysByDomain.getValue()).toEqual({ 'example.com': [] });
  await appStorage.recentKeysByDomain.setValue(
    Object.fromEntries(Array.from({ length: 1_005 }, (_, index) => [`${index}.example`, []])),
  );
  expect(Object.keys((await appStorage.recentKeysByDomain.getValue()) ?? {})).toHaveLength(1_000);
});

test('merges a whole capture batch before eviction so a late status cannot replace an evicted key', async () => {
  const keys = Array.from({ length: 1_000 }, (_, index) => ({
    ...key,
    id: String(index),
    createdAt: index,
  }));
  await appStorage.allKeys.setValue(keys);
  await appStorage.allKeys.add(
    { ...key, id: 'new', createdAt: 1_001 },
    { ...key, id: '0', value: 'expired', createdAt: 1_002 },
  );
  const stored = await appStorage.allKeys.getValue();
  expect(stored).toHaveLength(1_000);
  expect(stored?.some((record) => record.id === '0')).toBe(false);
  expect(stored?.[0]?.id).toBe('1');
});

test('deletes only the chosen record from history and both recent caches', async () => {
  const otherPage = { ...key, url: 'https://example.com/another-video' };
  const otherDomain = { ...key, url: 'https://other.example/video' };
  const otherValue = { ...key, value: '000102030405060708090a0b0c0d0e0f' };
  const otherPssh = { ...key, pssh: 'other-pssh' };
  const remaining = [otherPage, otherDomain, otherValue, otherPssh];
  await appStorage.allKeys.setValue([key, ...remaining]);
  await appStorage.recentKeys.setValue([{ ...key, createdAt: 2 }, ...remaining]);
  await appStorage.recentKeysByDomain.setValue({
    'example.com': [{ ...key, createdAt: 2 }, otherPage, otherValue, otherPssh],
    'other.example': [otherDomain],
  });

  await appStorage.allKeys.remove(key);

  expect(await appStorage.allKeys.getValue()).toEqual(remaining);
  expect(await appStorage.recentKeys.getValue()).toEqual(remaining);
  expect(await appStorage.recentKeysByDomain.getValue()).toEqual({
    'example.com': [otherPage, otherValue, otherPssh],
    'other.example': [otherDomain],
  });
});

test('deletes a recent-only status and preserves the explicit empty domain cache', async () => {
  const status = { ...key, value: 'usable' };
  await appStorage.recentKeys.setValue([status]);
  await appStorage.recentKeysByDomain.setForUrl(key.url, [status]);

  await appStorage.allKeys.remove(status);
  await appStorage.allKeys.remove(status);

  expect(await appStorage.allKeys.getValue()).toEqual([]);
  expect(await appStorage.recentKeys.getValue()).toEqual([]);
  expect(await appStorage.recentKeysByDomain.getValue()).toEqual({ 'example.com': [] });
});
