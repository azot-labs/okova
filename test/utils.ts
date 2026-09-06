import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { Widevine, fetchDecryptionKeys } from '../src/lib';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';

export const WORKDIR = join(process.cwd(), '');

// https://bitmovin.com/demos/drm
export const PSSH =
  'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
export const LICENSE_URL = 'https://cwip-shaka-proxy.appspot.com/no_auth';

export const loadWidevineClientData = async () => {
  const clientPath = process.env.VITEST_WVD_PATH;
  if (!clientPath) throw new Error('Set VITEST_WVD_PATH to enable device tests');
  return readFile(clientPath);
};

export const createClient = async () =>
  WidevineDeviceCredentials.from({ wvd: await loadWidevineClientData() });

export const loadWidevineDeviceCredentials = async () => {
  const clientData = await loadWidevineClientData();
  const deviceCredentials = await Widevine.DeviceCredentials.from({ wvd: clientData });
  return deviceCredentials;
};

export const fetchDecryptionKeysWithDefaults = async (
  deviceCredentials?: WidevineDeviceCredentials,
) => {
  const cdm = new Widevine({
    deviceCredentials: deviceCredentials || (await createClient()),
  });
  return fetchDecryptionKeys({
    cdm,
    server: LICENSE_URL,
    pssh: PSSH,
  });
};
