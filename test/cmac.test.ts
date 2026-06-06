import { describe, expect, test } from 'vitest';
import { aesCmac } from '../src/lib/crypto/cmac';
import { fromBuffer, fromHex } from '../src/lib/utils';

const KEY = fromHex('2b7e151628aed2a6abf7158809cf4f3c').toBuffer();

describe('aesCmac', () => {
  test('matches the NIST vector for an empty message', async () => {
    const mac = await aesCmac(KEY, new Uint8Array());
    expect(fromBuffer(mac).toHex()).toBe('bb1d6929e95937287fa37d129b756746');
  });

  test('matches the NIST vector for a single full block', async () => {
    const mac = await aesCmac(KEY, fromHex('6bc1bee22e409f96e93d7e117393172a').toBuffer());
    expect(fromBuffer(mac).toHex()).toBe('070a16b46b4d4144f79bdd9dd04a287c');
  });

  test('matches the NIST vector for a multi-block partial message', async () => {
    const message = fromHex(
      '6bc1bee22e409f96e93d7e117393172a' + 'ae2d8a571e03ac9c9eb76fac45af8e51' + '30c81c46a35ce411',
    ).toBuffer();

    const mac = await aesCmac(KEY, message);
    expect(fromBuffer(mac).toHex()).toBe('dfa66747de9ae63030ca32611497c827');
  });

  test('rejects unsupported key lengths', async () => {
    await expect(aesCmac(new Uint8Array(15), new Uint8Array())).rejects.toThrow(
      'Keys must be 128, 192, or 256 bits in length.',
    );
  });
});
