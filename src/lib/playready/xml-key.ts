import * as utils from '@noble/curves/utils';
import { EccKey } from '../crypto/ecc-key.js';

export class XmlKey {
  _shared_point: EccKey;

  shared_x_key: bigint;
  shared_y_key: bigint;
  aes_iv: Uint8Array;
  aes_key: Uint8Array;

  constructor() {
    this._shared_point = EccKey.generate();
    this.shared_x_key = this._shared_point.publicKey.x;
    this.shared_y_key = this._shared_point.publicKey.y;

    const shared_key_x_bytes = utils.numberToBytesBE(this.shared_x_key, 32);
    this.aes_iv = shared_key_x_bytes.subarray(0, 16);
    this.aes_key = shared_key_x_bytes.subarray(16, 32);
  }

  get_point() {
    return this._shared_point.publicKey;
  }
}
