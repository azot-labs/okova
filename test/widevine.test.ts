import { expect, test } from 'vitest';
import { fromBase64 } from '../src/lib';
import { PSSH, LICENSE_URL, createClient } from './utils';
import { requestMediaKeySystemAccess } from '../src/lib/api';
import { Widevine } from '../src/lib/widevine/cdm';

test('widevine cdm', async () => {
  const client = await createClient();
  const cdm = new Widevine({ client });

  const initDataType = 'cenc';
  const initData = fromBase64(PSSH).toBuffer();

  const keySystemAccess = requestMediaKeySystemAccess('com.widevine.alpha', [
    { cdm },
  ]);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();
  session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(LICENSE_URL, {
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
