import { expect, test } from 'vitest';
import { connect, fromBase64 } from '../src/lib';

test('remote session', async () => {
  // Prepare pssh
  const initDataType = 'cenc';
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  // Define device/client name
  const client = 'pixel6';

  // Connect to remote instance
  const baseUrl = 'https://azot.pw'; // Set your API base URL here
  const secret: string = '...'; // Set your API secret here
  if (secret === '...')
    return console.warn('Add your API endpoint & secret to test connection');
  const { createSession } = connect({ baseUrl, secret });

  // Create session
  const session = await createSession('temporary', client);

  // Get license challenge
  const challenge = await session.generateRequest(initDataType, initData);

  // Send license request
  const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const response = await fetch(licenseUrl, { body: challenge, method: 'POST' });
  const license = await response.arrayBuffer().then((ab) => new Uint8Array(ab));

  // Update session with license
  await session.update(license);

  // Get and print keys
  const keys = await session.getKeys();
  for (const { type, kid, key } of keys) {
    console.log(`[${type}] ${kid}:${key}`);
  }
  expect(keys.length).toBe(5);

  // Close session to delete of any license(s) and key(s) that have not been explicitly stored.
  await session.close();

  // Destroy the license(s) and/or key(s) associated with the session whether they are in memory, persistent store or both.
  await session.remove();
});
