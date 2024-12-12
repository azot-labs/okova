import { connect } from 'azot';

const BASE_URL = 'http://127.0.0.1:4000'; // Set your API base URL here
const SECRET_KEY = 'db44ec40-3e02-47bd-8fc6-373935e30eae'; // Set your API secret here
const CLIENT_NAME = 'Pixel_10_Pro_L3'; // Set client name related with your API key

async function main() {
  const { createSession } = connect({ baseUrl: BASE_URL, secret: SECRET_KEY });
  const session = await createSession(CLIENT_NAME);
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
  for (const key of keys) console.log(`[${key.type}] ${key.id}:${key.value}`);
}

main();
