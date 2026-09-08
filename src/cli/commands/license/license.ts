import { validateHeaderValue } from 'node:http';
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
  const parsedHeaders = new Headers();
  for (const [index, header] of (params.headers ?? []).entries()) {
    const separator = header.indexOf(':');
    const name = header.slice(0, separator).trim();
    if (separator < 1 || !name || /[\r\n\0]/.test(header)) {
      throw new Error(`Invalid header argument ${index + 1}: expected Name: value`);
    }
    try {
      if (parsedHeaders.has(name)) {
        throw new Error('duplicate');
      }
      const value = header.slice(separator + 1).trim();
      validateHeaderValue(name, value);
      parsedHeaders.set(name, value);
    } catch {
      throw new Error(`Invalid or duplicate header name in argument ${index + 1}`);
    }
  }
  const headers = Object.fromEntries(parsedHeaders);
  const credentials = await importClientCredentials(params.credentialsPath || process.cwd());
  const cdm =
    credentials instanceof WidevineClientCredentials
      ? new Widevine({ clientCredentials: credentials })
      : new PlayReady({ clientCredentials: credentials });
  const signal = AbortSignal.timeout(30_000);
  if (params.encrypt) {
    if (!(cdm instanceof Widevine)) {
      throw new Error('--encrypt is supported only for Widevine');
    }
    const response = await fetch(params.url, {
      method: 'POST',
      signal,
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
    signal,
    headers,
  });
  for (const [keyId, key] of keys) {
    console.log(`${keyId}:${key}`);
  }
  return keys;
};

license.help = help;
