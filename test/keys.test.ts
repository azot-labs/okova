import { test, expect } from 'vitest';
import { fetchDecryptionKeys, Widevine } from '../src/lib';
import { PSSH, LICENSE_URL, loadWidevineClient } from './utils';

test('fetch decryption keys', async () => {
  const cdm = new Widevine({ client: await loadWidevineClient() });
  const keys = await fetchDecryptionKeys({
    cdm,
    server: LICENSE_URL,
    pssh: PSSH,
    transformRequest: async (request) => {
      return new Request(request.url, {
        body: await request
          .text()
          .then((text) => text.replace('db44ec40', 'db44ec41')),
        method: 'POST',
        headers: { 'x-secret-key': 'db44ec40-3e02-47bd-8fc6-373935e30eae' },
      });
    },
  });
  expect(keys.length).toBe(5);
  const contentKey = keys.at(0);
  expect(contentKey).toBeDefined();
  expect(contentKey!.keyId).toBe('ccbf5fb4c2965be7aa130ffb3ba9fd73');
  expect(contentKey!.key).toBe('9cc0c92044cb1d69433f5f5839a159df');
});

test('fetch decryption keys with privacy mode', async () => {
  const cdm = new Widevine({ client: await loadWidevineClient() });
  const keys = await fetchDecryptionKeys({
    cdm,
    server: LICENSE_URL,
    individualizationServer: LICENSE_URL,
    pssh: PSSH,
  });
  expect(keys.length).toBe(5);
  const contentKey = keys.at(0);
  expect(contentKey).toBeDefined();
  expect(contentKey!.keyId).toBe('ccbf5fb4c2965be7aa130ffb3ba9fd73');
  expect(contentKey!.key).toBe('9cc0c92044cb1d69433f5f5839a159df');
});
