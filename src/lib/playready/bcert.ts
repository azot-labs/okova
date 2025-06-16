import { Schema, b } from '../construct';
import { ecc256Sign, ecc256Verify } from '../crypto/common';
import { EccKey } from '../crypto/ecc-key';
import { fromHex } from '../utils';
import { InvalidCertificate, InvalidCertificateChain } from './exceptions';

export const BCertCertType = {
  UNKNOWN: 0x00000000,
  PC: 0x00000001,
  DEVICE: 0x00000002,
  DOMAIN: 0x00000003,
  ISSUER: 0x00000004,
  CRL_SIGNER: 0x00000005,
  SERVICE: 0x00000006,
  SILVERLIGHT: 0x00000007,
  APPLICATION: 0x00000008,
  METERING: 0x00000009,
  KEYFILESIGNER: 0x0000000a,
  SERVER: 0x0000000b,
  LICENSESIGNER: 0x0000000c,
  SECURETIMESERVER: 0x0000000d,
  RPROVMODELAUTH: 0x0000000e,
} as const;

export type TBCertCertType = (typeof BCertCertType)[keyof typeof BCertCertType];

export const BCertObjType = {
  BASIC: 0x0001,
  DOMAIN: 0x0002,
  PC: 0x0003,
  DEVICE: 0x0004,
  FEATURE: 0x0005,
  KEY: 0x0006,
  MANUFACTURER: 0x0007,
  SIGNATURE: 0x0008,
  SILVERLIGHT: 0x0009,
  METERING: 0x000a,
  EXTDATASIGNKEY: 0x000b,
  EXTDATACONTAINER: 0x000c,
  EXTDATASIGNATURE: 0x000d,
  EXTDATA_HWID: 0x000e,
  SERVER: 0x000f,
  SECURITY_VERSION: 0x0010,
  SECURITY_VERSION_2: 0x0011,
  UNKNOWN_OBJECT_ID: 0xfffd,
} as const;

export type TBCertObjType = (typeof BCertObjType)[keyof typeof BCertObjType];

export const BCertFlag = {
  EMPTY: 0x00000000,
  EXTDATA_PRESENT: 0x00000001,
} as const;

export const BCertObjFlag = {
  EMPTY: 0x0000,
  MUST_UNDERSTAND: 0x0001,
  CONTAINER_OBJ: 0x0002,
} as const;

export const BCertSignatureType = { P256: 0x0001 } as const;
export const BCertKeyType = { ECC256: 0x0001 } as const;

export const BCertKeyUsage = {
  SIGN: 0x00000001,
  ENCRYPT_KEY: 0x00000002,
  ISSUER_DEVICE: 0x00000006,
} as const;

export const BCertFeatures = {
  SECURE_CLOCK: 0x00000004,
  SUPPORTS_CRLS: 0x00000009,
  SUPPORTS_PR3_FEATURES: 0x0000000d,
} as const;

const BasicInfo = b.object({
  cert_id: b.bytes(16),
  security_level: b.uint32(),
  flags: b.uint32(),
  cert_type: b.uint32(),
  public_key_digest: b.bytes(32),
  expiration_date: b.uint32(),
  client_id: b.bytes(16),
});

const DomainInfo = b.object({
  service_id: b.bytes(16),
  account_id: b.bytes(16),
  revision_timestamp: b.uint32(),
  domain_url_length: b.uint32(),
  domain_url: b.bytes((ctx) => (ctx.domain_url_length + 3) & 0xfffffffc),
});

const PCInfo = b.object({
  security_version: b.uint32(),
});

const DeviceInfo = b.object({
  max_license: b.uint32(),
  max_header: b.uint32(),
  max_chain_depth: b.uint32(),
});

const FeatureInfo = b.object({
  feature_count: b.uint32(),
  features: b.array(b.uint32(), (ctx) => ctx.feature_count),
});

const CertKey = b.object({
  type: b.uint16(),
  length: b.uint16(),
  flags: b.uint32(),
  key: b.bytes((ctx) => ctx.length / 8),
  usages_count: b.uint32(),
  usages: b.array(b.uint32(), (ctx) => ctx.usages_count),
});

const KeyInfo = b.object({
  key_count: b.uint32(),
  cert_keys: b.array(CertKey, (ctx) => ctx.key_count),
});

const ManufacturerInfo = b.object({
  flags: b.uint32(),
  manufacturer_name_length: b.uint32(),
  manufacturer_name: b.bytes(
    (ctx) => (ctx.manufacturer_name_length + 3) & 0xfffffffc,
  ),
  model_name_length: b.uint32(),
  model_name: b.bytes((ctx) => (ctx.model_name_length + 3) & 0xfffffffc),
  model_number_length: b.uint32(),
  model_number: b.bytes((ctx) => (ctx.model_number_length + 3) & 0xfffffffc),
});

const SignatureInfo = b.object({
  signature_type: b.uint16(),
  signature_size: b.uint16(),
  signature: b.bytes((ctx) => ctx.signature_size),
  signature_key_size: b.uint32(),
  signature_key: b.bytes((ctx) => ctx.signature_key_size / 8),
});

const SilverlightInfo = b.object({
  security_version: b.uint32(),
  platform_identifier: b.uint32(),
});

const MeteringInfo = b.object({
  metering_id: b.bytes(16),
  metering_url_length: b.uint32(),
  metering_url: b.bytes((ctx) => (ctx.metering_url_length + 3) & 0xfffffffc),
});

const ExtDataSignKeyInfo = b.object({
  key_type: b.uint16(),
  key_length: b.uint16(),
  flags: b.uint32(),
  key: b.bytes((ctx) => ctx.key_length / 8),
});

const DataRecord = b.object({
  data_size: b.uint32(),
  data: b.bytes((ctx) => ctx.data_size),
});

const ExtDataSignature = b.object({
  signature_type: b.uint16(),
  signature_size: b.uint16(),
  signature: b.bytes((ctx) => ctx.signature_size),
});

const ExtDataContainer = b.object({
  record_count: b.uint32(),
  records: b.array(DataRecord, (ctx) => ctx.record_count),
  signature: ExtDataSignature,
});

const ServerInfo = b.object({
  warning_days: b.uint32(),
});

const SecurityVersion = b.object({
  security_version: b.uint32(),
  platform_identifier: b.uint32(),
});

export const Attribute = b.sized(
  b.object({
    flags: b.uint16(),
    tag: b.uint16(),
    length: b.uint32(),
    attribute: b.prefixed(
      (ctx) => ctx.length - 8,
      b.switch(
        (ctx) => ctx.tag,
        {
          [BCertObjType.BASIC]: BasicInfo,
          [BCertObjType.DOMAIN]: DomainInfo,
          [BCertObjType.PC]: PCInfo,
          [BCertObjType.DEVICE]: DeviceInfo,
          [BCertObjType.FEATURE]: FeatureInfo,
          [BCertObjType.KEY]: KeyInfo,
          [BCertObjType.MANUFACTURER]: ManufacturerInfo,
          [BCertObjType.SIGNATURE]: SignatureInfo,
          [BCertObjType.SILVERLIGHT]: SilverlightInfo,
          [BCertObjType.METERING]: MeteringInfo,
          [BCertObjType.EXTDATASIGNKEY]: ExtDataSignKeyInfo,
          [BCertObjType.EXTDATACONTAINER]: ExtDataContainer,
          [BCertObjType.EXTDATASIGNATURE]: ExtDataSignature,
          [BCertObjType.EXTDATA_HWID]: b.bytes((ctx) => ctx.length - 8),
          [BCertObjType.SERVER]: ServerInfo,
          [BCertObjType.SECURITY_VERSION]: SecurityVersion,
          [BCertObjType.SECURITY_VERSION_2]: SecurityVersion,
        },
        b.bytes((ctx) => ctx.length - 8),
      ),
    ),
  }),
  (item) => item.length,
);

export const BCertBody = b.object({
  signature: b.literal('CERT'),
  version: b.uint32(),
  total_length: b.uint32(),
  certificate_length: b.uint32(),
  attributes: b.greedyRange(Attribute),
});

export const BCert = b.sized(BCertBody, (ctx) => ctx.total_length);

type BCertType = ReturnType<typeof BCert.parse>;

export const BCertChain = b.object({
  signature: b.literal('CHAI'),
  version: b.uint32(),
  total_length: b.uint32(),
  flags: b.uint32(),
  certificate_count: b.uint32(),
  // The header is 20 bytes (4*5). The certificates fill the rest of the 'total_length'.
  certificates: b.prefixed(
    (ctx) => ctx.total_length - 20,
    b.greedyRange(BCert),
  ),
});

type BCertChainType = ReturnType<typeof BCertChain.parse>;

export class Certificate {
  parsed: BCertType;
  _BCERT: Schema<BCertType>;

  constructor(parsedBCert: BCertType, bcertObj: Schema<BCertType> = BCert) {
    this.parsed = parsedBCert;
    this._BCERT = bcertObj;
  }

  static async newLeafCert(params: {
    certId: Uint8Array;
    securityLevel: number;
    clientId: Uint8Array;
    signingKey: EccKey;
    encryptionKey: EccKey;
    groupKey: EccKey;
    parent: CertificateChain;
    expiry?: number;
  }) {
    const basicInfo = {
      cert_id: params.certId,
      security_level: params.securityLevel,
      flags: BCertFlag.EMPTY,
      cert_type: BCertCertType.DEVICE,
      public_key_digest: await params.signingKey.publicSha256Digest(),
      expiration_date: params.expiry ?? 0xffffffff,
      client_id: params.clientId,
    };

    const basicInfoAttribute = {
      flags: BCertObjFlag.MUST_UNDERSTAND,
      tag: BCertObjType.BASIC,
      length: BasicInfo.build(basicInfo).length + 8,
      attribute: basicInfo,
    };

    const deviceInfo = {
      max_license: 10240,
      max_header: 15360,
      max_chain_depth: 2,
    };

    const deviceInfoAttribute = {
      flags: BCertObjFlag.MUST_UNDERSTAND,
      tag: BCertObjType.DEVICE,
      length: DeviceInfo.build(deviceInfo).length + 8,
      attribute: deviceInfo,
    };

    const feature = {
      feature_count: 3,
      features: [
        BCertFeatures.SECURE_CLOCK,
        BCertFeatures.SUPPORTS_CRLS,
        BCertFeatures.SUPPORTS_PR3_FEATURES,
      ],
    };

    const featureAttribute = {
      flags: BCertObjFlag.MUST_UNDERSTAND,
      tag: BCertObjType.FEATURE,
      length: FeatureInfo.build(feature).length + 8,
      attribute: feature,
    };

    const signingKeyPublicBytes = params.signingKey.publicb.bytes();

    const certKeySign = {
      type: BCertKeyType.ECC256,
      length: signingKeyPublicBytes.length * 8,
      flags: BCertFlag.EMPTY,
      key: signingKeyPublicBytes,
      usages_count: 1,
      usages: [BCertKeyUsage.SIGN],
    };

    const encryptionKeyPublicBytes = params.encryptionKey.publicb.bytes();

    const certKeyEncrypt = {
      type: BCertKeyType.ECC256,
      length: encryptionKeyPublicBytes.length * 8,
      flags: BCertFlag.EMPTY,
      key: encryptionKeyPublicBytes,
      usages_count: 1,
      usages: [BCertKeyUsage.ENCRYPT_KEY],
    };

    const keyInfo = {
      key_count: 2,
      cert_keys: [certKeySign, certKeyEncrypt],
    };

    const keyInfoAttribute = {
      flags: BCertObjFlag.MUST_UNDERSTAND,
      tag: BCertObjType.KEY,
      length: KeyInfo.build(keyInfo).length + 8,
      attribute: keyInfo,
    };

    const manufacturerInfo = params.parent
      .get(0)
      .getAttribute(BCertObjType.MANUFACTURER);
    if (!manufacturerInfo) throw new Error('Manufacturer info not found');

    const newBCertContainer = {
      signature: Buffer.from('CERT'),
      version: 1,
      // total_length: 0, // filled at a later time
      // certificate_length: 0, // filled at a later time
      attributes: [
        basicInfoAttribute,
        deviceInfoAttribute,
        featureAttribute,
        keyInfoAttribute,
        manufacturerInfo,
      ],
    };

    const payload = BCertBody.build(newBCertContainer); // !valid
    const payloadLength = payload.length;

    newBCertContainer.certificate_length = payloadLength;
    newBCertContainer.total_length = payloadLength + 144; // signature length

    const signPayload = BCert.build(newBCertContainer).subarray(
      0,
      payloadLength,
    );

    const signature = await ecc256Sign(params.groupKey.privateKey, signPayload);

    const groupKeyPublicBytes = params.groupKey.publicb.bytes();

    const signatureInfo = {
      signature_type: BCertSignatureType.P256,
      signature_size: signature.toCompactRawb.bytes().length,
      signature: signature.toCompactRawb.bytes(),
      signature_key_size: groupKeyPublicBytes.length * 8,
      signature_key: groupKeyPublicBytes,
    };

    const signatureInfoAttribute = {
      flags: BCertObjFlag.MUST_UNDERSTAND,
      tag: BCertObjType.SIGNATURE,
      length: SignatureInfo.build(signatureInfo).length + 8,
      attribute: signatureInfo,
    };

    newBCertContainer.attributes.push(signatureInfoAttribute);

    return new Certificate(newBCertContainer);
  }

  static loads(data: Uint8Array) {
    const parsed = BCert.parse(data);
    const cert = BCert;
    return new Certificate(parsed, cert);
  }

  getAttribute(type: TBCertObjType) {
    return this.parsed.attributes.find((attr) => attr.tag === type);
  }

  getSecurityLevel() {
    const basicInfo = this.getAttribute(BCertObjType.BASIC);
    if (basicInfo && 'security_level' in basicInfo.attribute)
      return basicInfo.attribute.security_level;
  }

  private static _unpad(name: Uint8Array) {
    return Buffer.from(name)
      .toString('utf-8')
      .replace(/\x00+$/, '');
  }

  getName(): string | undefined {
    const info = this.getAttribute(BCertObjType.MANUFACTURER)?.attribute;
    if (!info || !('manufacturer_name' in info)) return;
    return info
      ? `${Certificate._unpad(info.manufacturer_name)} ${Certificate._unpad(info.model_name)} ${Certificate._unpad(info.model_number)}`.trim()
      : undefined;
  }

  getIssuerKey(): Uint8Array | undefined {
    const keyInfo = this.getAttribute(BCertObjType.KEY)?.attribute;
    if (!keyInfo || !('cert_keys' in keyInfo)) return;
    return keyInfo?.cert_keys.find((key) =>
      key.usages.includes(BCertKeyUsage.ISSUER_DEVICE),
    )?.key;
  }

  dumps = (): Uint8Array => BCert.build(this.parsed);

  async verify(
    publicKey: Uint8Array,
    index: number,
  ): Promise<Uint8Array | undefined> {
    const signatureObject = this.getAttribute(BCertObjType.SIGNATURE);

    if (!signatureObject || !('signature_key' in signatureObject.attribute))
      throw new InvalidCertificate(
        `No signature object in certificate ${index}`,
      );

    const signatureAttribute = signatureObject.attribute;
    if (Buffer.compare(publicKey, signatureAttribute.signature_key) !== 0)
      throw new InvalidCertificate(
        `Signature keys of certificate ${index} do not match`,
      );

    const fullCertData = this.dumps();
    const signPayload = fullCertData.slice(
      0,
      fullCertData.length - signatureObject.length,
    );

    const uncompressedPublicKey = new Uint8Array(65);
    uncompressedPublicKey[0] = 0x04; // Uncompressed key prefix
    uncompressedPublicKey.set(signatureAttribute.signature_key, 1);

    const isValid = await ecc256Verify(
      uncompressedPublicKey,
      signPayload,
      signatureAttribute.signature,
    );

    if (!isValid) {
      throw new InvalidCertificate(
        `Signature of certificate ${index} is not authentic`,
      );
    }

    const issuerKey = this.getIssuerKey();

    return issuerKey;
  }
}

export class CertificateChain {
  ECC256MSBCertRootIssuerPubKey = fromHex(
    '864d61cff2256e422c568b3c28001cfb3e1527658584ba0521b79b1828d936de1d826a8fc3e6e7fa7a90d5ca2946f1f64a2efb9f5dcffe7e434eb44293fac5ab',
  ).toBuffer();

  parsed: BCertChainType;
  _BCERT_CHAIN: Schema<BCertChainType>;

  constructor(
    parsedBCertChain: BCertChainType,
    bcertChainObj: Schema<BCertChainType> = BCertChain,
  ) {
    this.parsed = parsedBCertChain;
    this._BCERT_CHAIN = bcertChainObj;
  }

  static from(data: Uint8Array) {
    const certChain = BCertChain;
    const parsed = BCertChain.parse(data, false);
    return new CertificateChain(parsed, certChain);
  }

  dumps() {
    return this._BCERT_CHAIN.build(this.parsed);
  }

  getSecurityLevel() {
    return this.get(0).getSecurityLevel() as number;
  }

  getName() {
    return this.get(0).getName() as string;
  }

  async verify() {
    let issuerKey = this.ECC256MSBCertRootIssuerPubKey;

    try {
      for (let i = this.count() - 1; i >= 0; i--) {
        const certificate = this.get(i);
        issuerKey = await certificate.verify(issuerKey, i);

        if (!issuerKey && i !== 0) {
          throw new InvalidCertificate(`Certificate ${i} is not valid`);
        }
      }
    } catch (e) {
      if (e instanceof InvalidCertificate) {
        throw new InvalidCertificateChain(e.message);
      }
      throw e;
    }

    return true;
  }

  append(bcert: Certificate) {
    this.parsed.certificate_count++;
    this.parsed.certificates.push(bcert.parsed);
    this.parsed.total_length += bcert.dumps().length;
  }

  prepend(bcert: Certificate) {
    this.parsed.certificate_count++;
    this.parsed.certificates.unshift(bcert.parsed);
    this.parsed.total_length += bcert.dumps().length;
  }

  remove(index: number) {
    if (this.count() <= 0) {
      throw new InvalidCertificateChain(
        `CertificateChain does not contain any Certificates`,
      );
    }
    if (index >= this.count()) {
      throw new RangeError(
        `No Certificate at index ${index}, ${this.count()} total`,
      );
    }
    this.parsed.total_length -= this.get(index).dumps().length;
    this.parsed.certificates.splice(index, 1);
    this.parsed.certificate_count--;
  }

  get(index: number) {
    if (this.count() <= 0) {
      throw new InvalidCertificateChain(
        'CertificateChain does not contain any Certificates',
      );
    }
    if (index >= this.count()) {
      throw new RangeError(
        `No Certificate at index ${index}, ${this.count()} total`,
      );
    }
    return new Certificate(this.parsed.certificates[index]);
  }

  count() {
    return this.parsed.certificate_count;
  }
}
