import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { appStorage } from '../../src/extension/utils/storage';
import { PlayReadyClientCredentials } from '../../src/lib/playready/client-credentials';
import {
  setupWorkerTests,
  startWorker,
  pendingRecords,
} from '../helpers/extension-session-restart';

setupWorkerTests();
const prdPath = process.env.VITEST_PRD_PATH;

test.skipIf(!prdPath)('restores a PlayReady challenge with no selected credentials', async () => {
  await appStorage.credentials.active.setValue(
    await PlayReadyClientCredentials.from({ prd: await readFile(prdPath!) }),
  );
  const wrm =
    '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0"><DATA><PROTECTINFO><KEYLEN>16</KEYLEN><ALGID>AESCTR</ALGID></PROTECTINFO><KID>AAAAAAAAAAAAAAAAAAAAAA==</KID></DATA></WRMHEADER>';
  let send = startWorker();
  await send('generateRequest', 'one', {
    keySystem: 'com.microsoft.playready',
    initData: Buffer.from(wrm, 'utf16le').toString('base64'),
  });
  const challenge = await send('license-request');
  expect(challenge).toEqual(expect.any(String));
  await appStorage.credentials.active.setValue(null);
  send = startWorker();
  expect(await send('license-request')).toBe(challenge);
  await send('close');
  expect(await pendingRecords()).toEqual([]);
});
