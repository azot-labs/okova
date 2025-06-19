import { expect, test } from 'vitest';
import { fetchDecryptionKeysWithDefaults, read } from './utils';
import { fromBuffer } from '../src/lib';
import { WidevineClient } from '../src/lib/widevine/client';

test('export client', async () => {
  const originalId = await read('device_client_id_blob');
  const originalKey = await read('device_private_key');
  const client = await WidevineClient.fromUnpacked(originalId, originalKey);
  const unpacked = await client.unpack();

  const originalIdText = fromBuffer(originalId).toBase64();
  const exportedIdText = fromBuffer(unpacked.device_client_id_blob).toBase64();
  expect(originalIdText).toBe(exportedIdText);

  const originalKeyText = fromBuffer(originalKey)
    .toText()
    .split('\n')
    .map((s) => s.trim());
  const exportedKeyText = fromBuffer(unpacked.device_private_key)
    .toText()
    .split('\n')
    .map((s) => s.trim());
  expect(originalKeyText).toEqual(exportedKeyText);
});

test('import wvd', async () => {
  const wvd = await read('client.wvd');
  const client = await WidevineClient.fromPacked(wvd, 'wvd');
  expect(client.id).toBeDefined();
  expect(client.key).toBeDefined();
  const keys = await fetchDecryptionKeysWithDefaults();
  expect(keys.length).toBe(5);
});

test('export wvd', async () => {
  const id = await read('device_client_id_blob');
  const key = await read('device_private_key');
  const client = await WidevineClient.fromUnpacked(id, key);
  const wvd = await client.pack('wvd');
  const wvdClient = await WidevineClient.fromPacked(wvd, 'wvd');
  const keys = await fetchDecryptionKeysWithDefaults(wvdClient);
  expect(keys.length).toBe(5);
});
