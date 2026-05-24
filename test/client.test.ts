import { expect, test } from 'vitest';
import { fetchDecryptionKeysWithDefaults, loadWidevineClientData } from './utils';
import { fromBuffer } from '../src/lib';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import { ClientIdentification } from '../src/lib/widevine/proto';

test('export unpacked client data from packed fixture', async () => {
  const wvd = await loadWidevineClientData();
  const client = await WidevineDeviceCredentials.fromPacked(wvd, 'wvd');
  const unpacked = await client.unpack();
  const unpackedClient = await WidevineDeviceCredentials.fromUnpacked(
    unpacked.device_client_id_blob,
    unpacked.device_private_key,
  );

  expect(fromBuffer(unpacked.device_client_id_blob).toBase64()).toBe(
    fromBuffer(ClientIdentification.encode(client.id).finish()).toBase64(),
  );

  const originalKeyText = fromBuffer(await client.exportKey())
    .toText()
    .split('\n')
    .map((s) => s.trim());
  const exportedKeyText = fromBuffer(unpacked.device_private_key)
    .toText()
    .split('\n')
    .map((s) => s.trim());
  expect(originalKeyText).toEqual(exportedKeyText);
  expect(unpackedClient.systemId).toBe(client.systemId);
  expect(unpackedClient.securityLevel).toBe(client.securityLevel);
  expect(unpackedClient.label).toBe(client.label);
});

test('import wvd', async () => {
  const wvd = await loadWidevineClientData();
  const client = await WidevineDeviceCredentials.fromPacked(wvd, 'wvd');
  expect(client.id).toBeDefined();
  expect(client.key).toBeDefined();
  const keys = await fetchDecryptionKeysWithDefaults();
  expect(keys.size).toBe(5);
});

test('export wvd', async () => {
  const packedClient = await loadWidevineClientData();
  const client = await WidevineDeviceCredentials.fromPacked(packedClient, 'wvd');
  const repackedWvd = await client.pack('wvd');
  const wvdClient = await WidevineDeviceCredentials.fromPacked(repackedWvd, 'wvd');
  const keys = await fetchDecryptionKeysWithDefaults(wvdClient);
  expect(keys.size).toBe(5);
});
