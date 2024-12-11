import { fetchDecryptionKeys } from '../../../lib';
import { importClient } from '../../utils';
import { help } from './help';

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
  const keys = await fetchDecryptionKeys({
    server: params.url,
    pssh: params.pssh,
    client: await importClient(params.clientPath || process.cwd()),
    headers,
  });
  for (const key of keys) {
    console.log(`${key.id}:${key.value}`);
  }
  return keys;
};

license.help = help;
