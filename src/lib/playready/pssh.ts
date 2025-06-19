import { tryGetUtf16Le } from '../buffer';
import { BinaryReader, compareArrays, fromBase64 } from '../utils';

class PlayreadyObject {
  type: number;
  length: number;
  wrmHeader: string | null;

  constructor(reader: BinaryReader) {
    this.type = reader.readUint16(true);
    this.length = reader.readUint16(true);
    this.wrmHeader = null;
    if (this.type === 1) {
      this.wrmHeader = tryGetUtf16Le(reader.readBytes(this.length));
    }
  }
}

class PlayreadyHeader {
  length: number;
  recordCount: number;
  records: PlayreadyObject[];

  constructor(reader: BinaryReader) {
    this.length = reader.readUint32(true);
    this.recordCount = reader.readUint16(true);

    this.records = [];
    for (let i = 0; i < this.recordCount; i++) {
      this.records.push(new PlayreadyObject(reader));
    }
  }
}

export class Pssh {
  PLAYREADY_SYSTEM_ID = new Uint8Array([
    0x9a, 0x04, 0xf0, 0x79, 0x98, 0x40, 0x42, 0x86, 0xab, 0x92, 0xe6, 0x5b,
    0xe0, 0x88, 0x5f, 0x95,
  ]);

  wrmHeaders: string[];

  constructor(data: Uint8Array | string) {
    const bytes = typeof data === 'string' ? fromBase64(data).toBuffer() : data;
    this.wrmHeaders = this.#readWrmHeaders(bytes).filter(Boolean) as string[];
  }

  #readWrmHeaders(bytes: Uint8Array) {
    const string = tryGetUtf16Le(bytes);
    if (string !== null) {
      console.log(1);
      return [string];
    }

    if (this.#isPsshBox(bytes)) {
      const boxData = bytes.subarray(32);
      const wrmHeader = tryGetUtf16Le(boxData);
      if (wrmHeader) {
        return [wrmHeader];
      } else {
        const reader = new BinaryReader(boxData);
        return new PlayreadyHeader(reader).records.map(
          (record) => record.wrmHeader,
        );
      }
    } else {
      const reader = new BinaryReader(bytes);
      const isPlayreadyHeader = reader.readUint16(true) > 3;
      reader.reset();

      if (isPlayreadyHeader) {
        return new PlayreadyHeader(reader).records.map(
          (record) => record.wrmHeader,
        );
      } else {
        return [new PlayreadyObject(reader).wrmHeader];
      }
    }
  }

  #isPsshBox(bytes: Uint8Array) {
    return (
      bytes[0] === 0 &&
      bytes[1] === 0 &&
      bytes.length >= 32 &&
      compareArrays(bytes.subarray(12, 28), this.PLAYREADY_SYSTEM_ID)
    );
  }
}
