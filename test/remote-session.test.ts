import { expect, test } from 'vitest';
import { fromBase64, RemoteCdm, requestMediaKeySystemAccess } from '../src/lib';

test('remote session', async () => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const client = 'pixel6';
  const baseUrl = 'http://localhost:4000'; // Set your API base URL here
  const secret: string = ''; // Set your API secret here
  if (secret === '')
    return console.warn('Add your API endpoint & secret to test connection');

  const cdm = new RemoteCdm({
    keySystem: 'com.widevine.alpha',
    secret,
    baseUrl,
    client,
  });

  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
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

  await session.close();
  await session.remove();
});
