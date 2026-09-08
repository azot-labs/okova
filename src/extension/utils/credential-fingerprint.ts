import { storage } from '#imports';
import type { CredentialsInfo } from './storage';
import { fromBase64, fromBuffer } from '@okova/lib';

const fingerprintKey = storage.defineItem<string>('local:diagnostic-fingerprint-key');

// Remote configuration includes guessable secrets. Keep the HMAC key local and out of traces.
export const getCredentialFingerprint = async (info: CredentialsInfo) => {
  const data = new TextEncoder().encode(JSON.stringify(info));
  if (info.type !== 'remote') {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return fromBuffer(new Uint8Array(digest)).toHex();
  }
  const encodedKey = await navigator.locks.request('okova:diagnostic-fingerprint-key', async () => {
    const stored = await fingerprintKey.getValue();
    if (stored) return stored;
    const generated = fromBuffer(crypto.getRandomValues(new Uint8Array(32))).toBase64();
    await fingerprintKey.setValue(generated);
    return generated;
  });
  const key = await crypto.subtle.importKey(
    'raw',
    fromBase64(encodedKey).toBuffer(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, data);
  return `v2:${fromBuffer(new Uint8Array(digest)).toHex()}`;
};

// Old remote traces contain an unkeyed secret verifier. Never display or export that digest.
export const getShareableCredentialFingerprint = (credential: {
  type: string;
  fingerprint: string;
}) =>
  credential.type === 'remote' && !credential.fingerprint.startsWith('v2:')
    ? undefined
    : credential.fingerprint || undefined;
