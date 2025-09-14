import { fromBase64, fromBuffer } from '../utils';
import { WidevinePsshData } from './proto';

const WV_SYSTEM_ID = new Uint8Array([
  237, 239, 139, 169, 121, 214, 74, 206, 163, 200, 39, 220, 213, 29, 33, 237,
]);

function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

const prepare = (data: Uint8Array | string): string => {
  const dataBuffer =
    typeof data === 'string' ? fromBase64(data).toBuffer() : data;
  const dataFragment = dataBuffer.subarray(12, 28);
  const isWidevineSystemIdDetected = areUint8ArraysEqual(
    dataFragment,
    WV_SYSTEM_ID,
  );

  if (isWidevineSystemIdDetected) {
    const parsed =
      typeof data === 'string' ? data : fromBuffer(data).toBase64();
    return parsed;
  }

  const header = new Uint8Array([0, 0, 0, 32 + dataBuffer.length]);
  const pssh = new TextEncoder().encode('pssh');
  const version = new Uint8Array([0, 0, 0, 0]);
  const dataLength = new Uint8Array([0, 0, 0, dataBuffer.length]);

  const newData = concatUint8Arrays(
    header,
    pssh,
    version,
    WV_SYSTEM_ID,
    dataLength,
    dataBuffer,
  );

  return fromBuffer(newData).toBase64();
};

const parse = (initData: Uint8Array | string) => {
  try {
    let buffer =
      typeof initData === 'string' ? fromBase64(initData).toBuffer() : initData;

    // Find Widevine PSSH by searching for its system ID
    let offset = 0;
    while (offset < buffer.length) {
      const size =
        (buffer[offset] << 24) |
        (buffer[offset + 1] << 16) |
        (buffer[offset + 2] << 8) |
        buffer[offset + 3];
      const systemId = buffer.subarray(offset + 12, offset + 28);

      if (areUint8ArraysEqual(systemId, WV_SYSTEM_ID)) {
        const dataSize =
          (buffer[offset + 28] << 24) |
          (buffer[offset + 29] << 16) |
          (buffer[offset + 30] << 8) |
          buffer[offset + 31];
        const psshData = buffer.subarray(offset + 32, offset + 32 + dataSize);
        return WidevinePsshData.decode(psshData);
      }

      offset += size + 4;
    }
    throw new Error('Widevine PSSH not found');
  } catch (e) {
    console.log(e);
    throw new Error('Unable to parse, unsupported init data format');
  }
};

const createPssh = (initData: Uint8Array | string) => {
  const preparedInitData = prepare(initData);
  const parsedInitData = parse(preparedInitData);
  return {
    data: parsedInitData,
    toBuffer: () => WidevinePsshData.encode(parsedInitData).finish(),
  };
};

export type PSSH = ReturnType<typeof createPssh>;

export { createPssh };
