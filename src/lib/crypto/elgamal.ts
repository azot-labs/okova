import { p256 } from '@noble/curves/nist';
import type { AffinePoint } from '@noble/curves/abstract/curve';
import { EccKey } from './ecc-key';

export class ElGamal {
  static encrypt(
    affineMessagePoint: AffinePoint<bigint>,
    affinePublicKey: AffinePoint<bigint>,
  ) {
    const messagePoint = new p256.Point(
      affineMessagePoint.x,
      affineMessagePoint.y,
      1n,
    );
    const publicKey = new p256.Point(affinePublicKey.x, affinePublicKey.y, 1n);
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
    {
      point1,
      point2,
    }: { point1: AffinePoint<bigint>; point2: AffinePoint<bigint> },
    privateKey: bigint,
  ) {
    const projectivePoint1 = new p256.Point(point1.x, point1.y, 1n);
    const projectivePoint2 = new p256.Point(point2.x, point2.y, 1n);

    const sharedSecret = projectivePoint1.multiply(privateKey);
    return projectivePoint2.subtract(sharedSecret).toAffine();
  }
}
