import { expect, test } from 'vitest';
import { Client, fromBuffer } from '../src/lib';
import { fetchDecryptionKeysWithDefaults, read } from './utils';

test('export client', async () => {
  const originalId = await read('device_client_id_blob');
  const originalKey = await read('device_private_key');
  const client = await Client.fromUnpacked(originalId, originalKey);
  const [exportedId, exportedKey] = await client.unpack();

  const originalIdText = fromBuffer(originalId).toBase64();
  const exportedIdText = fromBuffer(exportedId).toBase64();
  expect(originalIdText).toBe(exportedIdText);

  const originalKeyText = fromBuffer(originalKey)
    .toText()
    .split('\n')
    .map((s) => s.trim());
  const exportedKeyText = fromBuffer(exportedKey)
    .toText()
    .split('\n')
    .map((s) => s.trim());
  expect(originalKeyText).toEqual(exportedKeyText);
});

test('import wvd', async () => {
  const wvd = await read('client.wvd');
  const client = await Client.fromPacked(wvd, 'wvd');
  expect(client.id).toBeDefined();
  expect(client.key).toBeDefined();
  const keys = await fetchDecryptionKeysWithDefaults();
  expect(keys.length).toBe(5);
});

test('export wvd', async () => {
  const id = await read('device_client_id_blob');
  const key = await read('device_private_key');
  const client = await Client.fromUnpacked(id, key);
  const wvd = await client.pack('wvd');
  const wvdClient = await Client.fromPacked(wvd, 'wvd');
  const keys = await fetchDecryptionKeysWithDefaults(wvdClient);
  expect(keys.length).toBe(5);
});
