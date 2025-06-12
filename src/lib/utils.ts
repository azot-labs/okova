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
    return new Uint8Array(parseHex(data));
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
