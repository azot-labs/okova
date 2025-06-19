import { BinaryReader, compareArrays } from '../utils';
import { aesCmac } from '../crypto/cmac';

export class _SignatureObject {
  signatureType: number;
  signatureDataLength: number;
  signatureData: Uint8Array;

  constructor(reader: BinaryReader) {
    this.signatureType = reader.readUint16();
    this.signatureDataLength = reader.readUint16();
    this.signatureData = reader.readBytes(this.signatureDataLength);
  }
}

export class _AuxiliaryKey {
  location: number;
  key: Uint8Array;

  constructor(reader: BinaryReader) {
    this.location = reader.readUint32();
    this.key = reader.readBytes(16);
  }
}

export class _AuxiliaryKeysObject {
  count: number;
  auxiliaryKeys: _AuxiliaryKey[];

  constructor(reader: BinaryReader) {
    this.count = reader.readUint16();
    this.auxiliaryKeys = [];
    for (let i = 0; i < this.count; i++) {
      this.auxiliaryKeys.push(new _AuxiliaryKey(reader));
    }
  }
}

export class _ContentKeyObject {
  keyId: Uint8Array;
  keyType: number;
  cipherType: number;
  keyLength: number;
  encryptedKey: Uint8Array;

  constructor(reader: BinaryReader) {
    this.keyId = reader.readBytes(16);
    this.keyType = reader.readUint16();
    this.cipherType = reader.readUint16();
    this.keyLength = reader.readUint16();
    this.encryptedKey = reader.readBytes(this.keyLength);
  }
}

class _XmrObject {
  flags: number;
  type: number;
  length: number;
  data:
    | null
    | _ContentKeyObject
    | _SignatureObject
    | _AuxiliaryKeysObject
    | Uint8Array;

  constructor(reader: BinaryReader) {
    this.flags = reader.readUint16();
    this.type = reader.readUint16();
    this.length = reader.readUint32();
    this.data = null;
    if (this.flags === 0 || this.flags === 1) {
      switch (this.type) {
        case 10:
          this.data = new _ContentKeyObject(reader);
          break;
        case 11:
          this.data = new _SignatureObject(reader);
          break;
        case 81:
          this.data = new _AuxiliaryKeysObject(reader);
          break;
        default:
          this.data = reader.readBytes(this.length - 8);
      }
    }
  }
}

class _XmrLicense {
  signature: Uint8Array;
  xmrVersion: number;
  rightsId: Uint8Array;
  containers: _XmrObject[];

  constructor(reader: BinaryReader) {
    this.signature = reader.readBytes(4);
    this.xmrVersion = reader.readUint32();
    this.rightsId = reader.readBytes(16);
    this.containers = [];
    while (reader.length > reader.offset) {
      this.containers.push(new _XmrObject(reader));
    }
  }
}

export class XmrLicense {
  #reader: BinaryReader;
  #licenseObj: _XmrLicense;

  constructor(reader: BinaryReader, license_obj: _XmrLicense) {
    this.#reader = reader;
    this.#licenseObj = license_obj;
  }

  static loads(bytes: Uint8Array) {
    const reader = new BinaryReader(bytes);
    return new XmrLicense(reader, new _XmrLicense(reader));
  }

  getObjects(type: number) {
    return this.#licenseObj.containers.filter((obj) => obj.type === type);
  }

  async checkSignature(integrity_key: Uint8Array) {
    const signatureObject = this.getObjects(11)[0].data;
    const raw_data = this.#reader.rawBytes;

    if (!(signatureObject instanceof _SignatureObject)) return false;

    const signatureData = raw_data.subarray(
      0,
      raw_data.length - (signatureObject.signatureDataLength + 12),
    );
    const signature = await aesCmac(integrity_key, signatureData);

    return compareArrays(signature, signatureObject.signatureData);
  }
}
