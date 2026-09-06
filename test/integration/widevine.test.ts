import { readFile } from 'node:fs/promises';
import { expect, test, onTestFinished } from 'vitest';
import {
  fromBase64,
  toBufferSource,
  WidevineDeviceCredentials,
  Widevine,
  requestMediaKeySystemAccess,
  setSupportedEngines,
} from '../../src/lib';

test('widevine native session', async ({ skip }) => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();

  const credentialsPath = process.env.VITEST_WVD_PATH;
  if (!credentialsPath) {
    skip('Set VITEST_WVD_PATH to enable this test');
    return;
  }
  const credentialsData = await readFile(credentialsPath);
  const credentials = await WidevineDeviceCredentials.from({ wvd: credentialsData });
  const widevine = new Widevine({ deviceCredentials: credentials });
  const session = widevine.createSession();
  onTestFinished(() => session.close());

  const challenge = await session.generateRequest('cenc', initData);
  expect(challenge).toBeDefined();
  const response = await fetch(url, {
    body: challenge ? toBufferSource(challenge) : undefined,
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
  });
  expect(response.ok, `License HTTP ${response.status}`).toBe(true);
  await session.update(new Uint8Array(await response.arrayBuffer()));

  expect(session.keys.size).toBe(5);
  expect(session.keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe(
    '9cc0c92044cb1d69433f5f5839a159df',
  );
});

test('widevine cdm', async ({ skip }) => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const clientPath = process.env.VITEST_WVD_PATH;
  if (!clientPath) {
    skip('Set the DRM device path to enable this test');
    return;
  }
  const clientData = await readFile(clientPath);
  const client = await Widevine.DeviceCredentials.from({ wvd: clientData });
  const engine = new Widevine({ deviceCredentials: client });

  setSupportedEngines([engine]);
  const keySystemAccess = await requestMediaKeySystemAccess(engine.keySystem, [{}]);
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
});
