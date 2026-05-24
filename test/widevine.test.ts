import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { fromBase64, toBufferSource, WidevineDeviceCredentials } from '../src/lib';
import { requestMediaKeySystemAccess, setSupportedEngines } from '../src/lib/api';
import { Widevine } from '../src/lib/widevine/engine';

test('widevine native session', async () => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();

  const credentialsPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
  if (!credentialsPath) return console.warn('Widevine client not found. Skipping test');
  const credentialsData = await readFile(credentialsPath);
  const credentials = await WidevineDeviceCredentials.from({ wvd: credentialsData });
  const widevine = new Widevine({ deviceCredentials: credentials });
  const session = widevine.createSession();

  session.onmessage = async (event) => {
    const { message } = event.detail;
    // License request and individualization request are sent to the same URL
    const response = await fetch(url, { body: message, method: 'POST' });
    const data = await response.arrayBuffer().then((buffer) => new Uint8Array(buffer));
    await session.update(data);
  };

  await session.generateRequest(initData);
  await session.waitForKeys();

  expect(session.keys.size).toBe(5);
  expect(session.keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe(
    '9cc0c92044cb1d69433f5f5839a159df',
  );
});

test('widevine cdm', async () => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
  if (!clientPath) return console.warn('Widevine client not found. Skipping test');
  const clientData = await readFile(clientPath);
  const client = await Widevine.DeviceCredentials.from({ wvd: clientData });
  const engine = new Widevine({ deviceCredentials: client });

  setSupportedEngines([engine]);
  const keySystemAccess = requestMediaKeySystemAccess(engine.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();
  session.generateRequest(initDataType, initData);

  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(url, {
    body: toBufferSource(licenseRequest),
    method: 'POST',
  })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  session.update(response);
  const keys = await session.waitForKeyStatusesChange();

  expect(keys.size).toBe(5);
  expect(keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe('9cc0c92044cb1d69433f5f5839a159df');
});
