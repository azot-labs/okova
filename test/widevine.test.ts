import { expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';
import { Client, fromBase64 } from '../src/lib';
import { requestMediaKeySystemAccess } from '../src/lib/api';
import { Widevine } from '../src/lib/widevine/cdm';

test('widevine cdm', async () => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
  if (!clientPath)
    return console.warn('Widevine client not found. Skipping test');
  const clientData = await readFile(clientPath);
  const client = await Client.fromPacked(clientData, 'wvd');
  const cdm = new Widevine({ client });

  const keySystemAccess = requestMediaKeySystemAccess('com.widevine.alpha', [
    { cdm },
  ]);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();
  session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(url, {
    body: licenseRequest,
    method: 'POST',
  })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  session.update(response);
  const keys = await session.waitForKeyStatusesChange();

  expect(keys.length).toBe(5);
  expect(keys[0]).toBeDefined();
  expect(keys[0].keyId).toBe('ccbf5fb4c2965be7aa130ffb3ba9fd73');
  expect(keys[0].key).toBe('9cc0c92044cb1d69433f5f5839a159df');
});
