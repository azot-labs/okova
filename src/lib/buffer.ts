export const concatUint8Arrays = (...arrays: Uint8Array[]) => {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

const bufferReplaceAll = (
  buffer: Uint8Array,
  original: string,
  replacement: string,
) => {
  const textEncoder = new TextEncoder();
  const originalArray = textEncoder.encode(original);
  const replacementArray = textEncoder.encode(replacement);

  const indexOf = (
    haystack: Uint8Array,
    needle: Uint8Array,
    startIndex: number,
  ) => {
    for (let i = startIndex; i <= haystack.length - needle.length; i++) {
      let found = true;
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
    return -1;
  };

  const write = (
    target: Uint8Array,
    source: Uint8Array,
    targetStart: number,
  ) => {
    for (let i = 0; i < source.length; i++) {
      target[targetStart + i] = source[i];
    }
  };

  let idx = 0;
  do {
    idx = indexOf(buffer, originalArray, idx);
    if (idx > -1) {
      write(buffer, replacementArray, idx);
      idx += replacementArray.length;
    }
  } while (idx !== -1);
};

const bitShiftLeftBuffer = (buffer: Uint8Array) => {
  const shifted = new Uint8Array(buffer.length);
  const last = buffer.length - 1;
  for (let index = 0; index < last; index++) {
    shifted[index] = buffer[index] << 1;
    if (buffer[index + 1] & 0x80) {
      shifted[index] |= 0x01;
    }
  }
  shifted[last] = buffer[last] << 1;
  return shifted;
};

const xorBuffer = (bufferA: Uint8Array, bufferB: Uint8Array) => {
  const length = Math.min(bufferA.length, bufferB.length);
  const output = new Uint8Array(length);
  for (let index = 0; index < length; index++) {
    output[index] = bufferA[index] ^ bufferB[index];
  }
  return output;
};

const bufferToArrayBuffer = (buffer: Uint8Array) => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
};

export { bufferReplaceAll, bitShiftLeftBuffer, xorBuffer, bufferToArrayBuffer };

export const tryGetUtf16Le = (bytes: Uint8Array) => {
  if (bytes.length % 2 !== 0) {
    return null;
  }

  for (let i = 1; i < bytes.length; i += 2) {
    if (bytes[i] !== 0) {
      return null;
    }
  }

  try {
    const decoder = new TextDecoder('utf-16le', { fatal: true });
    return decoder.decode(bytes);
  } catch (e) {
    return null;
  }
};
