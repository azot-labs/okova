import { connect, fromBase64 } from 'inspectine';

const BASE_URL = 'http://127.0.0.1:4000'; // Set your API base URL here
const SECRET_KEY = 'db44ec40-3e02-47bd-8fc6-373935e30eae'; // Set your API secret here
const CLIENT_NAME = 'Pixel_10_Pro_L3'; // Set client name related with your API key

async function main() {
  // Prepare pssh
  const initDataType = 'cenc';
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  // Connect to remote instance
  const { createSession } = connect({ baseUrl: BASE_URL, secret: SECRET_KEY });

  // Create session
  const session = await createSession('temporary', CLIENT_NAME);

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

  // Close session to delete of any license(s) and key(s) that have not been explicitly stored.
  await session.close();

  // Destroy the license(s) and/or key(s) associated with the session whether they are in memory, persistent store or both.
  await session.remove();
}

main();
