import { help } from './help';
import { importClient } from '../../utils';
import { fetchDecryptionKeys, PlayReady, Widevine, toBufferSource } from '../../../lib';
import { WidevineDeviceCredentials } from '../../../lib/widevine/device-credentials';

type LicenseCommandParams = {
  url: string;
  pssh: string;
  clientPath?: string;
  encrypt?: boolean;
  headers?: string[];
};

export const license = async (params: LicenseCommandParams) => {
  const headers = Object.fromEntries(
    params.headers?.map((header) => header.split(':').map((s) => s.trim())) || [],
  );
  const client = await importClient(params.clientPath || process.cwd());
  const cdm =
    client instanceof WidevineDeviceCredentials
      ? new Widevine({ deviceCredentials: client })
      : new PlayReady({ deviceCredentials: client });
  if (params.encrypt) {
    if (!(cdm instanceof Widevine)) {
      throw new Error('--encrypt is supported only for Widevine');
    }
    const response = await fetch(params.url, {
      method: 'POST',
      headers,
      body: toBufferSource(new Uint8Array([0x08, 0x04])),
    });
    if (!response.ok) {
      throw new Error(
        `Service certificate request failed: ${response.status} ${response.statusText}`,
      );
    }
    await cdm.setServerCertificate(new Uint8Array(await response.arrayBuffer()));
  }
  const keys = await fetchDecryptionKeys({
    cdm,
    pssh: params.pssh,
    server: params.url,
    headers,
  });
  for (const [keyId, key] of keys) {
    console.log(`${keyId}:${key}`);
  }
  return keys;
};

license.help = help;
