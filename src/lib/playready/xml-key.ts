import * as utils from '@noble/curves/utils';
import { EccKey } from '../crypto/ecc-key.js';

export class XmlKey {
  #sharedPoint: EccKey;

  sharedXKey: bigint;
  sharedYKey: bigint;
  aesIv: Uint8Array;
  aesKey: Uint8Array;

  constructor() {
    this.#sharedPoint = EccKey.generate();
    this.sharedXKey = this.#sharedPoint.publicKey.x;
    this.sharedYKey = this.#sharedPoint.publicKey.y;

    const sharedKeyXBytes = utils.numberToBytesBE(this.sharedXKey, 32);
    this.aesIv = sharedKeyXBytes.subarray(0, 16);
    this.aesKey = sharedKeyXBytes.subarray(16, 32);
  }

  get point() {
    return this.#sharedPoint.publicKey;
  }
}
