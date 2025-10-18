import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { WidevineCdm, fetchDecryptionKeys } from '../src/lib';
import { WidevineClient } from '../src/lib/widevine/client';

export const WORKDIR = join(process.cwd(), '');

// https://bitmovin.com/demos/drm
export const PSSH =
  'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
export const LICENSE_URL = 'https://cwip-shaka-proxy.appspot.com/no_auth';

export const read = async (filename: string) =>
  readFile(join(WORKDIR, 'clients', filename));

export const createClient = async () => {
  const id = await read('device_client_id_blob');
  const key = await read('device_private_key');
  return WidevineClient.fromUnpacked(id, key);
};

export const loadWidevineClient = async () => {
  const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
  if (!clientPath) throw new Error('Widevine client not found. Skipping test');
  const clientData = await readFile(clientPath);
  const client = await WidevineCdm.Client.from({ wvd: clientData });
  return client;
};

export const fetchDecryptionKeysWithDefaults = async (
  client?: WidevineClient,
) => {
  const cdm = new WidevineCdm({ client: client || (await createClient()) });
  return fetchDecryptionKeys({
    cdm,
    server: LICENSE_URL,
    pssh: PSSH,
  });
};
