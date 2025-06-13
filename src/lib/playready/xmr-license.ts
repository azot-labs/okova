import { BinaryReader, compareArrays } from '../utils';
import { aesCmac } from '../crypto/cmac';

export class _SignatureObject {
  signature_type: number;
  signature_data_length: number;
  signature_data: Uint8Array;

  constructor(reader: BinaryReader) {
    this.signature_type = reader.readUint16();
    this.signature_data_length = reader.readUint16();
    this.signature_data = reader.readBytes(this.signature_data_length);
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
  auxiliary_keys: _AuxiliaryKey[];

  constructor(reader: BinaryReader) {
    this.count = reader.readUint16();
    this.auxiliary_keys = [];
    for (let i = 0; i < this.count; i++) {
      this.auxiliary_keys.push(new _AuxiliaryKey(reader));
    }
  }
}

export class _ContentKeyObject {
  key_id: Uint8Array;
  key_type: number;
  cipher_type: number;
  key_length: number;
  encrypted_key: Uint8Array;

  constructor(reader: BinaryReader) {
    this.key_id = reader.readBytes(16);
    this.key_type = reader.readUint16();
    this.cipher_type = reader.readUint16();
    this.key_length = reader.readUint16();
    this.encrypted_key = reader.readBytes(this.key_length);
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
  xmr_version: number;
  rights_id: Uint8Array;
  containers: _XmrObject[];

  constructor(reader: BinaryReader) {
    this.signature = reader.readBytes(4);
    this.xmr_version = reader.readUint32();
    this.rights_id = reader.readBytes(16);
    this.containers = [];
    while (reader.length > reader.offset) {
      this.containers.push(new _XmrObject(reader));
    }
  }
}

export class XmrLicense {
  _reader: BinaryReader;
  _license_obj: _XmrLicense;

  constructor(reader: BinaryReader, license_obj: _XmrLicense) {
    this._reader = reader;
    this._license_obj = license_obj;
  }

  static loads(bytes: Uint8Array) {
    const reader = new BinaryReader(bytes);
    return new XmrLicense(reader, new _XmrLicense(reader));
  }

  getObjects(type: number) {
    return this._license_obj.containers.filter((obj) => obj.type === type);
  }

  async checkSignature(integrity_key: Uint8Array) {
    const signatureObject = this.getObjects(11)[0].data;
    const raw_data = this._reader._raw_bytes;

    if (!(signatureObject instanceof _SignatureObject)) return false;

    const signatureData = raw_data.subarray(
      0,
      raw_data.length - (signatureObject.signature_data_length + 12),
    );
    const signature = await aesCmac(integrity_key, signatureData);

    return compareArrays(signature, signatureObject.signature_data);
  }
}
