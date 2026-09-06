import { Reader } from 'protobufjs/minimal';

export type ProtobufCodec<T extends object> = {
  decode(buffer: Uint8Array | Reader): T;
  encode: unknown;
};

export const areBytesEqual = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export const tryDecodeExactly = <T extends object>(
  data: Uint8Array,
  codec: ProtobufCodec<T>,
): T | null => {
  try {
    const reader = Reader.create(data);
    // Exact round trips must retain fields this version of the schema does not know.
    reader.discardUnknown = false;
    const decoded = codec.decode(reader);
    const encode = codec.encode as (message: T) => { finish(): Uint8Array };
    const encoded = encode(decoded).finish();
    return areBytesEqual(encoded, data) ? decoded : null;
  } catch {
    return null;
  }
};

export const decodeExactly = <T extends object>(
  data: Uint8Array,
  codec: ProtobufCodec<T>,
  label: string,
) => {
  const decoded = tryDecodeExactly(data, codec);
  if (!decoded) {
    throw new Error(`Invalid ${label}: protobuf did not parse exactly`);
  }
  return decoded;
};
