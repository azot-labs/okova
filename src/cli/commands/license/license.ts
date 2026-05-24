import { help } from './help';
import { importClient } from '../../utils';
import { fetchDecryptionKeys, PlayReady, Widevine } from '../../../lib';
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
