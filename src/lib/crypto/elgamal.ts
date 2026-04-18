import { p256 } from '@noble/curves/nist.js';
import type { AffinePoint } from '@noble/curves/abstract/curve.js';
import { EccKey } from './ecc-key';

export class ElGamal {
  static encrypt(affineMessagePoint: AffinePoint<bigint>, affinePublicKey: AffinePoint<bigint>) {
    const messagePoint = p256.Point.fromAffine(affineMessagePoint);
    const publicKey = p256.Point.fromAffine(affinePublicKey);
    const ephemeralKey = EccKey.randomScalar();

    const point1 = p256.Point.BASE.multiply(ephemeralKey);
    const sharedSecret = publicKey.multiply(ephemeralKey);
    const point2 = messagePoint.add(sharedSecret);

    return {
      point1: point1.toAffine(),
      point2: point2.toAffine(),
    };
  }

  static decrypt(
    { point1, point2 }: { point1: AffinePoint<bigint>; point2: AffinePoint<bigint> },
    privateKey: bigint,
  ) {
    const projectivePoint1 = p256.Point.fromAffine(point1);
    const projectivePoint2 = p256.Point.fromAffine(point2);

    const sharedSecret = projectivePoint1.multiply(privateKey);
    return projectivePoint2.subtract(sharedSecret).toAffine();
  }
}
