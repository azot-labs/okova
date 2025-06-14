import { EccKey } from '../crypto/ecc-key';
import { BinaryReader } from '../utils';

export class PlayReadyClient {
  groupKey?: Uint8Array;
  encryptionKey: Uint8Array;
  signingKey: Uint8Array;

  groupCertificate: Uint8Array;

  constructor(data: {
    groupKey?: Uint8Array;
    encryptionKey: Uint8Array;
    signingKey: Uint8Array;
    groupCertificate: Uint8Array;
  }) {
    this.groupKey = data.groupKey;
    this.encryptionKey = data.encryptionKey;
    this.signingKey = data.signingKey;
    this.groupCertificate = data.groupCertificate;
  }

  static async from(
    payload:
      | { prd: Uint8Array }
      | {
          groupKey: Uint8Array;
          encryptionKey?: Uint8Array;
          signingKey?: Uint8Array;
          groupCertificate: Uint8Array;
        },
  ) {
    if ('prd' in payload) {
      const reader = new BinaryReader(payload.prd);
      const magic = reader.readBytes(3);
      const version = reader.readUint8();
      switch (version) {
        case 2: {
          const groupCertificateLen = reader.readUint32();
          const groupCertificate = reader.readBytes(groupCertificateLen);
          const encryptionKey = reader.readBytes(96);
          const signingKey = reader.readBytes(96);
          return new PlayReadyClient({
            groupCertificate,
            encryptionKey,
            signingKey,
          });
        }
        case 3: {
          const groupKey = reader.readBytes(96);
          const encryptionKey = reader.readBytes(96);
          const signingKey = reader.readBytes(96);
          const groupCertificateLen = reader.readUint32();
          const groupCertificate = reader.readBytes(groupCertificateLen);
          return new PlayReadyClient({
            groupKey,
            encryptionKey,
            signingKey,
            groupCertificate,
          });
        }
        default:
          throw new Error('Unsupported version');
      }
    } else {
      const groupKey = EccKey.from(payload.groupKey);
      const encryptionKey = payload.encryptionKey
        ? EccKey.from(payload.encryptionKey)
        : EccKey.generate();
      const signingKey = payload.signingKey
        ? EccKey.from(payload.signingKey)
        : EccKey.generate();
      return new PlayReadyClient({
        groupKey: groupKey.dumps(),
        encryptionKey: encryptionKey.dumps(),
        signingKey: signingKey.dumps(),
        groupCertificate: payload.groupCertificate,
      });
    }
  }

  async pack() {
    // return this._reader._raw_bytes;
  }
}
