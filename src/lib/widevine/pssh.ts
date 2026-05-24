import { fromBase64 } from '../utils';
import { WidevinePsshData } from './proto';

const WV_SYSTEM_ID = new Uint8Array([
  237, 239, 139, 169, 121, 214, 74, 206, 163, 200, 39, 220, 213, 29, 33, 237,
]);

const areUint8ArraysEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const readUint32BE = (data: Uint8Array, offset: number) =>
  (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];

const decodeExactlyWidevinePsshData = (data: Uint8Array) => {
  try {
    const parsed = WidevinePsshData.decode(data);
    const encoded = WidevinePsshData.encode(parsed).finish();
    return areUint8ArraysEqual(encoded, data) ? parsed : null;
  } catch {
    return null;
  }
};

const findWidevineInitData = (data: Uint8Array) => {
  for (let offset = 0; offset + 32 <= data.length; ) {
    const size = readUint32BE(data, offset);
    if (size < 32 || offset + size > data.length) break;

    const type = data.subarray(offset + 4, offset + 8);
    if (!areUint8ArraysEqual(type, new TextEncoder().encode('pssh'))) {
      offset += size;
      continue;
    }

    const version = data[offset + 8];
    let cursor = offset + 12;
    const systemId = data.subarray(cursor, cursor + 16);
    cursor += 16;

    if (version === 1) {
      const keyIdCount = readUint32BE(data, cursor);
      cursor += 4 + keyIdCount * 16;
      if (cursor + 4 > offset + size) break;
    }

    const initDataSize = readUint32BE(data, cursor);
    cursor += 4;
    if (cursor + initDataSize > offset + size) break;

    if (areUint8ArraysEqual(systemId, WV_SYSTEM_ID)) {
      return data.subarray(cursor, cursor + initDataSize);
    }

    offset += size;
  }

  return null;
};

const normalizeInput = (data: Uint8Array | string) =>
  typeof data === 'string' ? fromBase64(data).toBuffer() : data;

const createPssh = (initData: Uint8Array | string) => {
  const input = normalizeInput(initData);
  const payload = findWidevineInitData(input) ?? input;
  const parsed = decodeExactlyWidevinePsshData(payload);

  return {
    data: parsed ?? WidevinePsshData.create({}),
    toBuffer: () => (parsed ? WidevinePsshData.encode(parsed).finish() : payload),
  };
};

export type PSSH = ReturnType<typeof createPssh>;

export { createPssh };
