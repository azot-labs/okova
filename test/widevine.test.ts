import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { fromBase64, toBufferSource, WidevineDeviceCredentials } from '../src/lib';
import { requestMediaKeySystemAccess, setSupportedEngines } from '../src/lib/api';
import { Widevine } from '../src/lib/widevine/engine';
import {
  ClientIdentification,
  EncryptedClientIdentification,
  LicenseRequest,
  SignedMessage,
} from '../src/lib/widevine/proto';

const SERVICE_CERTIFICATE = `CAUSxQUKvwIIAxIQKHA0VMAI9jYYredEPbbEyBiL5/mQBSKOAjCCAQoCggEBALUhErjQXQI/zF2V4sJRwcZJtBd82NK+7zVbsGdD3mYePSq8MYK3mUbVX9wI3+lUB4FemmJ0syKix/XgZ7tfCsB6idRa6pSyUW8HW2bvgR0NJuG5priU8rmFeWKqFxxPZmMNPkxgJxiJf14e+baq9a1Nuip+FBdt8TSh0xhbWiGKwFpMQfCB7/+Ao6BAxQsJu8dA7tzY8U1nWpGYD5LKfdxkagatrVEB90oOSYzAHwBTK6wheFC9kF6QkjZWt9/v70JIZ2fzPvYoPU9CVKtyWJOQvuVYCPHWaAgNRdiTwryi901goMDQoJk87wFgRwMzTDY4E5SGvJ2vJP1noH+a2UMCAwEAAToSc3RhZ2luZy5nb29nbGUuY29tEoADmD4wNSZ19AunFfwkm9rl1KxySaJmZSHkNlVzlSlyH/iA4KrvxeJ7yYDa6tq/P8OG0ISgLIJTeEjMdT/0l7ARp9qXeIoA4qprhM19ccB6SOv2FgLMpaPzIDCnKVww2pFbkdwYubyVk7jei7UPDe3BKTi46eA5zd4Y+oLoG7AyYw/pVdhaVmzhVDAL9tTBvRJpZjVrKH1lexjOY9Dv1F/FJp6X6rEctWPlVkOyb/SfEJwhAa/K81uDLyiPDZ1Flg4lnoX7XSTb0s+Cdkxd2b9yfvvpyGH4aTIfat4YkF9Nkvmm2mU224R1hx0WjocLsjA89wxul4TJPS3oRa2CYr5+DU4uSgdZzvgtEJ0lksckKfjAF0K64rPeytvDPD5fS69eFuy3Tq26/LfGcF96njtvOUA4P5xRFtICogySKe6WnCUZcYMDtQ0BMMM1LgawFNg4VA+KDCJ8ABHg9bOOTimO0sswHrRWSWX1XF15dXolCk65yEqz5lOfa2/fVomeopkU`;

test('widevine engine enables privacy mode automatically after setServerCertificate', async () => {
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  let encryptIdCalls = 0;
  const deviceCredentials = {
    id: ClientIdentification.create({}),
    encryptId: async () => {
      encryptIdCalls += 1;
      return EncryptedClientIdentification.create({
        providerId: 'staging.google.com',
        serviceCertificateSerialNumber: new Uint8Array([1, 2, 3]),
        encryptedClientId: new Uint8Array([4, 5, 6]),
        encryptedClientIdIv: new Uint8Array(16),
        encryptedPrivacyKey: new Uint8Array([7, 8, 9]),
      });
    },
    signWithKey: async () => new Uint8Array([0xaa]),
  } as unknown as WidevineDeviceCredentials;

  const engine = new Widevine({ deviceCredentials });
  const session = engine.createSession();

  await engine.setServerCertificate(fromBase64(SERVICE_CERTIFICATE).toBuffer());
  const challenge = await session.generateRequest('cenc', initData);

  expect(challenge).toBeDefined();
  expect(encryptIdCalls).toBe(1);

  const signedMessage = SignedMessage.decode(challenge!);
  const licenseRequest = LicenseRequest.decode(signedMessage.msg);

  expect(licenseRequest.clientId).toBeNull();
  expect(licenseRequest.encryptedClientId).toBeDefined();
  expect(licenseRequest.encryptedClientId?.providerId).toBe('staging.google.com');
});

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
