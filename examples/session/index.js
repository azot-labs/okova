import { readFile } from 'node:fs/promises';
import { fromBase64, Widevine, requestMediaKeySystemAccess } from 'okova';

async function main() {
  // Prepare pssh
  const initDataType = 'cenc';
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  // Load device/client
  const clientData = await readFile('client.wvd');
  const client = await Widevine.Client.from({ wvd: clientData });

  const cdm = new Widevine({ client });

  // Create session
  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
  const session = mediaKeys.createSession();

  // Get license challenge
  session.generateRequest(initDataType, initData);
  const challenge = await session.waitForLicenseRequest();

  // Send license request
  const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const response = await fetch(licenseUrl, {
    body: challenge,
    method: 'POST',
  })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  // Update session with license response
  await session.update(response);

  // Print keys
  const keys = await session.waitForKeyStatusesChange();
  for (const key of keys) {
    console.log(`${key.keyId}:${key.key}`);
  }

  // Close session to delete of any license(s) and key(s) that have not been explicitly stored.
  await session.close();

  // Destroy the license(s) and/or key(s) associated with the session whether they are in memory, persistent store or both.
  await session.remove();
}

main();
