import {
  encryptWithAesCbc,
  encryptWithRsaOaep,
  exportKey,
  generateAesCbcKey,
  getRandomBytes,
  toPKCS1,
  toPKCS8,
} from '../crypto/common';
import {
  ClientIdentification,
  DrmCertificate,
  EncryptedClientIdentification,
  FileHashes,
  SignedDrmCertificate,
} from './proto';
import { buildWvd, parseWvd, WVD_DEVICE_TYPES } from './wvd';
import { importCertificateKey } from './certificate';
import { Session, SessionType } from './session';
import { fromBase64, fromBuffer, fromText } from '../utils';

export const CLIENT_TYPE = { android: 'android', chrome: 'chrome' } as const;

export type ClientType = (typeof CLIENT_TYPE)[keyof typeof CLIENT_TYPE];
export type SecurityLevel = 1 | 2 | 3;

const types = new Map<number, ClientType>([
  [WVD_DEVICE_TYPES.android, CLIENT_TYPE.android],
  [WVD_DEVICE_TYPES.chrome, CLIENT_TYPE.chrome],
]);

export class WidevineClient {
  id: ClientIdentification;
  type: ClientType;
  securityLevel: SecurityLevel;
  signedDrmCertificate: SignedDrmCertificate;
  drmCertificate: DrmCertificate;
  systemId: number;
  vmp: FileHashes | null;
  info: Map<string, string>;

  #key?: { forDecrypt: CryptoKey; forSign: CryptoKey };

  static async from(
    payload: { wvd: Uint8Array } | { id: Uint8Array; key: Uint8Array },
  ) {
    if ('wvd' in payload) {
      return await WidevineClient.fromPacked(payload.wvd);
    } else {
      return await WidevineClient.fromUnpacked(payload.id, payload.key);
    }
  }

  static async fromPacked(data: Uint8Array, format: 'wvd' = 'wvd') {
    const isWvd = fromBuffer(data.slice(0, 3)).toText() == 'WVD';
    if (format === 'wvd' || isWvd) {
      const parsed = parseWvd(data);
      const pcks1 = `-----BEGIN RSA PRIVATE KEY-----\n${fromBuffer(parsed.privateKey).toBase64()}\n-----END RSA PRIVATE KEY-----`;
      const key = fromText(pcks1).toBuffer();
      const type = types.get(parsed.deviceType);
      const securityLevel = parsed.securityLevel as SecurityLevel;
      const client = new WidevineClient(parsed.clientId, type, securityLevel);
      await client.importKey(key);
      return client;
    } else {
      throw new Error('Unsupported format');
    }
  }

  static async fromUnpacked(id: Uint8Array, key: Uint8Array, vmp?: Uint8Array) {
    const client = new WidevineClient(id);
    if (vmp) {
      client.vmp = FileHashes.decode(vmp);
      client.id.vmpData = vmp;
    }
    await client.importKey(key);
    return client;
  }

  get key() {
    if (!this.#key) throw new Error('Import key before using it');
    return this.#key;
  }

  constructor(
    id: Uint8Array | ClientIdentification,
    type: ClientType = CLIENT_TYPE.android,
    securityLevel: SecurityLevel = 3,
  ) {
    this.id = ArrayBuffer.isView(id) ? ClientIdentification.decode(id) : id;
    this.signedDrmCertificate = SignedDrmCertificate.decode(this.id.token);
    this.drmCertificate = DrmCertificate.decode(
      this.signedDrmCertificate.drmCertificate,
    );
    this.systemId = this.drmCertificate.systemId;
    this.vmp = this.id.vmpData ? FileHashes.decode(this.id.vmpData) : null;
    this.type = type;
    this.securityLevel = securityLevel;
    const clientInfo = this.id.clientInfo;
    this.info = new Map(clientInfo.map((item) => [item.name!, item.value!]));
  }

  getName() {
    return `${this.info.get('company_name')}_${this.info.get('model_name')}`;
  }

  async unpack() {
    const id = ClientIdentification.encode(this.id).finish();
    const key = await this.exportKey();
    return {
      device_client_id_blob: id,
      device_private_key: key,
    };
  }

  async pack(format: 'wvd' = 'wvd') {
    if (format === 'wvd') {
      const id = ClientIdentification.encode(this.id).finish();
      const key = await this.exportKey();
      const keyDer = fromBuffer(key)
        .toText()
        .split('\n')
        .map((s) => s.trim())
        .slice(1, -1)
        .join('\n');
      const keyDerBinary = fromBase64(keyDer).toBuffer();
      const [type] = types.entries().find(([, type]) => type === this.type)!;
      const wvd = buildWvd({
        clientId: id,
        deviceType: type,
        securityLevel: this.securityLevel,
        privateKey: keyDerBinary,
      });
      return wvd;
    } else {
      throw new Error('Unsupported format');
    }
  }

  async importKey(pkcs1: Uint8Array | string) {
    const pkcs1pem =
      typeof pkcs1 === 'string' ? pkcs1 : fromBuffer(pkcs1).toText();
    const pkcs8pem = toPKCS8(pkcs1pem);
    const pemContents = pkcs8pem.split('\n').slice(1, -2).join('\n');
    const data = fromBase64(pemContents).toBuffer();
    const keyForDecrypt = await crypto.subtle.importKey(
      'pkcs8',
      data,
      { name: 'RSA-OAEP', hash: 'SHA-1' },
      true,
      ['decrypt'],
    );
    const keyForSign = await crypto.subtle.importKey(
      'pkcs8',
      data,
      { name: 'RSA-PSS', hash: 'SHA-1' },
      true,
      ['sign'],
    );
    this.#key = { forDecrypt: keyForDecrypt, forSign: keyForSign };
    return this.#key;
  }

  async exportKey() {
    const key = this.key.forSign;
    const der = await crypto.subtle.exportKey('pkcs8', key);
    const derAsBinary = new Uint8Array(der);
    const derAsBase64 = fromBuffer(derAsBinary).toBase64();
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pem = `${pemHeader}\n${derAsBase64}\n-----${pemFooter}-----`;
    const pkcs1 = toPKCS1(pem).trim();
    return fromText(pkcs1).toBuffer();
  }

  async decryptWithKey(data: Uint8Array) {
    const result = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      this.key.forDecrypt,
      data,
    );
    return new Uint8Array(result);
  }

  async signWithKey(data: Uint8Array) {
    const result = await crypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: 20 },
      this.key.forSign,
      data,
    );
    return new Uint8Array(result);
  }

  async encryptId(certificate: SignedDrmCertificate) {
    if (!certificate.drmCertificate)
      throw Error('Service certificate not found');
    const serviceCertificate = DrmCertificate.decode(
      certificate.drmCertificate,
    );
    const id = ClientIdentification.encode(this.id).finish();
    const privacyKey = await generateAesCbcKey();
    const encryptedClientIdIv = getRandomBytes(16);
    const encryptedClientId = await encryptWithAesCbc(
      id,
      privacyKey,
      encryptedClientIdIv,
    );
    const publicKey = await importCertificateKey(
      serviceCertificate.publicKey,
      'encrypt',
    );
    const privacyKeyData = await exportKey(privacyKey);
    const encryptedPrivacyKey = await encryptWithRsaOaep(
      privacyKeyData,
      publicKey,
    );
    return EncryptedClientIdentification.create({
      providerId: serviceCertificate.providerId,
      serviceCertificateSerialNumber: serviceCertificate.serialNumber,
      encryptedClientIdIv,
      encryptedPrivacyKey,
      encryptedClientId,
    });
  }

  toString() {
    return `${this.systemId} L${this.securityLevel}`;
  }

  /**
   * https://www.w3.org/TR/encrypted-media-2/#navigator-extension-requestmediakeysystemaccess
   */
  requestMediaKeySystemAccess(
    keySystem: string,
    supportedConfigurations: MediaKeySystemConfiguration[],
  ) {
    if (keySystem !== 'com.widevine.alpha')
      throw new Error('Unsupported media key system');
    return {
      keySystem,
      createMediaKeys: async () => {
        const state = { serverCertificate: null as BufferSource | null };
        return {
          createSession: (sessionType?: SessionType) => {
            return new Session(sessionType, this) as MediaKeySession;
          },
          setServerCertificate: async (
            serverCertificate: BufferSource,
          ): Promise<boolean> => {
            state.serverCertificate = serverCertificate;
            return true;
          },
          getStatusForPolicy: async (): Promise<MediaKeyStatus> => 'usable',
        };
      },
      getConfiguration: () => supportedConfigurations[0],
    };
  }
}
