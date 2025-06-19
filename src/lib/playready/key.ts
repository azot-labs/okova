export class Key {
  keyId: Uint8Array;
  keyType: number;
  cipherType: number;
  key: Uint8Array;

  constructor(
    keyId: Uint8Array,
    keyType: number,
    cipherType: number,
    key: Uint8Array,
  ) {
    this.keyId = this._swapEndianess(keyId);
    this.keyType = keyType;
    this.cipherType = cipherType;
    this.key = key;
  }

  _swapEndianess(uuidBytes: Uint8Array) {
    return new Uint8Array([
      uuidBytes[3],
      uuidBytes[2],
      uuidBytes[1],
      uuidBytes[0],
      uuidBytes[5],
      uuidBytes[4],
      uuidBytes[7],
      uuidBytes[6],
      uuidBytes[8],
      uuidBytes[9],
      ...uuidBytes.slice(10, 16),
    ]);
  }
}
