import { DOMParser } from '@xmldom/xmldom';
import * as utils from '@noble/curves/utils';
import {
  base64ToBytes,
  bytesToBase64,
  fromBase64,
  fromBuffer,
  fromHex,
  fromText,
  stringToBytes,
  xorArrays,
} from '../utils';
import {
  aesEcbEncrypt,
  createSha256,
  ecc256decrypt,
  ecc256Sign,
  encryptWithAesCbc,
  getRandomBytes,
  importAesCbcKeyForEncrypt,
} from '../crypto/common';
import {
  _AuxiliaryKeysObject,
  _ContentKeyObject,
  XmrLicense,
} from './xmr-license';
import { EccKey } from '../crypto/ecc-key';
import { ElGamal } from '../crypto/elgamal';
import { XmlKey } from './xml-key';
import { Key } from './key';
import { PlayReadyClient } from './client';
import { Pssh } from './pssh';

const DEFAULT_CLIENT_VERSION = '10.0.16384.10011';

type CdmClient =
  | PlayReadyClient
  | {
      certificateChain: Uint8Array;
      encryptionKey: Uint8Array;
      signingKey: Uint8Array;
      clientVersion?: string;
    };

export class Session extends EventTarget {
  sessionId: string;
  expiration: number;
  closed: Promise<MediaKeySessionClosedReason>;
  keyStatuses: Map<BufferSource, MediaKeyStatus>;

  onmessage: ((this: MediaKeySession, ev: MediaKeyMessageEvent) => any) | null;
  onkeyschange: ((this: MediaKeySession, ev: Event) => any) | null;
  onkeystatuseschange: ((this: MediaKeySession, ev: Event) => any) | null;

  sessionType: MediaKeySessionType;
  client: CdmClient;
  keys: Key[];
  initData?: Uint8Array;
  initDataType?: string;
  certificateChain: Uint8Array;
  encryptionKey: EccKey;
  signingKey: EccKey;
  clientVersion: string;
  rgbMagicConstantZero: Uint8Array;
  wmrmServerKey: { x: bigint; y: bigint };

  parser: DOMParser;

  static Client = PlayReadyClient;

  constructor(
    sessionType: MediaKeySessionType = 'temporary',
    client: CdmClient,
  ) {
    super();
    this.sessionId = fromBuffer(getRandomBytes()).toBase64();
    this.keyStatuses = new Map();
    this.expiration = NaN;
    this.closed = new Promise<MediaKeySessionClosedReason>((resolve) => {
      this.addEventListener('closed', () => resolve('closed-by-application'));
    });
    this.onmessage = null;
    this.onkeyschange = null;
    this.onkeystatuseschange = null;
    this.sessionType = sessionType;
    this.client = client;
    if (client instanceof PlayReadyClient) {
      this.certificateChain = client.groupCertificate.dumps();
      this.encryptionKey = client.encryptionKey;
      this.signingKey = client.signingKey;
      this.clientVersion = DEFAULT_CLIENT_VERSION;
    } else {
      this.certificateChain = client.certificateChain;
      this.encryptionKey = EccKey.from(client.encryptionKey);
      this.signingKey = EccKey.from(client.signingKey);
      this.clientVersion = client.clientVersion ?? DEFAULT_CLIENT_VERSION;
    }

    this.rgbMagicConstantZero = new Uint8Array([
      0x7e, 0xe9, 0xed, 0x4a, 0xf7, 0x73, 0x22, 0x4f, 0x00, 0xb8, 0xea, 0x7e,
      0xfb, 0x02, 0x7c, 0xbb,
    ]);
    this.wmrmServerKey = {
      x: 90785344306297710604867503975059265028223978614363440949957868233137570135451n,
      y: 68827801477692731286297993103001909218341737652466656881935707825713852622178n,
    };

    this.parser = new DOMParser();
    this.keys = [];
  }

  #getKeyCipher(xmlKey: XmlKey) {
    const encrypted = ElGamal.encrypt(xmlKey.point, this.wmrmServerKey);
    return new Uint8Array([
      ...utils.numberToBytesBE(encrypted.point1.x, 32),
      ...utils.numberToBytesBE(encrypted.point1.y, 32),
      ...utils.numberToBytesBE(encrypted.point2.x, 32),
      ...utils.numberToBytesBE(encrypted.point2.y, 32),
    ]);
  }

  async #getDataCipher(xmlKey: XmlKey) {
    const b64CertificateChain = bytesToBase64(this.certificateChain);
    const body = `<Data><CertificateChains><CertificateChain>${b64CertificateChain}</CertificateChain></CertificateChains><Features><Feature Name="AESCBC">""</Feature><REE><AESCBCS></AESCBCS></REE></Features></Data>`;

    const key = await importAesCbcKeyForEncrypt(xmlKey.aesKey as BufferSource);
    const cipherText = await encryptWithAesCbc(
      stringToBytes(body),
      key,
      xmlKey.aesIv as BufferSource,
    );

    return new Uint8Array([...xmlKey.aesIv, ...cipherText]);
  }

  #buildDigestInfo(digestValue: string | number) {
    return (
      `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">` +
      `<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></CanonicalizationMethod>` +
      `<SignatureMethod Algorithm="http://schemas.microsoft.com/DRM/2007/03/protocols#ecdsa-sha256"></SignatureMethod>` +
      `<Reference URI="#SignedData">` +
      `<DigestMethod Algorithm="http://schemas.microsoft.com/DRM/2007/03/protocols#sha256"></DigestMethod>` +
      `<DigestValue>${digestValue}</DigestValue>` +
      `</Reference>` +
      `</SignedInfo>`
    );
  }

  #buildDigestContent(
    contentHeader: string,
    nonce: string,
    keyCipher: string,
    dataCipher: string,
    protocolVersion: string | number,
    revLists?: string,
  ) {
    const clientTime = Math.floor(Date.now() / 1000);

    return (
      `<LA xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols" Id="SignedData" xml:space="preserve">` +
      `<Version>${protocolVersion}</Version>` +
      `<ContentHeader>${contentHeader}</ContentHeader>` +
      `<CLIENTINFO>` +
      `<CLIENTVERSION>${this.clientVersion}</CLIENTVERSION>` +
      `</CLIENTINFO>` +
      revLists +
      `<LicenseNonce>${nonce}</LicenseNonce>` +
      `<ClientTime>${clientTime}</ClientTime>` +
      `<EncryptedData xmlns="http://www.w3.org/2001/04/xmlenc#" Type="http://www.w3.org/2001/04/xmlenc#Element">` +
      `<EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"></EncryptionMethod>` +
      `<KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">` +
      `<EncryptedKey xmlns="http://www.w3.org/2001/04/xmlenc#">` +
      `<EncryptionMethod Algorithm="http://schemas.microsoft.com/DRM/2007/03/protocols#ecc256"></EncryptionMethod>` +
      `<KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">` +
      `<KeyName>WMRMServer</KeyName>` +
      `</KeyInfo>` +
      `<CipherData>` +
      `<CipherValue>${keyCipher}</CipherValue>` +
      `</CipherData>` +
      `</EncryptedKey>` +
      `</KeyInfo>` +
      `<CipherData>` +
      `<CipherValue>${dataCipher}</CipherValue>` +
      `</CipherData>` +
      `</EncryptedData>` +
      `</LA>`
    );
  }

  #buildMainBody(
    laContent: string | number,
    signedInfo: string | number,
    signatureValue: string | number,
    publicKey: string | number,
  ) {
    return (
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
      '<soap:Body>' +
      '<AcquireLicense xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols">' +
      '<challenge>' +
      '<Challenge xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/messages">' +
      laContent +
      '<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">' +
      signedInfo +
      `<SignatureValue>${signatureValue}</SignatureValue>` +
      '<KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">' +
      '<KeyValue>' +
      '<ECCKeyValue>' +
      `<PublicKey>${publicKey}</PublicKey>` +
      '</ECCKeyValue>' +
      '</KeyValue>' +
      '</KeyInfo>' +
      '</Signature>' +
      '</Challenge>' +
      '</challenge>' +
      '</AcquireLicense>' +
      '</soap:Body>' +
      '</soap:Envelope>'
    );
  }

  async generateRequest(
    sessionId: string,
    initData: Uint8Array,
    initDataType?: string,
  ) {
    this.initData = initData;
    this.initDataType = initDataType;
    const pssh = new Pssh(initData);
    const wrmHeader = pssh.wrmHeaders[0];
    const challenge = await this.getLicenseChallenge(wrmHeader);
    return fromText(challenge).toBuffer();
  }

  async update(response: Uint8Array) {
    const keys = await this.parseLicense(fromBuffer(response).toText());
    if (keys) this.keys = keys;
  }

  async getLicenseChallenge(wrm_header: string, rev_lists?: string) {
    const xml_key = new XmlKey();

    const wrmHeaderDoc = this.parser.parseFromString(
      wrm_header,
      'application/xml',
    ).documentElement;
    const wrmHeaderVersion = wrmHeaderDoc?.getAttribute('version');

    let protocol_version = 1;

    switch (wrmHeaderVersion) {
      case '4.3.0.0':
        protocol_version = 5;
        break;
      case '4.2.0.0':
        protocol_version = 4;
        break;
    }

    const laContent = this.#buildDigestContent(
      wrm_header,
      bytesToBase64(getRandomBytes(16)),
      bytesToBase64(this.#getKeyCipher(xml_key)),
      bytesToBase64(await this.#getDataCipher(xml_key)),
      protocol_version,
      rev_lists,
    );

    const contentHash = await createSha256(fromText(laContent).toBuffer());

    const signedInfo = this.#buildDigestInfo(bytesToBase64(contentHash));

    const signature = await ecc256Sign(
      this.signingKey.privateKey,
      fromText(signedInfo).toBuffer(),
    );

    const rawSignature = new Uint8Array([
      ...utils.numberToBytesBE(signature.r, 32),
      ...utils.numberToBytesBE(signature.s, 32),
    ]);

    const singing_key = this.signingKey.publicBytes();

    return this.#buildMainBody(
      laContent,
      signedInfo,
      bytesToBase64(rawSignature),
      bytesToBase64(singing_key),
    );
  }

  async parseLicense(rawLicense: string) {
    const xmlDoc = this.parser.parseFromString(rawLicense, 'application/xml');
    const licenseElements = xmlDoc.getElementsByTagName('License');

    const keys: Key[] = [];

    for (const licenseElement of Array.from(licenseElements)) {
      const license = XmrLicense.loads(
        base64ToBytes(licenseElement.textContent ?? ''),
      );

      const isScalable = license.getObjects(81).length > 0;

      for (const obj of license.getObjects(10)) {
        const contentKeyObject = obj.data as _ContentKeyObject;

        if (![3, 4, 6].includes(contentKeyObject.cipherType)) {
          return;
        }

        const viaSymmetric = contentKeyObject.cipherType === 6;

        const encryptedKey = contentKeyObject.encryptedKey;
        const decrypted = ecc256decrypt(
          this.encryptionKey.privateKey,
          encryptedKey,
        );

        let ci = decrypted.subarray(0, 16);
        let ck = decrypted.subarray(16, 32);

        if (isScalable) {
          ci = decrypted.filter((_, index) => index % 2 === 0).slice(0, 16);
          ck = decrypted.filter((_, index) => index % 2 === 1).slice(0, 16);

          if (viaSymmetric) {
            const embeddedRootLicense = encryptedKey.subarray(0, 144);
            let embeddedLeafLicense = encryptedKey.subarray(144);

            const rgbKey = xorArrays(ck, this.rgbMagicConstantZero);
            const contentKeyPrime = await aesEcbEncrypt(ck, rgbKey);

            const auxKey = (
              license.getObjects(81)[0].data as _AuxiliaryKeysObject
            ).auxiliaryKeys[0].key;

            const uplinkXKey = await aesEcbEncrypt(contentKeyPrime, auxKey);
            const secondaryKey = await aesEcbEncrypt(
              ck,
              embeddedRootLicense.subarray(128),
            );

            embeddedLeafLicense = await aesEcbEncrypt(
              uplinkXKey,
              embeddedLeafLicense,
            );
            embeddedLeafLicense = await aesEcbEncrypt(
              secondaryKey,
              embeddedLeafLicense,
            );

            ci = embeddedLeafLicense.subarray(0, 16);
            ck = embeddedLeafLicense.subarray(16, 32);
          }
        }

        if (!license.checkSignature(ci)) {
          throw new Error('License integrity signature does not match');
        }

        keys.push(
          new Key(
            contentKeyObject.keyId,
            contentKeyObject.keyType,
            contentKeyObject.cipherType,
            ck,
          ),
        );
      }
    }
    this.keys = keys;
    return keys;
  }

  pause() {
    const values = {
      sessionId: this.sessionId,
      sessionType: this.sessionType,
      initData: this.initData
        ? fromBuffer(this.initData).toBase64()
        : undefined,
      initDataType: this.initDataType,
      certificateChain: fromBuffer(this.certificateChain).toBase64(),
      encryptionKey: fromBuffer(this.encryptionKey.publicBytes()).toBase64(),
      signingKey: fromBuffer(this.signingKey.publicBytes()).toBase64(),
      clientVersion: this.clientVersion,
      rgbMagicConstantZero: fromBuffer(this.rgbMagicConstantZero).toBase64(),
      wmrmServerKey: {
        x: this.wmrmServerKey.x.toString(),
        y: this.wmrmServerKey.y.toString(),
      },
      keys: this.keys.map((key) => ({
        keyId: fromBuffer(key.keyId).toHex(),
        key: fromBuffer(key.key).toHex(),
        cipherType: key.cipherType,
        keyType: key.keyType,
      })),
    };
    const state = JSON.stringify(values);
    return state;
  }

  resume(state: string) {
    return Session.resume(state, this.client);
  }

  static resume(data: string, client: CdmClient) {
    const values = JSON.parse(data);
    const session = new Session(values.sessionType, client);
    session.sessionId = values.sessionId;
    session.initData = values.initData
      ? fromBase64(values.initData).toBuffer()
      : undefined;
    session.initDataType = values.initDataType;
    session.certificateChain = fromBase64(values.certificateChain).toBuffer();
    session.encryptionKey = EccKey.from(
      fromBase64(values.encryptionKey).toBuffer(),
    );
    session.signingKey = EccKey.from(fromBase64(values.signingKey).toBuffer());
    session.rgbMagicConstantZero = fromBase64(
      values.rgbMagicConstantZero,
    ).toBuffer();
    session.wmrmServerKey = {
      x: BigInt(values.wmrmServerKey.x),
      y: BigInt(values.wmrmServerKey.y),
    };
    session.clientVersion = values.clientVersion;
    session.keys = values.keys.map(
      (key: {
        keyId: string;
        key: string;
        keyType: number;
        cipherType: number;
      }) =>
        new Key(
          fromHex(key.keyId).toBuffer(),
          key.keyType,
          key.cipherType,
          fromHex(key.key).toBuffer(),
        ),
    );
    return session;
  }
}
