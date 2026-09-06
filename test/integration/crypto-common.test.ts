import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';
import { toPKCS1, toPKCS8 } from '../../src/lib/crypto/common';
import { fromBase64, fromBuffer } from '../../src/lib/utils';
import { WidevineDeviceCredentials } from '../../src/lib/widevine/device-credentials';

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
