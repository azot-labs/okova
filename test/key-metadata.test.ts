import { expect, test } from 'vitest';
import { encryptWithAesCbc, importAesCbcKeyForEncrypt } from '../src/lib/crypto/common';
import { Key } from '../src/lib/widevine/key';
import { License } from '../src/lib/widevine/proto';

const ENCRYPTION_KEY = new Uint8Array(Array.from({ length: 16 }, (_, index) => index + 1));
const CONTENT_KEY = new Uint8Array(Array.from({ length: 16 }, (_, index) => 0xa0 + index));

const createEncryptedKey = async (iv: Uint8Array) =>
  encryptWithAesCbc(CONTENT_KEY, await importAesCbcKeyForEncrypt(ENCRYPTION_KEY), iv);

test('normalizes decimal key ids and extracts enabled operator-session permissions', async () => {
  const iv = new Uint8Array(16);
  iv[0] = 1;

  const key = await Key.fromContainer(
    License.KeyContainer.create({
      id: new TextEncoder().encode('123'),
      iv,
      key: await createEncryptedKey(iv),
      type: License.KeyContainer.KeyType.OPERATOR_SESSION,
      operatorSessionKeyPermissions: {
        allowEncrypt: true,
        allowDecrypt: false,
        allowSign: true,
        allowSignatureVerify: false,
      },
    }),
    ENCRYPTION_KEY,
  );

  expect(key.id).toBe('0000000000000000000000000000007b');
  expect(key.permissions).toEqual(['allowEncrypt', 'allowSign']);
});

test('normalizes short binary key ids to 16 bytes', async () => {
  const iv = new Uint8Array(16);
  iv[0] = 2;

  const key = await Key.fromContainer(
    License.KeyContainer.create({
      id: new Uint8Array([1, 2, 3]),
      iv,
      key: await createEncryptedKey(iv),
      type: License.KeyContainer.KeyType.CONTENT,
    }),
    ENCRYPTION_KEY,
  );

  expect(key.id).toBe('01020300000000000000000000000000');
  expect(key.permissions).toEqual([]);
});
