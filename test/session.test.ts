import { readFile } from 'node:fs/promises';
import { fromBase64 } from '../src/lib';
import { expect, test } from 'vitest';
import { WidevineClient } from '../src/lib/widevine/client';
import { Session } from '../src/lib/widevine/session';

test('session', async () => {
  // Prepare pssh
  const initDataType = 'cenc';
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  // Load device/client
  const wvd = await readFile('./clients/client.wvd');
  const client = await WidevineClient.from({ wvd });

  // Create session
  const session = new Session('temporary', client);

  // Get license challenge
  const challenge = await session.generateRequest(initDataType, initData);

  // Send license request
  const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const response = await fetch(licenseUrl, { body: challenge, method: 'POST' });
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
