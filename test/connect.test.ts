import { expect, test } from 'vitest';
import { connect } from '../src/lib';

test('connection to Azot API instance and generating license request', async () => {
  const baseUrl = 'https://azot.pw'; // Set your API base URL here
  const secret: string = 'db44ec40-3e02-47bd-8fc6-373935e30eae'; // Set your API secret here
  const client = 'pixel6'; // Set client name related with your API key
  if (secret === 'db44ec40-3e02-47bd-8fc6-373935e30eae')
    return console.warn('Add your API endpoint & secret to test connection');
  const { createSession } = connect({ baseUrl, secret });
  const session = await createSession(client);
  const licenseRequest = await session.generateRequest(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
    'cenc',
  );
  const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const license = await fetch(licenseUrl, {
    body: Buffer.from(licenseRequest, 'base64'),
    method: 'POST',
  })
    .then((response) => response.arrayBuffer())
    .then((buffer) => Buffer.from(buffer));
  await session.update(license.toString('base64'));
  const keys = await session.keys();
  expect(keys.length).toBe(5);
});
