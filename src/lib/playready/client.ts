import { equalBytes } from '@noble/curves/utils';
import { EccKey } from '../crypto/ecc-key';
import { getRandomBytes } from '../utils';
import { Certificate, CertificateChain } from './bcert';
import { InvalidCertificateChain } from './exceptions';
import { PRD_MAGIC, PRD3 } from './prd';

export class PlayReadyClient {
  groupKey?: EccKey;
  encryptionKey: EccKey;
  signingKey: EccKey;

  groupCertificate: CertificateChain;

  securityLevel: number;

  constructor(data: {
    groupKey?: Uint8Array;
    encryptionKey: Uint8Array;
    signingKey: Uint8Array;
    groupCertificate: Uint8Array;
  }) {
    this.groupKey = EccKey.from(data.groupKey!);
    this.encryptionKey = EccKey.from(data.encryptionKey);
    this.signingKey = EccKey.from(data.signingKey);
    this.groupCertificate = CertificateChain.from(data.groupCertificate);
    this.securityLevel = this.groupCertificate.getSecurityLevel();
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
      const parsed = PRD3.parse(payload.prd);
      const groupKey = parsed.group_key;
      const encryptionKey = parsed.encryption_key;
      const signingKey = parsed.signing_key;
      const groupCertificate = parsed.group_certificate;
      return new PlayReadyClient({
        groupKey,
        encryptionKey,
        signingKey,
        groupCertificate,
      });
    } else {
      const groupKey = EccKey.from(payload.groupKey);
      const encryptionKey = payload.encryptionKey
        ? EccKey.from(payload.encryptionKey)
        : EccKey.generate();
      const signingKey = payload.signingKey
        ? EccKey.from(payload.signingKey)
        : EccKey.generate();
      const certificateChain = CertificateChain.from(payload.groupCertificate);
      const issuerKey = certificateChain.get(0).getIssuerKey();
      const groupKeyBytes = groupKey.publicBytes();
      if (issuerKey && !equalBytes(issuerKey, groupKeyBytes)) {
        throw new InvalidCertificateChain(
          'Group key does not match this certificate',
        );
      }
      const newCertificate = await Certificate.newLeafCert({
        certId: getRandomBytes(16),
        securityLevel: certificateChain.getSecurityLevel(),
        clientId: getRandomBytes(16),
        signingKey: signingKey,
        encryptionKey: encryptionKey,
        groupKey: groupKey,
        parent: certificateChain,
      });
      certificateChain.prepend(newCertificate);
      await certificateChain.verify();
      return new PlayReadyClient({
        groupKey: groupKey.dumps(),
        encryptionKey: encryptionKey.dumps(),
        signingKey: signingKey.dumps(),
        groupCertificate: certificateChain.dumps(),
      });
    }
  }

  getName() {
    const name = `${this.groupCertificate.getName()}_sl${this.securityLevel}`;
    return name
      .split('')
      .filter((char) => char.match(/[a-z0-9_-]/))
      .join('')
      .trim()
      .toLowerCase()
      .replaceAll(' ', '_');
  }

  pack() {
    return PRD3.build({
      signature: PRD_MAGIC,
      version: 3,
      group_key: this.groupKey!.dumps(),
      encryption_key: this.encryptionKey.dumps(),
      signing_key: this.signingKey.dumps(),
      group_certificate_length: this.groupCertificate.dumps().length,
      group_certificate: this.groupCertificate.dumps(),
    });
  }

  unpack() {
    this.groupCertificate.remove(0);
    return {
      'zgpriv.dat': this.groupKey!.dumps(true),
      'bgroupcert.dat': this.groupCertificate.dumps(),
    };
  }
}
