import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { fromBase64 } from '../src/lib';
import { requestMediaKeySystemAccess } from '../src/lib/api';
import { PlayReadyCdm } from '../src/lib/playready/cdm';

test('playready cdm', async () => {
  const url =
    'https://test.playready.microsoft.com/service/rightsmanager.asmx?cfg=(persist:false,sl:2000)';
  const pssh =
    'AAADfHBzc2gAAAAAmgTweZhAQoarkuZb4IhflQAAA1xcAwAAAQABAFIDPABXAFIATQBIAEUAQQBEAEUAUgAgAHgAbQBsAG4AcwA9ACIAaAB0AHQAcAA6AC8ALwBzAGMAaABlAG0AYQBzAC4AbQBpAGMAcgBvAHMAbwBmAHQALgBjAG8AbQAvAEQAUgBNAC8AMgAwADAANwAvADAAMwAvAFAAbABhAHkAUgBlAGEAZAB5AEgAZQBhAGQAZQByACIAIAB2AGUAcgBzAGkAbwBuAD0AIgA0AC4AMAAuADAALgAwACIAPgA8AEQAQQBUAEEAPgA8AFAAUgBPAFQARQBDAFQASQBOAEYATwA+ADwASwBFAFkATABFAE4APgAxADYAPAAvAEsARQBZAEwARQBOAD4APABBAEwARwBJAEQAPgBBAEUAUwBDAFQAUgA8AC8AQQBMAEcASQBEAD4APAAvAFAAUgBPAFQARQBDAFQASQBOAEYATwA+ADwASwBJAEQAPgA0AFIAcABsAGIAKwBUAGIATgBFAFMAOAB0AEcAawBOAEYAVwBUAEUASABBAD0APQA8AC8ASwBJAEQAPgA8AEMASABFAEMASwBTAFUATQA+AEsATABqADMAUQB6AFEAUAAvAE4AQQA9ADwALwBDAEgARQBDAEsAUwBVAE0APgA8AEwAQQBfAFUAUgBMAD4AaAB0AHQAcABzADoALwAvAHAAcgBvAGYAZgBpAGMAaQBhAGwAcwBpAHQAZQAuAGsAZQB5AGQAZQBsAGkAdgBlAHIAeQAuAG0AZQBkAGkAYQBzAGUAcgB2AGkAYwBlAHMALgB3AGkAbgBkAG8AdwBzAC4AbgBlAHQALwBQAGwAYQB5AFIAZQBhAGQAeQAvADwALwBMAEEAXwBVAFIATAA+ADwAQwBVAFMAVABPAE0AQQBUAFQAUgBJAEIAVQBUAEUAUwA+ADwASQBJAFMAXwBEAFIATQBfAFYARQBSAFMASQBPAE4APgA4AC4AMQAuADIAMwAwADQALgAzADEAPAAvAEkASQBTAF8ARABSAE0AXwBWAEUAUgBTAEkATwBOAD4APAAvAEMAVQBTAFQATwBNAEEAVABUAFIASQBCAFUAVABFAFMAPgA8AC8ARABBAFQAQQA+ADwALwBXAFIATQBIAEUAQQBEAEUAUgA+AA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const clientPath = process.env.VITEST_PLAYREADY_CLIENT_PATH;
  if (!clientPath)
    return console.warn('PlayReady client not found. Skipping test');
  const clientData = await readFile(clientPath);
  const client = await PlayReadyCdm.Client.from({ prd: clientData });
  const cdm = new PlayReadyCdm({ client });

  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
  const session = mediaKeys.createSession();
  session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(url, {
    body: licenseRequest,
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
  })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  session.update(response);
  const keys = await session.waitForKeyStatusesChange();

  expect(keys.length).toBe(1);
  expect(keys[0]).toBeDefined();
  expect(keys[0].keyId).toBe('6f651ae1dbe44434bcb4690d1564c41c');
  expect(keys[0].key).toBe('88da852ae4fa2e1e36aeb2d5c94997b1');
});
