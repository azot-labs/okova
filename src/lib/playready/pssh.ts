import { isPsshBoxSequence, parsePsshBoxes, PSSH_SYSTEM_IDS } from '../pssh';
import { fromBase64 } from '../utils';
import { InvalidPssh } from './exceptions';
import { readPlayreadyObject, tryReadWrmHeader } from './object';

export class Pssh {
  PLAYREADY_SYSTEM_ID = new Uint8Array([
    0x9a, 0x04, 0xf0, 0x79, 0x98, 0x40, 0x42, 0x86, 0xab, 0x92, 0xe6, 0x5b, 0xe0, 0x88, 0x5f, 0x95,
  ]);

  wrmHeaders: string[];

  constructor(data: Uint8Array | string) {
    const bytes = typeof data === 'string' ? fromBase64(data).toBuffer() : data;
    if (!bytes.length) throw new InvalidPssh('Data must not be empty');
    try {
      if (isPsshBoxSequence(bytes)) {
        const box = parsePsshBoxes(bytes).find((box) => box.systemId === PSSH_SYSTEM_IDS.playready);
        if (!box) throw new Error('No PlayReady PSSH box found');
        this.wrmHeaders = this.#readHeaders(box.data);
      } else {
        this.wrmHeaders = this.#readHeaders(bytes);
      }
    } catch (error) {
      throw new InvalidPssh(error instanceof Error ? error.message : 'Invalid PlayReady PSSH');
    }
  }

  #readHeaders(bytes: Uint8Array) {
    const header = tryReadWrmHeader(bytes);
    if (header !== null) return [header];

    // Preserve support for a standalone type-1 record as well as a complete PRO.
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (bytes.length >= 4 && view.getUint16(0, true) === 1) {
      if (view.getUint16(2, true) !== bytes.length - 4) {
        throw new Error('Invalid PlayReady record length');
      }
      const record = tryReadWrmHeader(bytes.subarray(4));
      if (record === null) throw new Error('Invalid UTF-16LE WRMHEADER record');
      return [record];
    }
    return readPlayreadyObject(bytes);
  }
}
