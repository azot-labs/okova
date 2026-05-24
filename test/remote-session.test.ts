import { expect, test } from 'vitest';
import {
  fromBase64,
  Remote,
  requestMediaKeySystemAccess,
  setSupportedEngines,
  toBufferSource,
} from '../src/lib';

test('remote session', async () => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const baseUrl = process.env.VITEST_REMOTE_BASE_URL;
  if (!baseUrl) {
    console.warn('Remote session config not found. Skipping test');
    return;
  }

  const secret = process.env.VITEST_REMOTE_SECRET;
  const client = process.env.VITEST_REMOTE_CLIENT ?? 'pixel6';

  const cdm = new Remote({
    keySystem: 'com.widevine.alpha',
    baseUrl,
    secret,
    client,
  });

  setSupportedEngines([cdm]);
  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();
  await session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(url, {
    body: toBufferSource(licenseRequest),
    method: 'POST',
  })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  await session.update(response);
  const keys = await session.waitForKeyStatusesChange();

  expect(keys.size).toBe(5);
  expect(keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe('9cc0c92044cb1d69433f5f5839a159df');

  await session.close();
  await session.remove();
});
