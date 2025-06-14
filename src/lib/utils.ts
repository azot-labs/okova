const encode = (input: Parameters<typeof TextEncoder.prototype.encode>['0']) =>
  new TextEncoder().encode(input);
const decode = (input: Parameters<typeof TextDecoder.prototype.decode>['0']) =>
  new TextDecoder().decode(input);

export const fromText = (data: string) => ({
  toBase64: () => {
    return btoa(
      encode(data).reduce((s, byte) => s + String.fromCharCode(byte), ''),
    );
  },
  toHex: () => {
    return Array.from(encode(data))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  },
  toBuffer: () => encode(data),
});

export const fromBinary = (data: string) => ({
  toBuffer: () => {
    const len = data.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) buffer[i] = data.charCodeAt(i);
    return buffer;
  },
});

const parseBase64 = (data: string) =>
  Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

export const fromBase64 = (data: string) => ({
  toBuffer: () => parseBase64(data),
  toText: () => decode(parseBase64(data)),
  toHex: () => fromBuffer(fromBase64(data).toBuffer()).toHex(),
});

export const fromBuffer = (data: Uint8Array) => ({
  toBase64: () => {
    const binString = Array.from(data, (byte) =>
      String.fromCodePoint(byte),
    ).join('');
    return btoa(binString);
  },
  toHex: () => {
    return Array.from(data)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  },
  toText: () => decode(data),
  toBinary: () => {
    let binary = '';
    const len = data.length;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(data[i]);
    return binary;
  },
});

const parseHex = (hex: string) =>
  hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16));

export const fromHex = (data: string) => ({
  toBase64: () => {
    return btoa(String.fromCharCode(...parseHex(data)));
  },
  toBuffer: () => {
    return new Uint8Array(parseHex(data)) as unknown as Uint8Array;
  },
  toText: () => {
    return decode(new Uint8Array(parseHex(data)));
  },
});

export const parseBufferSource = (data: BufferSource) => {
  if (data instanceof Uint8Array) return data;
  return data instanceof ArrayBuffer
    ? new Uint8Array(data)
    : new Uint8Array(data.buffer);
};

export type Logger = Pick<typeof console, 'debug' | 'error' | 'info' | 'warn'>;

export class BinaryReader {
  offset: number;
  length: number;
  _raw_bytes: Uint8Array;
  _data_view: DataView;

  constructor(data: Uint8Array) {
    this.offset = 0;
    this.length = data.length;
    this._raw_bytes = new Uint8Array(data);
    this._data_view = new DataView(
      data.buffer,
      data.byteOffset,
      data.byteLength,
    );
  }

  readUint8() {
    return this._data_view.getUint8(this.offset++);
  }

  readUint16(little?: boolean) {
    const result = this._data_view.getUint16(this.offset, little);
    this.offset += 2;
    return result;
  }

  readUint32(little?: boolean) {
    const result = this._data_view.getUint32(this.offset, little);
    this.offset += 4;
    return result;
  }

  readBytes(size: number) {
    const result = this._raw_bytes.subarray(this.offset, this.offset + size);
    this.offset += size;
    return result;
  }

  reset() {
    this._data_view = new DataView(this._raw_bytes.buffer);
    this.offset = 0;
  }
}

export const compareArrays = (arr1: Uint8Array, arr2: Uint8Array) => {
  if (arr1.length !== arr2.length) return false;
  return Array.from(arr1).every((value, index) => value === arr2[index]);
};

export const bytesToString = (bytes: Uint8Array) => {
  return String.fromCharCode.apply(null, Array.from(bytes));
};

export const bytesToBase64 = (uint8array: Uint8Array) => {
  return btoa(String.fromCharCode.apply(null, Array.from(uint8array)));
};

export const stringToBytes = (string: string) => {
  return Uint8Array.from(string.split('').map((x) => x.charCodeAt(0)));
};

export const base64ToBytes = (base64_string: string) => {
  return Uint8Array.from(atob(base64_string), (c) => c.charCodeAt(0));
};

export const xorArrays = (arr1: Uint8Array, arr2: Uint8Array) => {
  return new Uint8Array(arr1.map((byte, i) => byte ^ arr2[i]));
};

export const getRandomBytes = (size: number) => {
  const randomBytes = new Uint8Array(size);
  crypto.getRandomValues(randomBytes);
  return randomBytes;
};
