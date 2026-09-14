import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { importClientCredentials } from '../src/cli/utils';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../src/lib/playready/client-credentials';

const directories: string[] = [];
const createDirectory = async (names: string[]) => {
  const directory = await mkdtemp(join(tmpdir(), 'okova-filenames-'));
  directories.push(directory);
  for (const name of names) await writeFile(join(directory, name), name);
  return directory;
};

afterEach(async () => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) await rm(directory, { recursive: true });
});

// Stop at parsing so filename selection can be checked without private device fixtures.
const selected = new Error('Selected credential parser');

test.each([
  ['device_client_id_blob', 'device_private_key'],
  ['CLIENT_ID_BLOB', 'PRIVATE_KEY'],
  ['Client_Id', 'Private_Key.Pem'],
  ['CLIENT_ID.BIN', 'DEVICE_PRIVATE_KEY'],
])('discovers exact Widevine aliases %s + %s and ignores backups', async (id, key) => {
  const directory = await createDirectory([
    id,
    key,
    'device_client_id_blob.bak',
    'other_private_key',
    'private_key.pem.old',
  ]);
  const load = vi.spyOn(WidevineClientCredentials, 'from').mockRejectedValue(selected);
  await expect(importClientCredentials(directory)).rejects.toBe(selected);
  expect(load).toHaveBeenCalledExactlyOnceWith({ id: Buffer.from(id), key: Buffer.from(key) });
});

test.each([
  ['bgroupcert.dat', 'zgpriv.dat'],
  ['BGROUPCERT', 'ZGPRIV'],
  ['Bgroupcert.DAT', 'Zgpriv.Dat'],
])('discovers exact PlayReady aliases %s + %s and ignores backups', async (cert, key) => {
  const directory = await createDirectory([cert, key, 'bgroupcert.dat.bak', 'old_zgpriv']);
  const load = vi.spyOn(PlayReadyClientCredentials, 'from').mockRejectedValue(selected);
  await expect(importClientCredentials(directory)).rejects.toBe(selected);
  expect(load).toHaveBeenCalledExactlyOnceWith({
    groupCertificate: Buffer.from(cert),
    groupKey: Buffer.from(key),
  });
});

test.each(['device.WVD', 'device.PrD'])('imports and discovers packed %s', async (name) => {
  const directory = await createDirectory([name]);
  const type = name.endsWith('WVD') ? WidevineClientCredentials : PlayReadyClientCredentials;
  const load = vi.spyOn(type, 'from').mockRejectedValue(selected);
  await expect(importClientCredentials(join(directory, name))).rejects.toBe(selected);
  await expect(importClientCredentials(directory)).rejects.toBe(selected);
  expect(load).toHaveBeenCalledTimes(2);
});

test.each(['export.WVD', 'export.PrD'])('uses case-insensitive output hint %s', async (output) => {
  const directory = await createDirectory(['device.WVD', 'device.PRD']);
  const widevine = vi.spyOn(WidevineClientCredentials, 'from').mockRejectedValue(selected);
  const playready = vi.spyOn(PlayReadyClientCredentials, 'from').mockRejectedValue(selected);
  await expect(importClientCredentials(directory, output)).rejects.toBe(selected);
  expect(widevine).toHaveBeenCalledTimes(output.endsWith('WVD') ? 1 : 0);
  expect(playready).toHaveBeenCalledTimes(output.endsWith('PrD') ? 1 : 0);
  await expect(importClientCredentials(directory)).rejects.toThrow('Ambiguous credential files');
});

test.each([
  ['device_client_id_blob.bak', 'device_private_key.bak'],
  ['old_bgroupcert', 'old_zgpriv'],
  ['device_client_id_blob'],
  ['bgroupcert.dat'],
])('ignores backup-only and incomplete raw sets: %j', async (...names) => {
  const directory = await createDirectory(names);
  await expect(importClientCredentials(directory)).rejects.toThrow(
    'Unable to find credential files',
  );
});

test.each([
  ['DEVICE_CLIENT_ID_BLOB', 'device_private_key', 'private_key.pem'],
  ['bgroupcert.dat', 'BGROUPCERT', 'zgpriv'],
])('rejects multiple raw aliases: %j', async (...names) => {
  const directory = await createDirectory(names);
  await expect(importClientCredentials(directory)).rejects.toThrow(
    'Ambiguous raw credential files',
  );
});
