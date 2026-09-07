import { afterEach, expect, test } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { usesPywidevineFallback } from '../src/lib/remote/pywidevine';
import { parseRemoteCredentialsData } from '../src/lib/remote/credentials';
import { RemoteCredentials } from '../src/lib/remote/credentials';
import { appStorage } from '../src/extension/utils/storage';

const connection = {
  keySystem: 'com.widevine.alpha',
  baseUrl: 'http://localhost:8787/',
  secret: 'test-secret',
  credentials: 'test-device',
};
afterEach(() => fakeBrowser.reset());

test('normalizes Okova SDK options and Proxy2 exports for both DRM systems', () => {
  expect(parseRemoteCredentialsData(connection)).toMatchObject({
    protocol: 'okova',
    baseUrl: 'http://localhost:8787',
  });
  for (const [level, protocol, keySystem] of [
    [3, 'pywidevine', 'com.widevine.alpha'],
    [2000, 'pyplayready', 'com.microsoft.playready.recommendation'],
  ]) {
    expect(
      parseRemoteCredentialsData({
        host: 'https://cdm.test/api/',
        secret: 'test',
        device_name: 'device',
        security_level: level,
      }),
    ).toMatchObject({ baseUrl: 'https://cdm.test/api', device: 'device', protocol, keySystem });
  }
  expect(
    parseRemoteCredentialsData({
      host: 'https://cdm.test',
      secret: 'test',
      name: 'device',
      protocol: 'pyplayready',
    }),
  ).toMatchObject({ device: 'device', protocol: 'pyplayready' });
});

test.each([
  { ...connection, baseUrl: 'file:///etc/config' },
  { ...connection, baseUrl: 'https://user:password@cdm.test' },
  { ...connection, baseUrl: 'https://cdm.test?token=secret' },
  { ...connection, requestTimeoutMs: 0 },
  { ...connection, protocol: 'unknown' },
  { host: 'https://cdm.test', secret: 'test' },
  { ...connection, protocol: 'pyplayready', device: 'test' },
])('rejects invalid remote configurations', (value) => {
  expect(() => parseRemoteCredentialsData(value)).toThrow();
});

test('remote credentials survive storage and export/import without exposing secrets in names', async () => {
  const credentials = await RemoteCredentials.from(connection);
  await appStorage.credentials.add(credentials);
  await appStorage.credentials.active.setValue(credentials);
  const restored = await appStorage.credentials.active.getValue();
  expect(restored).toBeInstanceOf(RemoteCredentials);
  expect(restored?.filename).toBe(credentials.filename);
  expect(credentials.filename).not.toContain(connection.secret);
  expect(credentials.label).not.toContain(connection.secret);
  const exported = await RemoteCredentials.from(
    JSON.parse(new TextDecoder().decode(await credentials.pack())),
  );
  expect(exported.filename).toBe(credentials.filename);
  expect((await appStorage.credentials.getValue())[0]?.filename).toBe(credentials.filename);
  await appStorage.credentials.remove(exported);
  expect(await appStorage.credentials.getValue()).toEqual([]);
});

test('ambiguous Proxy2 exports default to Widevine and respect an explicit protocol', () => {
  const config = { host: 'https://cdm.test', secret: 'test', device_name: 'device' };
  expect(parseRemoteCredentialsData(config)).toMatchObject({
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
  });
  expect(parseRemoteCredentialsData({ ...config, protocol: 'pywidevine' })).toMatchObject({
    keySystem: 'com.widevine.alpha',
  });
  expect(parseRemoteCredentialsData({ ...config, protocol: 'pyplayready' })).toMatchObject({
    keySystem: 'com.microsoft.playready.recommendation',
  });
});

test('Python JSON aliases retain device expectations without a fallback warning', () => {
  const config = {
    host: 'https://cdm.test',
    secret: 'test',
    deviceName: 'device',
    securityLevel: 2000,
  };
  expect(parseRemoteCredentialsData(config)).toMatchObject({
    protocol: 'pyplayready',
    device: 'device',
    securityLevel: 2000,
  });
  expect(usesPywidevineFallback(config)).toBe(false);
  expect(
    usesPywidevineFallback({ host: 'https://cdm.test', secret: 'test', deviceName: 'device' }),
  ).toBe(true);
  const widevine = parseRemoteCredentialsData({ ...config, securityLevel: 3, systemId: 1234 });
  expect(widevine).toMatchObject({ protocol: 'pywidevine', systemId: 1234, securityLevel: 3 });
  expect(parseRemoteCredentialsData(widevine)).toEqual(widevine);
});
