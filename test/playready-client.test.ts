import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { fromBuffer } from '../src/lib';
import { PlayReadyDeviceCredentials } from '../src/lib/playready/device-credentials';
import { InvalidCertificateChain } from '../src/lib/playready/exceptions';

const WORKDIR = join(process.cwd(), '');

const loadPlayReadyClientData = async () => {
  const clientPath =
    process.env.VITEST_PLAYREADY_CLIENT_PATH ?? join(WORKDIR, 'clients', 'client.prd');
  return readFile(clientPath);
};

test('roundtrips playready device credentials', async () => {
  const prd = await loadPlayReadyClientData();
  const client = await PlayReadyDeviceCredentials.from({ prd });
  const repacked = client.pack();
  const unpacked = client.unpack();

  expect(fromBuffer(repacked).toBase64()).toBe(fromBuffer(prd).toBase64());
  expect(client.securityLevel).toBeGreaterThan(0);
  expect(client.label).toBeTruthy();
  expect(client.filename).toMatch(/^[a-z0-9_-]+$/);
  expect(Object.keys(unpacked).sort()).toEqual(['bgroupcert.dat', 'zgpriv.dat']);
  expect(unpacked['zgpriv.dat'].length).toBe(32);
  expect(unpacked['bgroupcert.dat'].length).toBeGreaterThan(0);
});

test('creates playready device credentials from unpacked fixtures', async () => {
  const prd = await loadPlayReadyClientData();
  const original = await PlayReadyDeviceCredentials.from({ prd });
  const unpacked = original.unpack();

  const recreated = await PlayReadyDeviceCredentials.from({
    groupKey: unpacked['zgpriv.dat'],
    groupCertificate: unpacked['bgroupcert.dat'],
  });

  expect(recreated.securityLevel).toBe(original.securityLevel);
  expect(recreated.label).toBe(original.label);
  expect(recreated.pack().length).toBeGreaterThan(0);
});

test('rejects unpacked playready credentials when the group key does not match the certificate', async () => {
  const prd = await loadPlayReadyClientData();
  const original = await PlayReadyDeviceCredentials.from({ prd });
  const unpacked = original.unpack();
  const mismatchedGroupKey = new Uint8Array(unpacked['zgpriv.dat']);
  mismatchedGroupKey[mismatchedGroupKey.length - 1] ^= 0x01;

  await expect(
    PlayReadyDeviceCredentials.from({
      groupKey: mismatchedGroupKey,
      groupCertificate: unpacked['bgroupcert.dat'],
    }),
  ).rejects.toBeInstanceOf(InvalidCertificateChain);
});
