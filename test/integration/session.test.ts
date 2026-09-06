import { beforeEach } from 'vitest';
import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { fromBase64, toBufferSource, WidevineDeviceCredentials } from '../../src/lib';
import { WidevineSession } from '../../src/lib/widevine/session';

test('session', async () => {
  // Prepare pssh
  const initDataType = 'cenc';
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  // Load device/client
  const wvd = await readFile(process.env.VITEST_WVD_PATH!);
  const client = await WidevineDeviceCredentials.from({ wvd });

  // Create session
  const session = new WidevineSession('temporary', client);

  // Get license challenge
  const challenge = await session.generateRequest(initDataType, initData);

  // Send license request
  const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const response = await fetch(licenseUrl, {
    body: challenge ? toBufferSource(challenge) : undefined,
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
  });
  const license = await response.arrayBuffer().then((ab) => new Uint8Array(ab));

  // Update session with license
  await session.update(license);

  // Print keys
  const keys = await session.getKeys();
  for (const key of keys) {
    console.log(`[${key.type}] ${key.id}:${key.value}`);
  }
  expect(session.keys.size).toBe(5);

  // Close session to delete of any license(s) and key(s) that have not been explicitly stored.
  await session.close();

  // Destroy the license(s) and/or key(s) associated with the session whether they are in memory, persistent store or both.
  await session.remove();
});

beforeEach(({ skip }) => {
  if (!process.env.VITEST_WVD_PATH) skip('Set VITEST_WVD_PATH to enable this demo');
});
