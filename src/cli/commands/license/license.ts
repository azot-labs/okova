import { help } from './help';
import { importClientCredentials } from '../../utils';
import { fetchDecryptionKeys, PlayReady, Widevine, toBufferSource } from '../../../lib';
import { WidevineClientCredentials } from '../../../lib/widevine/client-credentials';

type LicenseCommandParams = {
  url: string;
  pssh: string;
  credentialsPath?: string;
  encrypt?: boolean;
  headers?: string[];
};

export const license = async (params: LicenseCommandParams) => {
  const headers = Object.fromEntries(
    params.headers?.map((header) => {
      const separator = header.indexOf(':');
      if (separator === -1) return [header.trim()];
      return [header.slice(0, separator).trim(), header.slice(separator + 1).trim()];
    }) || [],
  );
  const credentials = await importClientCredentials(params.credentialsPath || process.cwd());
  const cdm =
    credentials instanceof WidevineClientCredentials
      ? new Widevine({ clientCredentials: credentials })
      : new PlayReady({ clientCredentials: credentials });
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
