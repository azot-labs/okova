import { readFile } from 'node:fs/promises';
import { Client, fromBase64, fromBuffer } from 'azot';

(async () => {
  const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';

  // If you have device_client_id_blob and device_private_key files
  // const id = await readFile('device_client_id_blob');
  // const key = await readFile('device_private_key');
  // const client = await Client.fromUnpacked(id, key);

  // If you have *.wvd file
  const wvd = await readFile('client.wvd');
  const client = await Client.fromPacked(wvd);

  const initDataType = 'cenc';
  const initData = fromBase64(pssh).toBuffer();

  const keySystemAccess = client.requestMediaKeySystemAccess(
    'com.widevine.alpha',
    [],
  );
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();

  session.addEventListener(
    'message',
    async (event) => {
      const response = await fetch(licenseUrl, {
        body: event.message,
        method: 'POST',
      });
      const data = await response
        .arrayBuffer()
        .then((buffer) => new Uint8Array(buffer));
      session.update(data);
    },
    false,
  );

  session.addEventListener(
    'keystatuseschange',
    () => {
      const keys = Array.from(session.keyStatuses.keys());
      for (const key of keys) {
        const [id, value] = fromBuffer(key).toText().split(':');
        console.log(`${id}:${value}`);
      }
    },
    false,
  );

  await session.generateRequest(initDataType, initData);
})();
