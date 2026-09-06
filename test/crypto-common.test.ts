import { expect, test } from 'vitest';
import { aesEcbEncrypt, parseSpkiFromCertificateKey } from '../src/lib/crypto/common';
import { fromBase64, fromBuffer, fromHex } from '../src/lib/utils';

const SERVICE_CERTIFICATE_PUBLIC_KEY =
  'MIIBCgKCAQEAtSESuNBdAj/MXZXiwlHBxkm0F3zY0r7vNVuwZ0PeZh49KrwxgreZRtVf3Ajf6VQHgV6aYnSzIqLH9eBnu18KwHqJ1FrqlLJRbwdbZu+BHQ0m4bmmuJTyuYV5YqoXHE9mYw0+TGAnGIl/Xh75tqr1rU26Kn4UF23xNKHTGFtaIYrAWkxB8IHv/4CjoEDFCwm7x0Du3NjxTWdakZgPksp93GRqBq2tUQH3Sg5JjMAfAFMrrCF4UL2QXpCSNla33+/vQkhnZ/M+9ig9T0JUq3JYk5C+5VgI8dZoCA1F2JPCvKL3TWCgwNCgmTzvAWBHAzNMNjgTlIa8na8k/Wegf5rZQwIDAQAB';
const SERVICE_CERTIFICATE_SPKI =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtSESuNBdAj/MXZXiwlHBxkm0F3zY0r7vNVuwZ0PeZh49KrwxgreZRtVf3Ajf6VQHgV6aYnSzIqLH9eBnu18KwHqJ1FrqlLJRbwdbZu+BHQ0m4bmmuJTyuYV5YqoXHE9mYw0+TGAnGIl/Xh75tqr1rU26Kn4UF23xNKHTGFtaIYrAWkxB8IHv/4CjoEDFCwm7x0Du3NjxTWdakZgPksp93GRqBq2tUQH3Sg5JjMAfAFMrrCF4UL2QXpCSNla33+/vQkhnZ/M+9ig9T0JUq3JYk5C+5VgI8dZoCA1F2JPCvKL3TWCgwNCgmTzvAWBHAzNMNjgTlIa8na8k/Wegf5rZQwIDAQAB';

test('aesEcbEncrypt matches the NIST AES-128 ECB vector for multiple blocks', async () => {
  const key = fromHex('2b7e151628aed2a6abf7158809cf4f3c').toBuffer();
  const plaintext = fromHex(
    '6bc1bee22e409f96e93d7e117393172a' + 'ae2d8a571e03ac9c9eb76fac45af8e51',
  ).toBuffer();

  const ciphertext = await aesEcbEncrypt(key, plaintext.subarray(0));

  expect(fromBuffer(ciphertext).toHex()).toBe(
    '3ad77bb40d7a3660a89ecaf32466ef97' + 'f5d3d58503b9699de785895a96fdbaaf',
  );
});

test('aesEcbEncrypt rejects partial blocks', async () => {
  const key = fromHex('2b7e151628aed2a6abf7158809cf4f3c').toBuffer();

  await expect(aesEcbEncrypt(key, new Uint8Array(15))).rejects.toThrow(
    'AES-ECB input length must be a multiple of 16 bytes',
  );
});

test('parseSpkiFromCertificateKey wraps a raw RSA public key in SPKI DER', async () => {
  const publicKey = fromBase64(SERVICE_CERTIFICATE_PUBLIC_KEY).toBuffer();
  const spki = await parseSpkiFromCertificateKey(publicKey);

  expect(fromBuffer(spki).toBase64()).toBe(SERVICE_CERTIFICATE_SPKI);
  await expect(
    crypto.subtle.importKey('spki', spki, { name: 'RSA-OAEP', hash: 'SHA-1' }, true, ['encrypt']),
  ).resolves.toBeInstanceOf(CryptoKey);
});
