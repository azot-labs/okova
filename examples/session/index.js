import { readFile } from 'node:fs/promises';
import { fromBase64, Widevine, WidevineDeviceCredentials } from 'okova';

async function main() {
  // Prepare init data (PSSH)
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();

  // Load device credentials
  const deviceCredentials = await WidevineDeviceCredentials.from({
    wvd: await readFile('client.wvd'),
  });

  const widevine = new Widevine({ deviceCredentials });
  const session = widevine.createSession();

  // Handle outgoing license messages
  session.onmessage = async (event) => {
    const { message } = event.detail;
    const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
    const response = await fetch(licenseUrl, { body: message, method: 'POST' })
      .then((r) => r.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer));

    await session.update(response);
  };

  // Trigger the flow and wait for keys
  await session.generateRequest(initData);
  const keys = await session.waitForKeys();
  for (const [keyId, key] of keys) {
    console.log(`${keyId}:${key}`);
  }

  await session.close(); // Close session to delete of any license(s) and key(s) that have not been explicitly stored.
  await session.remove(); // Destroy the license(s) and/or key(s) associated with the session whether they are in memory, persistent store or both.
}

main();
