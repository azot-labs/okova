import { expect, test, onTestFinished } from 'vitest';
import {
  fromBase64,
  Remote,
  requestMediaKeySystemAccess,
  setSupportedEngines,
  toBufferSource,
} from '../../src/lib';

test('remote session', async ({ skip }) => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const baseUrl = process.env.VITEST_REMOTE_BASE_URL;
  if (!baseUrl) {
    skip('Set VITEST_REMOTE_BASE_URL to enable this test');
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

  const certificateResponse = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    body: toBufferSource(new Uint8Array([0x08, 0x04])),
  });
  if (!certificateResponse.ok) {
    throw new Error(`Service certificate request failed: ${certificateResponse.status}`);
  }
  await cdm.setServerCertificate(new Uint8Array(await certificateResponse.arrayBuffer()));

  setSupportedEngines([cdm]);
  const keySystemAccess = await requestMediaKeySystemAccess(cdm.keySystem, [{}]);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();
  onTestFinished(() => session.close());
  await session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(url, {
    body: toBufferSource(licenseRequest),
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
  })
    .then((response) => {
      expect(response.ok, `License HTTP ${response.status}`).toBe(true);
      return response.arrayBuffer();
    })
    .then((buffer) => new Uint8Array(buffer));

  await session.update(response);
  const keys = session.keys;

  expect(keys.size).toBe(5);
  expect(keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe('9cc0c92044cb1d69433f5f5839a159df');

  await session.remove();
});
