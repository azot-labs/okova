import { help } from './help';
import { importClient } from '../../utils';
import { fetchDecryptionKeys, PlayReadyCdm, WidevineCdm } from '../../../lib';
import { WidevineClient } from '../../../lib/widevine/client';

type LicenseCommandParams = {
  url: string;
  pssh: string;
  clientPath?: string;
  encrypt?: boolean;
  headers?: string[];
};

export const license = async (params: LicenseCommandParams) => {
  const headers = Object.fromEntries(
    params.headers?.map((header) => header.split(':').map((s) => s.trim())) ||
      [],
  );
  const client = await importClient(params.clientPath || process.cwd());
  const cdm =
    client instanceof WidevineClient
      ? new WidevineCdm({ client })
      : new PlayReadyCdm({ client });
  const keys = await fetchDecryptionKeys({
    cdm,
    pssh: params.pssh,
    server: params.url,
    headers,
  });
  for (const key of keys) {
    console.log(`${key.keyId}:${key.key}`);
  }
  return keys;
};

license.help = help;
