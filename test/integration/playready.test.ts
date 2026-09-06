import { readFile } from 'node:fs/promises';
import { expect, test, onTestFinished } from 'vitest';
import {
  fromBase64,
  toBufferSource,
  PlayReady,
  requestMediaKeySystemAccess,
  setSupportedEngines,
} from '../../src/lib';

test('playready cdm', async ({ skip }) => {
  const url =
    'https://test.playready.microsoft.com/service/rightsmanager.asmx?cfg=(persist:false,sl:2000)';
  const pssh =
    'AAADfHBzc2gAAAAAmgTweZhAQoarkuZb4IhflQAAA1xcAwAAAQABAFIDPABXAFIATQBIAEUAQQBEAEUAUgAgAHgAbQBsAG4AcwA9ACIAaAB0AHQAcAA6AC8ALwBzAGMAaABlAG0AYQBzAC4AbQBpAGMAcgBvAHMAbwBmAHQALgBjAG8AbQAvAEQAUgBNAC8AMgAwADAANwAvADAAMwAvAFAAbABhAHkAUgBlAGEAZAB5AEgAZQBhAGQAZQByACIAIAB2AGUAcgBzAGkAbwBuAD0AIgA0AC4AMAAuADAALgAwACIAPgA8AEQAQQBUAEEAPgA8AFAAUgBPAFQARQBDAFQASQBOAEYATwA+ADwASwBFAFkATABFAE4APgAxADYAPAAvAEsARQBZAEwARQBOAD4APABBAEwARwBJAEQAPgBBAEUAUwBDAFQAUgA8AC8AQQBMAEcASQBEAD4APAAvAFAAUgBPAFQARQBDAFQASQBOAEYATwA+ADwASwBJAEQAPgA0AFIAcABsAGIAKwBUAGIATgBFAFMAOAB0AEcAawBOAEYAVwBUAEUASABBAD0APQA8AC8ASwBJAEQAPgA8AEMASABFAEMASwBTAFUATQA+AEsATABqADMAUQB6AFEAUAAvAE4AQQA9ADwALwBDAEgARQBDAEsAUwBVAE0APgA8AEwAQQBfAFUAUgBMAD4AaAB0AHQAcABzADoALwAvAHAAcgBvAGYAZgBpAGMAaQBhAGwAcwBpAHQAZQAuAGsAZQB5AGQAZQBsAGkAdgBlAHIAeQAuAG0AZQBkAGkAYQBzAGUAcgB2AGkAYwBlAHMALgB3AGkAbgBkAG8AdwBzAC4AbgBlAHQALwBQAGwAYQB5AFIAZQBhAGQAeQAvADwALwBMAEEAXwBVAFIATAA+ADwAQwBVAFMAVABPAE0AQQBUAFQAUgBJAEIAVQBUAEUAUwA+ADwASQBJAFMAXwBEAFIATQBfAFYARQBSAFMASQBPAE4APgA4AC4AMQAuADIAMwAwADQALgAzADEAPAAvAEkASQBTAF8ARABSAE0AXwBWAEUAUgBTAEkATwBOAD4APAAvAEMAVQBTAFQATwBNAEEAVABUAFIASQBCAFUAVABFAFMAPgA8AC8ARABBAFQAQQA+ADwALwBXAFIATQBIAEUAQQBEAEUAUgA+AA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const clientPath = process.env.VITEST_PRD_PATH;
  if (!clientPath) {
    skip('Set the DRM device path to enable this test');
    return;
  }
  const clientData = await readFile(clientPath);
  const client = await PlayReady.DeviceCredentials.from({ prd: clientData });
  const cdm = new PlayReady({ deviceCredentials: client });

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
    headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
  })
    .then((response) => {
      expect(response.ok, `License HTTP ${response.status}`).toBe(true);
      return response.arrayBuffer();
    })
    .then((buffer) => new Uint8Array(buffer));

  await session.update(response);
  const keys = session.keys;

  expect(keys.size).toBe(1);
  expect(keys.get('6f651ae1dbe44434bcb4690d1564c41c')).toBe('88da852ae4fa2e1e36aeb2d5c94997b1');
});
