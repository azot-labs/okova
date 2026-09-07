import { beforeEach } from 'vitest';
import { expect, test } from 'vitest';
import { fetchDecryptionKeysWithDefaults, loadWidevineCredentialData } from '../utils';
import { fromBuffer } from '../../src/lib';
import { WidevineClientCredentials } from '../../src/lib/widevine/client-credentials';
import { ClientIdentification } from '../../src/lib/widevine/proto';

test('export unpacked credentials data from packed fixture', async () => {
  const wvd = await loadWidevineCredentialData();
  const credentials = await WidevineClientCredentials.fromPacked(wvd, 'wvd');
  const unpacked = await credentials.unpack();
  const unpackedCredentials = await WidevineClientCredentials.fromUnpacked(
    unpacked.device_client_id_blob,
    unpacked.device_private_key,
  );

  expect(fromBuffer(unpacked.device_client_id_blob).toBase64()).toBe(
    fromBuffer(ClientIdentification.encode(credentials.id).finish()).toBase64(),
  );

  const originalKeyText = fromBuffer(await credentials.exportKey())
    .toText()
    .split('\n')
    .map((s) => s.trim());
  const exportedKeyText = fromBuffer(unpacked.device_private_key)
    .toText()
    .split('\n')
    .map((s) => s.trim());
  expect(originalKeyText).toEqual(exportedKeyText);
  expect(unpackedCredentials.systemId).toBe(credentials.systemId);
  expect(unpackedCredentials.securityLevel).toBe(credentials.securityLevel);
  expect(unpackedCredentials.label).toBe(credentials.label);
});

test('import wvd', async () => {
  const wvd = await loadWidevineCredentialData();
  const credentials = await WidevineClientCredentials.fromPacked(wvd, 'wvd');
  expect(credentials.id).toBeDefined();
  expect(credentials.key).toBeDefined();
  const keys = await fetchDecryptionKeysWithDefaults();
  expect(keys.size).toBe(5);
});

test('export wvd', async () => {
  const packedCredentials = await loadWidevineCredentialData();
  const credentials = await WidevineClientCredentials.fromPacked(packedCredentials, 'wvd');
  const repackedWvd = await credentials.pack('wvd');
  const wvdCredentials = await WidevineClientCredentials.fromPacked(repackedWvd, 'wvd');
  const keys = await fetchDecryptionKeysWithDefaults(wvdCredentials);
  expect(keys.size).toBe(5);
});

beforeEach(({ skip }) => {
  if (!process.env.VITEST_WVD_PATH) skip('Set VITEST_WVD_PATH to enable this demo');
});
