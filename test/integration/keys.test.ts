import { beforeEach } from 'vitest';
import { test, expect } from 'vitest';
import { fetchDecryptionKeys, Widevine } from '../../src/lib';
import { PSSH, LICENSE_URL, loadWidevineDeviceCredentials } from '../utils';

test('fetch decryption keys', async () => {
  const cdm = new Widevine({
    deviceCredentials: await loadWidevineDeviceCredentials(),
  });
  const keys = await fetchDecryptionKeys({
    cdm,
    server: LICENSE_URL,
    pssh: PSSH,
  });
  expect(keys.size).toBe(5);
  expect(keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe('9cc0c92044cb1d69433f5f5839a159df');
});

test('fetch decryption keys with an extra individualization server configured', async () => {
  const cdm = new Widevine({
    deviceCredentials: await loadWidevineDeviceCredentials(),
  });
  const keys = await fetchDecryptionKeys({
    cdm,
    server: LICENSE_URL,
    individualizationServer: LICENSE_URL,
    pssh: PSSH,
  });
  expect(keys.size).toBe(5);
  expect(keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe('9cc0c92044cb1d69433f5f5839a159df');
});

beforeEach(({ skip }) => {
  if (!process.env.VITEST_WVD_PATH) skip('Set VITEST_WVD_PATH to enable this demo');
});
