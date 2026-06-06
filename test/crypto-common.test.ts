import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import {
  aesEcbEncrypt,
  parseSpkiFromCertificateKey,
  toPKCS1,
  toPKCS8,
} from '../src/lib/crypto/common';
import { fromBase64, fromBuffer, fromHex } from '../src/lib/utils';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';

const SERVICE_CERTIFICATE_PUBLIC_KEY =
  'MIIBCgKCAQEAtSESuNBdAj/MXZXiwlHBxkm0F3zY0r7vNVuwZ0PeZh49KrwxgreZRtVf3Ajf6VQHgV6aYnSzIqLH9eBnu18KwHqJ1FrqlLJRbwdbZu+BHQ0m4bmmuJTyuYV5YqoXHE9mYw0+TGAnGIl/Xh75tqr1rU26Kn4UF23xNKHTGFtaIYrAWkxB8IHv/4CjoEDFCwm7x0Du3NjxTWdakZgPksp93GRqBq2tUQH3Sg5JjMAfAFMrrCF4UL2QXpCSNla33+/vQkhnZ/M+9ig9T0JUq3JYk5C+5VgI8dZoCA1F2JPCvKL3TWCgwNCgmTzvAWBHAzNMNjgTlIa8na8k/Wegf5rZQwIDAQAB';
const SERVICE_CERTIFICATE_SPKI =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtSESuNBdAj/MXZXiwlHBxkm0F3zY0r7vNVuwZ0PeZh49KrwxgreZRtVf3Ajf6VQHgV6aYnSzIqLH9eBnu18KwHqJ1FrqlLJRbwdbZu+BHQ0m4bmmuJTyuYV5YqoXHE9mYw0+TGAnGIl/Xh75tqr1rU26Kn4UF23xNKHTGFtaIYrAWkxB8IHv/4CjoEDFCwm7x0Du3NjxTWdakZgPksp93GRqBq2tUQH3Sg5JjMAfAFMrrCF4UL2QXpCSNla33+/vQkhnZ/M+9ig9T0JUq3JYk5C+5VgI8dZoCA1F2JPCvKL3TWCgwNCgmTzvAWBHAzNMNjgTlIa8na8k/Wegf5rZQwIDAQAB';

const normalizePem = (pem: string) => pem.trim().replace(/\r\n/g, '\n');

const widevineClientIdPath = process.env.VITEST_WIDEVINE_CLIENT_ID_PATH;
const widevinePrivateKeyPath = process.env.VITEST_WIDEVINE_PRIVATE_KEY_PATH;
const testWithWidevinePrivateKey = widevinePrivateKeyPath ? test : test.skip;
const testWithWidevineUnpackedClient =
  widevineClientIdPath && widevinePrivateKeyPath ? test : test.skip;

const readEnvFixture = async (path: string | undefined, label: string) => {
  if (!path) {
    throw new Error(`${label} path is not set`);
  }

  return readFile(path);
};

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

testWithWidevinePrivateKey(
  'toPKCS8 converts a PKCS#1 RSA private key into importable PKCS#8 PEM',
  async () => {
    const pkcs1 = normalizePem(
      await readEnvFixture(widevinePrivateKeyPath, 'Widevine private key').then((data) =>
        data.toString(),
      ),
    );

    const pkcs8 = await toPKCS8(pkcs1);
    const normalizedPkcs8 = normalizePem(pkcs8);
    const pkcs8Body = normalizedPkcs8.split('\n').slice(1, -1).join('\n');
    const pkcs8Der = fromBase64(pkcs8Body).toBuffer();

    expect(normalizedPkcs8).toMatch(/^-----BEGIN PRIVATE KEY-----\n/);
    expect(normalizedPkcs8).toMatch(/\n-----END PRIVATE KEY-----$/);
    await expect(
      crypto.subtle.importKey('pkcs8', pkcs8Der, { name: 'RSA-OAEP', hash: 'SHA-1' }, true, [
        'decrypt',
      ]),
    ).resolves.toBeInstanceOf(CryptoKey);
  },
);

testWithWidevinePrivateKey(
  'toPKCS1 converts exported PKCS#8 private keys back to the original PKCS#1 PEM',
  async () => {
    const pkcs1 = normalizePem(
      await readEnvFixture(widevinePrivateKeyPath, 'Widevine private key').then((data) =>
        data.toString(),
      ),
    );
    const pkcs8 = await toPKCS8(pkcs1);
    const converted = await toPKCS1(pkcs8);

    expect(normalizePem(converted)).toBe(pkcs1);
  },
);

testWithWidevineUnpackedClient(
  'Widevine device credentials import and export the fixture RSA key unchanged',
  async () => {
    const id = await readEnvFixture(widevineClientIdPath, 'Widevine client ID');
    const key = await readEnvFixture(widevinePrivateKeyPath, 'Widevine private key');
    const credentials = await WidevineDeviceCredentials.from({ id, key });
    const exported = await credentials.exportKey();

    expect(normalizePem(fromBuffer(exported).toText())).toBe(
      normalizePem(fromBuffer(key).toText()),
    );
  },
);

test('parseSpkiFromCertificateKey wraps a raw RSA public key in SPKI DER', async () => {
  const publicKey = fromBase64(SERVICE_CERTIFICATE_PUBLIC_KEY).toBuffer();
  const spki = await parseSpkiFromCertificateKey(publicKey);

  expect(fromBuffer(spki).toBase64()).toBe(SERVICE_CERTIFICATE_SPKI);
  await expect(
    crypto.subtle.importKey('spki', spki, { name: 'RSA-OAEP', hash: 'SHA-1' }, true, ['encrypt']),
  ).resolves.toBeInstanceOf(CryptoKey);
});
