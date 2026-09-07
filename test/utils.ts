import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { Widevine, fetchDecryptionKeys } from '../src/lib';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';

export const WORKDIR = join(process.cwd(), '');

// https://bitmovin.com/demos/drm
export const PSSH =
  'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
export const LICENSE_URL = 'https://cwip-shaka-proxy.appspot.com/no_auth';

export const loadWidevineCredentialData = async () => {
  const credentialsPath = process.env.VITEST_WVD_PATH;
  if (!credentialsPath) throw new Error('Set VITEST_WVD_PATH to enable credential tests');
  return readFile(credentialsPath);
};

export const createCredentials = async () =>
  WidevineClientCredentials.from({ wvd: await loadWidevineCredentialData() });

export const loadWidevineClientCredentials = async () => {
  const credentialsData = await loadWidevineCredentialData();
  const clientCredentials = await Widevine.ClientCredentials.from({ wvd: credentialsData });
  return clientCredentials;
};

export const fetchDecryptionKeysWithDefaults = async (
  clientCredentials?: WidevineClientCredentials,
) => {
  const cdm = new Widevine({
    clientCredentials: clientCredentials || (await createCredentials()),
  });
  return fetchDecryptionKeys({
    cdm,
    server: LICENSE_URL,
    pssh: PSSH,
  });
};
