import { fromBase64, Remote, Session, toBufferSource } from 'okova';

const BASE_URL = 'http://127.0.0.1:4000'; // Set your API base URL here
const SECRET_KEY = 'db44ec40-3e02-47bd-8fc6-373935e30eae'; // Set your API secret here
const CLIENT_NAME = 'Pixel_10_Pro_L3'; // Set client name related with your API key
const LICENSE_URL = 'https://cwip-shaka-proxy.appspot.com/no_auth';

const main = async () => {
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  const cdm = new Remote({
    keySystem: 'com.widevine.alpha',
    baseUrl: BASE_URL,
    secret: SECRET_KEY,
    client: CLIENT_NAME,
  });

  // Obtain and validate the service certificate before generating a challenge.
  const certificateResponse = await fetch(LICENSE_URL, {
    method: 'POST',
    body: toBufferSource(new Uint8Array([0x08, 0x04])),
  });
  if (!certificateResponse.ok) {
    throw new Error(`Service certificate request failed: ${certificateResponse.status}`);
  }
  await cdm.setServerCertificate(new Uint8Array(await certificateResponse.arrayBuffer()));

  const session = new Session('temporary', cdm);
  try {
    await session.generateRequest('cenc', initData);
    const challenge = await session.waitForLicenseRequest();
    const response = await fetch(LICENSE_URL, {
      body: toBufferSource(challenge),
      method: 'POST',
    });
    if (!response.ok) throw new Error(`License request failed: ${response.status}`);
    await session.update(await response.arrayBuffer());

    const keys = await session.waitForKeyStatusesChange();
    for (const [keyId, key] of keys) {
      console.log(`${keyId}:${key}`);
    }
  } finally {
    await session.remove();
  }
};

await main();
