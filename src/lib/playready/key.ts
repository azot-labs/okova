export class Key {
  key_id: Uint8Array;
  key_type: number;
  cipher_type: number;
  key: Uint8Array;

  constructor(
    key_id: Uint8Array,
    key_type: number,
    cipher_type: number,
    key: Uint8Array,
  ) {
    this.key_id = this._swapEndianess(key_id);
    this.key_type = key_type;
    this.cipher_type = cipher_type;
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
