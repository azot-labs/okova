import { DOMParser } from '@xmldom/xmldom';
import { tryGetUtf16Le } from '../buffer';

/** Detect raw headers by XML structure, not by the byte values of their text. */
export const tryReadWrmHeader = (bytes: Uint8Array) => {
  const xml = tryGetUtf16Le(bytes);
  if (!xml?.trim().startsWith('<')) return null;
  try {
    const document = new DOMParser({
      onError: (_level, message) => {
        throw new Error(message);
      },
    }).parseFromString(xml, 'application/xml');
    return document.documentElement?.localName === 'WRMHEADER' ? xml : null;
  } catch {
    return null;
  }
};

/** Read a complete PRO, enforcing both total and individual record lengths. */
export const readPlayreadyObject = (bytes: Uint8Array) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 6 || view.getUint32(0, true) !== bytes.length) {
    throw new Error('Invalid PlayReady Object length');
  }
  const count = view.getUint16(4, true);
  const headers: string[] = [];
  let cursor = 6;
  for (let index = 0; index < count; index++) {
    if (cursor + 4 > bytes.length) throw new Error('Truncated PlayReady record');
    const type = view.getUint16(cursor, true);
    const length = view.getUint16(cursor + 2, true);
    cursor += 4;
    if (cursor + length > bytes.length) throw new Error('Truncated PlayReady record');
    if (type === 1) {
      const header = tryReadWrmHeader(bytes.subarray(cursor, cursor + length));
      if (header === null) throw new Error('Invalid UTF-16LE WRMHEADER record');
      headers.push(header);
    }
    cursor += length;
  }
  if (cursor !== bytes.length || !headers.length) {
    throw new Error('Invalid PlayReady Object records');
  }
  return headers;
};
