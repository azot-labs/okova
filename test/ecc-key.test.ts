import { p256 } from '@noble/curves/nist.js';
import { numberToBytesBE } from '@noble/curves/utils.js';
import { afterEach, expect, test, vi } from 'vitest';
import { EccKey } from '../src/lib/crypto/ecc-key';
import { ElGamal } from '../src/lib/crypto/elgamal';
import * as utils from '../src/lib/utils';

afterEach(() => {
  vi.restoreAllMocks();
});

test.each([1n, p256.Point.Fn.ORDER - 1n])(
  'randomScalar rejects zero and out-of-range samples before accepting %s',
  (validScalar) => {
    const randomBytes = vi.spyOn(utils, 'getRandomBytes').mockImplementation(() => {
      throw new Error('Unexpected extra random sample');
    });
    for (const scalar of [
      0n,
      p256.Point.Fn.ORDER,
      p256.Point.Fn.ORDER + 1n,
      (1n << 256n) - 1n,
      validScalar,
    ]) {
      randomBytes.mockReturnValueOnce(numberToBytesBE(scalar, 32));
    }

    expect(EccKey.randomScalar()).toBe(validScalar);
    expect(randomBytes).toHaveBeenCalledTimes(5);
    expect(randomBytes).toHaveBeenCalledWith(32);
  },
);

test('device and ElGamal keys recover from invalid random samples', () => {
  vi.spyOn(utils, 'getRandomBytes')
    .mockImplementation(() => {
      throw new Error('Unexpected extra random sample');
    })
    .mockReturnValueOnce(numberToBytesBE(0n, 32))
    .mockReturnValueOnce(numberToBytesBE(2n, 32))
    .mockReturnValueOnce(numberToBytesBE(p256.Point.Fn.ORDER, 32))
    .mockReturnValueOnce(numberToBytesBE(3n, 32));

  const key = EccKey.generate();
  expect(key.privateKey).toBe(2n);
  expect(key.publicKey).toEqual(p256.Point.BASE.multiply(2n).toAffine());

  const message = p256.Point.BASE.multiply(7n).toAffine();
  const encrypted = ElGamal.encrypt(message, key.publicKey);
  expect(encrypted.point1).toEqual(p256.Point.BASE.multiply(3n).toAffine());
  expect(ElGamal.decrypt(encrypted, key.privateKey)).toEqual(message);
});
