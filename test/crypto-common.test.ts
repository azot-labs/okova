import { expect, test } from 'vitest';
import { aesEcbEncrypt } from '../src/lib/crypto/common';
import { fromBuffer, fromHex } from '../src/lib/utils';

test('aesEcbEncrypt matches the NIST AES-128 ECB vector for multiple blocks', async () => {
  const key = fromHex('2b7e151628aed2a6abf7158809cf4f3c').toBuffer();
  const plaintext = fromHex(
    '6bc1bee22e409f96e93d7e117393172a' +
      'ae2d8a571e03ac9c9eb76fac45af8e51',
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
