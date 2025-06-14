import { p256 } from '@noble/curves/nist';
import { AffinePoint } from '@noble/curves/abstract/curve';
import * as utils from '@noble/curves/utils';
import { getRandomBytes } from '../utils';
import { createSha256 } from './common';

export class EccKey {
  privateKey: bigint;
  publicKey: AffinePoint<bigint>;

  constructor(privateKey: bigint, publicKey: AffinePoint<bigint>) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  static randomScalar() {
    const randomBytes = getRandomBytes(32);
    return utils.bytesToNumberBE(randomBytes) % p256.CURVE.n;
  }

  static generate() {
    const privateKey = EccKey.randomScalar();
    const publicKey = p256.Point.BASE.multiply(privateKey).toAffine();
    return new EccKey(privateKey, publicKey);
  }

  static construct(privateKey: bigint) {
    const publicKey = p256.Point.BASE.multiply(privateKey).toAffine();
    return new EccKey(privateKey, publicKey);
  }

  static from(data: Uint8Array) {
    const privateBytes = data.subarray(0, 32);
    return EccKey.construct(utils.bytesToNumberBE(privateBytes));
  }

  dumps() {
    return new Uint8Array([...this.privateBytes(), ...this.publicBytes()]);
  }

  privateBytes() {
    return utils.numberToBytesBE(this.privateKey, 32);
  }

  publicBytes() {
    return new Uint8Array([
      ...utils.numberToBytesBE(this.publicKey.x, 32),
      ...utils.numberToBytesBE(this.publicKey.y, 32),
    ]);
  }

  privateSha256Digest() {
    return createSha256(this.publicBytes());
  }

  publicSha256Digest() {
    return createSha256(this.publicBytes());
  }
}
