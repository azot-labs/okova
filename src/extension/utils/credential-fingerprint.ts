import type { CredentialsInfo } from './storage';
import { fromBuffer } from '@okova/lib';

// Hash the same serialized configuration in capture diagnostics and credential details.
export const getCredentialFingerprint = async (info: CredentialsInfo) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(info)),
  );
  return fromBuffer(new Uint8Array(digest)).toHex();
};
