import { tryGetUtf16Le } from '../buffer';
import { BinaryReader, compareArrays, fromBase64 } from '../utils';
import { InvalidPssh } from './exceptions';

class PlayreadyObject {
  type: number;
  length: number;
  wrmHeader: string | null;

  constructor(reader: BinaryReader) {
    this.type = reader.readUint16(true);
    this.length = reader.readUint16(true);
    const data = reader.readBytes(this.length);
    this.wrmHeader = this.type === 1 ? tryGetUtf16Le(data) : null;
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
    0x9a, 0x04, 0xf0, 0x79, 0x98, 0x40, 0x42, 0x86, 0xab, 0x92, 0xe6, 0x5b, 0xe0, 0x88, 0x5f, 0x95,
  ]);
  #PSSH_TYPE = 'pssh';

  wrmHeaders: string[];

  constructor(data: Uint8Array | string) {
    const bytes = typeof data === 'string' ? fromBase64(data).toBuffer() : data;
    if (!bytes.length) {
      throw new InvalidPssh('Data must not be empty');
    }

    this.wrmHeaders = this.#readWrmHeaders(bytes).filter(Boolean) as string[];
    if (!this.wrmHeaders.length) {
      throw new InvalidPssh('Could not parse data as a PSSH Box nor a PlayReady Object');
    }
  }

  #readWrmHeaders(bytes: Uint8Array) {
    const string = tryGetUtf16Le(bytes);
    if (string !== null) {
      return [string];
    }

    const psshPayload = this.#extractPlayreadyPsshPayload(bytes);
    if (psshPayload) {
      const wrmHeader = tryGetUtf16Le(psshPayload);
      if (wrmHeader) {
        return [wrmHeader];
      }

      const reader = new BinaryReader(psshPayload);
      return new PlayreadyHeader(reader).records.map((record) => record.wrmHeader);
    }

    try {
      const reader = new BinaryReader(bytes);
      const isPlayreadyHeader = reader.readUint16(true) > 3;
      reader.reset();

      if (isPlayreadyHeader) {
        return new PlayreadyHeader(reader).records.map((record) => record.wrmHeader);
      }

      return [new PlayreadyObject(reader).wrmHeader];
    } catch {
      throw new InvalidPssh('Could not parse data as a PSSH Box nor a PlayReady Object');
    }
  }

  #extractPlayreadyPsshPayload(bytes: Uint8Array) {
    if (bytes.length < 8) return null;

    let offset = 0;
    let sawPsshBox = false;

    while (offset + 8 <= bytes.length) {
      const reader = new BinaryReader(bytes.subarray(offset));
      const boxLength = reader.readUint32();
      const boxType = new TextDecoder().decode(reader.readBytes(4));

      if (boxType !== this.#PSSH_TYPE) {
        return sawPsshBox ? null : null;
      }
      if (boxLength < 32 || offset + boxLength > bytes.length) {
        throw new InvalidPssh('The Playready PSSH is invalid or empty.');
      }

      sawPsshBox = true;
      const version = reader.readUint8();
      reader.readBytes(3);
      const systemId = reader.readBytes(16);

      if (version === 1) {
        const keyIdCount = reader.readUint32();
        reader.readBytes(keyIdCount * 16);
      } else if (version !== 0) {
        throw new InvalidPssh(`Unsupported PSSH version ${version}`);
      }

      const dataLength = reader.readUint32();
      const data = reader.readBytes(dataLength);

      if (compareArrays(systemId, this.PLAYREADY_SYSTEM_ID)) {
        return data;
      }

      offset += boxLength;
    }

    if (sawPsshBox) {
      throw new InvalidPssh('The Playready PSSH is invalid or empty.');
    }

    return null;
  }
}
