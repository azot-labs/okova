import { afterEach, expect, test } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { usesPywidevineFallback } from '../src/lib/remote/pywidevine';
import { parseRemoteConfig } from '../src/lib/remote/config';
import { RemoteClient } from '../src/extension/utils/remote-client';
import { appStorage } from '../src/extension/utils/storage';

const connection = {
  keySystem: 'com.widevine.alpha',
  baseUrl: 'http://localhost:8787/',
  secret: 'test-secret',
  client: 'test-device',
};
afterEach(() => fakeBrowser.reset());

test('normalizes Okova SDK options and Proxy2 exports for both DRM systems', () => {
  expect(parseRemoteConfig(connection)).toMatchObject({
    protocol: 'okova',
    baseUrl: 'http://localhost:8787',
  });
  for (const [level, protocol, keySystem] of [
    [3, 'pywidevine', 'com.widevine.alpha'],
    [2000, 'pyplayready', 'com.microsoft.playready.recommendation'],
  ]) {
    expect(
      parseRemoteConfig({
        host: 'https://cdm.test/api/',
        secret: 'test',
        device_name: 'device',
        security_level: level,
      }),
    ).toMatchObject({ baseUrl: 'https://cdm.test/api', device: 'device', protocol, keySystem });
  }
  expect(
    parseRemoteConfig({
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
  expect(() => parseRemoteConfig(value)).toThrow();
});

test('remote clients survive storage and export/import without exposing secrets in names', async () => {
  const client = await RemoteClient.from(connection);
  await appStorage.clients.add(client);
  await appStorage.clients.active.setValue(client);
  const restored = await appStorage.clients.active.getValue();
  expect(restored).toBeInstanceOf(RemoteClient);
  expect(restored?.filename).toBe(client.filename);
  expect(client.filename).not.toContain(connection.secret);
  expect(client.label).not.toContain(connection.secret);
  const exported = await RemoteClient.from(
    JSON.parse(new TextDecoder().decode(await client.pack())),
  );
  expect(exported.filename).toBe(client.filename);
  expect((await appStorage.clients.getValue())[0]?.filename).toBe(client.filename);
  await appStorage.clients.remove(exported);
  expect(await appStorage.clients.getValue()).toEqual([]);
});

test('ambiguous Proxy2 exports default to Widevine and respect an explicit protocol', () => {
  const config = { host: 'https://cdm.test', secret: 'test', device_name: 'device' };
  expect(parseRemoteConfig(config)).toMatchObject({
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
  });
  expect(parseRemoteConfig({ ...config, protocol: 'pywidevine' })).toMatchObject({
    keySystem: 'com.widevine.alpha',
  });
  expect(parseRemoteConfig({ ...config, protocol: 'pyplayready' })).toMatchObject({
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
  expect(parseRemoteConfig(config)).toMatchObject({
    protocol: 'pyplayready',
    device: 'device',
    securityLevel: 2000,
  });
  expect(usesPywidevineFallback(config)).toBe(false);
  expect(
    usesPywidevineFallback({ host: 'https://cdm.test', secret: 'test', deviceName: 'device' }),
  ).toBe(true);
  const widevine = parseRemoteConfig({ ...config, securityLevel: 3, systemId: 1234 });
  expect(widevine).toMatchObject({ protocol: 'pywidevine', systemId: 1234, securityLevel: 3 });
  expect(parseRemoteConfig(widevine)).toEqual(widevine);
});
