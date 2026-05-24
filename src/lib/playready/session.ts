import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import * as utils from '@noble/curves/utils.js';
import type {
  MediaKeyMessageEventInit,
  MediaKeysEngineSession,
  MediaKeysMap,
  MediaKeyStatusesChangeEventInit,
  WaitForKeysOptions,
} from '../api';
import { waitForKeys } from '../api';
import {
  base64ToBytes,
  bytesToBase64,
  fromBase64,
  fromBuffer,
  fromHex,
  fromText,
  stringToBytes,
  compareArrays,
  xorArrays,
} from '../utils';
import {
  aesEcbEncrypt,
  createSha256,
  ecc256decrypt,
  ecc256Verify,
  ecc256Sign,
  encryptWithAesCbc,
  getRandomBytes,
  importAesCbcKeyForEncrypt,
} from '../crypto/common';
import {
  _AuxiliaryKeysObject,
  _ContentKeyObject,
  _EccDeviceKeyObject,
  XmrLicense,
} from './xmr-license';
import { EccKey } from '../crypto/ecc-key';
import { ElGamal } from '../crypto/elgamal';
import { XmlKey } from './xml-key';
import { Key } from './key';
import { PlayReadyDeviceCredentials } from './device-credentials';
import { BCertKeyUsage, CertificateChain } from './bcert';
import { InvalidLicense } from './exceptions';
import { ServerException } from './exceptions';
import { Pssh } from './pssh';
import { WrmHeader } from './wrmheader';

const DEFAULT_CLIENT_VERSION = '10.0.16384.10011';

const getLocalName = (node: any) => node.localName ?? node.nodeName?.split(':').pop() ?? '';

const findDirectChildByLocalName = (parent: any, localName: string) => {
  for (let index = 0; index < parent.childNodes.length; index++) {
    const child = parent.childNodes[index];
    if (child.nodeType === child.ELEMENT_NODE && getLocalName(child) === localName) {
      return child;
    }
  }
  return null;
};

const findDescendantsByLocalName = (parent: any, localName: string) => {
  const matches: any[] = [];
  const elements = parent.getElementsByTagName('*');

  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    if (getLocalName(element) === localName) {
      matches.push(element);
    }
  }

  return matches;
};

const findFirstDescendantByLocalName = (parent: any, localName: string) => {
  return findDescendantsByLocalName(parent, localName)[0] ?? null;
};

type PlayReadySessionCredentials =
  | PlayReadyDeviceCredentials
  | {
      certificateChain: Uint8Array;
      encryptionKey: Uint8Array;
      signingKey: Uint8Array;
      clientVersion?: string;
    };

type PlayReadySessionOptions = {
  getRevocationListsXml?: () => string;
  mergeRevocationInfo?: (revInfoXml: string) => void;
};

export class PlayReadySession extends EventTarget implements MediaKeysEngineSession {
  sessionId: string;
  expiration: number;
  closed: Promise<MediaKeySessionClosedReason>;
  keyStatuses: Map<string, MediaKeyStatus>;
  keys: MediaKeysMap;

  onmessage:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyMessageEventInit>) => unknown)
    | null;
  onkeyschange: ((this: MediaKeysEngineSession, ev: Event) => unknown) | null;
  onkeystatuseschange:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyStatusesChangeEventInit>) => unknown)
    | null;

  sessionType: MediaKeySessionType;
  deviceCredentials: PlayReadySessionCredentials;
  initData?: Uint8Array;
  initDataType?: string;
  certificateChain: Uint8Array;
  encryptionKey: EccKey;
  signingKey: EccKey;
  clientVersion: string;
  rgbMagicConstantZero: Uint8Array;
  wmrmServerKey: { x: bigint; y: bigint };

  parser: DOMParser;
  serializer: XMLSerializer;

  static DeviceCredentials = PlayReadyDeviceCredentials;

  #contentKeys: Key[];
  #dispose: (sessionId: string) => void;
  #closed: boolean;
  #options: PlayReadySessionOptions;

  constructor(
    sessionType: MediaKeySessionType = 'temporary',
    deviceCredentials: PlayReadySessionCredentials,
    dispose: (sessionId: string) => void = () => {},
    options: PlayReadySessionOptions = {},
  ) {
    super();
    this.sessionId = fromBuffer(getRandomBytes()).toBase64();
    this.keyStatuses = new Map();
    this.keys = new Map();
    this.expiration = NaN;
    this.closed = new Promise<MediaKeySessionClosedReason>((resolve) => {
      this.addEventListener('closed', () => resolve('closed-by-application'));
    });
    this.onmessage = null;
    this.onkeyschange = null;
    this.onkeystatuseschange = null;
    this.sessionType = sessionType;
    this.deviceCredentials = deviceCredentials;
    if (deviceCredentials instanceof PlayReadyDeviceCredentials) {
      this.certificateChain = deviceCredentials.groupCertificate.dumps();
      this.encryptionKey = deviceCredentials.encryptionKey;
      this.signingKey = deviceCredentials.signingKey;
      this.clientVersion = DEFAULT_CLIENT_VERSION;
    } else {
      this.certificateChain = deviceCredentials.certificateChain;
      this.encryptionKey = EccKey.from(deviceCredentials.encryptionKey);
      this.signingKey = EccKey.from(deviceCredentials.signingKey);
      this.clientVersion = deviceCredentials.clientVersion ?? DEFAULT_CLIENT_VERSION;
    }

    this.rgbMagicConstantZero = new Uint8Array([
      0x7e, 0xe9, 0xed, 0x4a, 0xf7, 0x73, 0x22, 0x4f, 0x00, 0xb8, 0xea, 0x7e, 0xfb, 0x02, 0x7c,
      0xbb,
    ]);
    this.wmrmServerKey = {
      x: 90785344306297710604867503975059265028223978614363440949957868233137570135451n,
      y: 68827801477692731286297993103001909218341737652466656881935707825713852622178n,
    };

    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
    this.#contentKeys = [];
    this.#dispose = dispose;
    this.#closed = false;
    this.#options = options;
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
    const body =
      `<Data><CertificateChains><CertificateChain>${b64CertificateChain}</CertificateChain></CertificateChains>` +
      `<Features><Feature Name="AESCBC"></Feature><REE><AESCBCS></AESCBCS></REE></Features></Data>`;

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
    const revocationListsXml = revLists ?? '';

    return (
      `<LA xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols" Id="SignedData" xml:space="preserve">` +
      `<Version>${protocolVersion}</Version>` +
      `<ContentHeader>${contentHeader}</ContentHeader>` +
      `<CLIENTINFO>` +
      `<CLIENTVERSION>${this.clientVersion}</CLIENTVERSION>` +
      `</CLIENTINFO>` +
      revocationListsXml +
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

  async generateRequest(initData: Uint8Array, initDataType: string = 'cenc') {
    this.initData = initData;
    this.initDataType = initDataType;
    const pssh = new Pssh(initData);
    const wrmHeader = pssh.wrmHeaders[0];
    const challenge = await this.getLicenseChallenge(wrmHeader);
    this.#emitMessage({
      message: fromText(challenge).toBuffer(),
      messageType: 'license-request',
    });
  }

  async update(response: Uint8Array) {
    const keys = await this.parseLicense(fromBuffer(response).toText());
    if (keys) this.#contentKeys = keys;
    this.#syncKeys();
    this.#emitKeysChange();
    this.#emitKeyStatusesChange();
  }

  async getLicenseChallenge(wrm_header: string | WrmHeader, rev_lists?: string) {
    const wrmHeader = wrm_header instanceof WrmHeader ? wrm_header : new WrmHeader(wrm_header);
    const xml_key = new XmlKey();
    const protocol_version = wrmHeader.getProtocolVersion();
    const revocationListsXml = rev_lists ?? this.#options.getRevocationListsXml?.();

    const laContent = this.#buildDigestContent(
      wrmHeader.dumps(),
      bytesToBase64(getRandomBytes(16)),
      bytesToBase64(this.#getKeyCipher(xml_key)),
      bytesToBase64(await this.#getDataCipher(xml_key)),
      protocol_version,
      revocationListsXml,
    );

    const contentHash = await createSha256(fromText(laContent).toBuffer());

    const signedInfo = this.#buildDigestInfo(bytesToBase64(contentHash));

    const signature = await ecc256Sign(this.signingKey.privateKey, fromText(signedInfo).toBuffer());

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
    this.#throwIfSoapFault(xmlDoc);
    await this.#verifySignedLicenseResponse(xmlDoc);
    this.#mergeRevocationInfo(xmlDoc);
    const licenseElements = findDescendantsByLocalName(xmlDoc, 'License');

    const keys: Key[] = [];

    for (const licenseElement of Array.from(licenseElements)) {
      const license = XmrLicense.loads(base64ToBytes(licenseElement.textContent ?? ''));
      const deviceKeyObject = license.getObjects(42)[0]?.data;
      const deviceKeyBytes =
        deviceKeyObject instanceof _EccDeviceKeyObject
          ? deviceKeyObject.key
          : deviceKeyObject &&
              typeof deviceKeyObject === 'object' &&
              'key' in deviceKeyObject &&
              deviceKeyObject.key instanceof Uint8Array
            ? (deviceKeyObject.key as Uint8Array)
            : null;

      if (deviceKeyBytes && !compareArrays(deviceKeyBytes, this.encryptionKey.publicBytes())) {
        throw new InvalidLicense('Public encryption key does not match');
      }

      const isScalable = license.getObjects(81).length > 0;

      for (const obj of license.getObjects(10)) {
        const contentKeyObject = obj.data as _ContentKeyObject;

        if (![3, 4, 6].includes(contentKeyObject.cipherType)) {
          throw new InvalidLicense(`Unsupported cipher type ${contentKeyObject.cipherType}`);
        }

        const viaSymmetric = contentKeyObject.cipherType === 6;

        const encryptedKey = contentKeyObject.encryptedKey;
        const decrypted = ecc256decrypt(this.encryptionKey.privateKey, encryptedKey);

        let ci = decrypted.subarray(0, 16);
        let ck = decrypted.subarray(16, 32);

        if (isScalable) {
          ci = decrypted.filter((_: number, index: number) => index % 2 === 0).slice(0, 16);
          ck = decrypted.filter((_: number, index: number) => index % 2 === 1).slice(0, 16);

          if (viaSymmetric) {
            const embeddedRootLicense = encryptedKey.subarray(0, 144);
            let embeddedLeafLicense = encryptedKey.subarray(144);

            const rgbKey = xorArrays(ck, this.rgbMagicConstantZero);
            const contentKeyPrime = await aesEcbEncrypt(ck, rgbKey);

            const auxKey = (license.getObjects(81)[0].data as _AuxiliaryKeysObject).auxiliaryKeys[0]
              .key;

            const uplinkXKey = await aesEcbEncrypt(contentKeyPrime, auxKey);
            const secondaryKey = await aesEcbEncrypt(ck, embeddedRootLicense.subarray(128));

            embeddedLeafLicense = await aesEcbEncrypt(uplinkXKey, embeddedLeafLicense);
            embeddedLeafLicense = await aesEcbEncrypt(secondaryKey, embeddedLeafLicense);

            ci = embeddedLeafLicense.subarray(0, 16);
            ck = embeddedLeafLicense.subarray(16, 32);
          }
        }

        const isValidSignature = await license.checkSignature(ci);
        if (!isValidSignature) {
          throw new InvalidLicense('License integrity signature does not match');
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
    return keys;
  }

  #throwIfSoapFault(xmlDoc: any) {
    const faultElement = findFirstDescendantByLocalName(xmlDoc, 'Fault');
    if (!faultElement) return;

    const faultString =
      findFirstDescendantByLocalName(faultElement, 'faultstring')?.textContent?.trim() ||
      findFirstDescendantByLocalName(faultElement, 'Text')?.textContent?.trim() ||
      'Unknown SOAP fault';

    throw new ServerException(faultString);
  }

  async #verifySignedLicenseResponse(xmlDoc: any) {
    const responseElement = findFirstDescendantByLocalName(xmlDoc, 'Response');
    if (!responseElement) return;

    const licenseResponseElement = findDirectChildByLocalName(responseElement, 'LicenseResponse');
    const signatureElement = findDirectChildByLocalName(responseElement, 'Signature');
    if (!licenseResponseElement || !signatureElement) return;

    const signingCertificateChainValue = findFirstDescendantByLocalName(
      licenseResponseElement,
      'SigningCertificateChain',
    )?.textContent?.trim();
    const signedInfoElement = findFirstDescendantByLocalName(signatureElement, 'SignedInfo');
    const digestValue = findFirstDescendantByLocalName(signatureElement, 'DigestValue')
      ?.textContent?.trim();
    const signatureValue = findFirstDescendantByLocalName(signatureElement, 'SignatureValue')
      ?.textContent?.trim();

    if (!signingCertificateChainValue || !signedInfoElement || !digestValue || !signatureValue) {
      return;
    }

    const serializedLicenseResponse = this.serializer.serializeToString(licenseResponseElement);
    const responseHash = await createSha256(fromText(serializedLicenseResponse).toBuffer());
    if (!compareArrays(responseHash, base64ToBytes(digestValue))) {
      throw new InvalidLicense('Digest mismatch in license');
    }

    const certificateChain = CertificateChain.from(base64ToBytes(signingCertificateChainValue));
    await certificateChain.verify();

    const signingKey = certificateChain.get(0).getKeyByUsage(BCertKeyUsage.SIGN_RESPONSE);
    if (!signingKey) {
      throw new InvalidLicense('No signing response key in license certificate chain');
    }

    const uncompressedPublicKey = new Uint8Array(65);
    uncompressedPublicKey[0] = 0x04;
    uncompressedPublicKey.set(signingKey, 1);

    const serializedSignedInfo = this.serializer.serializeToString(signedInfoElement);
    const isValidSignature = await ecc256Verify(
      uncompressedPublicKey,
      fromText(serializedSignedInfo).toBuffer(),
      base64ToBytes(signatureValue),
    );

    if (!isValidSignature) {
      throw new InvalidLicense('Signature mismatch in license');
    }
  }

  #mergeRevocationInfo(xmlDoc: any) {
    const revInfoElement = findFirstDescendantByLocalName(xmlDoc, 'RevInfo');
    if (!revInfoElement) return;

    this.#options.mergeRevocationInfo?.(this.serializer.serializeToString(revInfoElement));
  }

  async close() {
    if (this.#closed) return;
    this.#closed = true;
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('closed'));
  }

  waitForKeys(options?: WaitForKeysOptions) {
    return waitForKeys(this, () => this.keys, options);
  }

  #syncKeys() {
    this.keys.clear();
    this.keyStatuses.clear();

    for (const key of this.#contentKeys) {
      const keyId = fromBuffer(key.keyId).toHex();
      const value = fromBuffer(key.key).toHex();
      this.keys.set(keyId, value);
      this.keyStatuses.set(keyId, 'usable');
    }
  }

  #emitMessage(detail: MediaKeyMessageEventInit) {
    const event = new CustomEvent<MediaKeyMessageEventInit>('message', { detail });
    this.dispatchEvent(event);
    this.onmessage?.call(this, event);
  }

  #emitKeysChange() {
    const event = new Event('keyschange');
    this.dispatchEvent(event);
    this.onkeyschange?.call(this, event);
  }

  #emitKeyStatusesChange() {
    const detail: MediaKeyStatusesChangeEventInit = {
      keys: new Map(this.keys),
      keyStatuses: new Map(this.keyStatuses),
    };
    const event = new CustomEvent<MediaKeyStatusesChangeEventInit>('keystatuseschange', { detail });
    this.dispatchEvent(event);
    this.onkeystatuseschange?.call(this, event);
  }

  pause() {
    const values = {
      sessionId: this.sessionId,
      sessionType: this.sessionType,
      initData: this.initData ? fromBuffer(this.initData).toBase64() : undefined,
      initDataType: this.initDataType,
      certificateChain: fromBuffer(this.certificateChain).toBase64(),
      encryptionKey: fromBuffer(this.encryptionKey.dumps()).toBase64(),
      signingKey: fromBuffer(this.signingKey.dumps()).toBase64(),
      clientVersion: this.clientVersion,
      rgbMagicConstantZero: fromBuffer(this.rgbMagicConstantZero).toBase64(),
      wmrmServerKey: {
        x: this.wmrmServerKey.x.toString(),
        y: this.wmrmServerKey.y.toString(),
      },
      keys: this.#contentKeys.map((key) => ({
        keyId: fromBuffer(key.rawKeyId()).toHex(),
        key: fromBuffer(key.key).toHex(),
        cipherType: key.cipherType,
        keyType: key.keyType,
      })),
    };
    const state = JSON.stringify(values);
    return state;
  }

  resume(state: string) {
    return PlayReadySession.resume(state, this.deviceCredentials, this.#dispose, this.#options);
  }

  static resume(
    data: string,
    deviceCredentials: PlayReadySessionCredentials,
    dispose?: (sessionId: string) => void,
    options: PlayReadySessionOptions = {},
  ) {
    const values = JSON.parse(data);
    const session = new PlayReadySession(values.sessionType, deviceCredentials, dispose, options);
    session.sessionId = values.sessionId;
    session.initData = values.initData ? fromBase64(values.initData).toBuffer() : undefined;
    session.initDataType = values.initDataType;
    session.certificateChain = fromBase64(values.certificateChain).toBuffer();
    session.encryptionKey = EccKey.from(fromBase64(values.encryptionKey).toBuffer());
    session.signingKey = EccKey.from(fromBase64(values.signingKey).toBuffer());
    session.rgbMagicConstantZero = fromBase64(values.rgbMagicConstantZero).toBuffer();
    session.wmrmServerKey = {
      x: BigInt(values.wmrmServerKey.x),
      y: BigInt(values.wmrmServerKey.y),
    };
    session.clientVersion = values.clientVersion;
    session.#contentKeys = values.keys.map(
      (key: { keyId: string; key: string; keyType: number; cipherType: number }) =>
        new Key(
          fromHex(key.keyId).toBuffer(),
          key.keyType,
          key.cipherType,
          fromHex(key.key).toBuffer(),
        ),
    );
    session.#syncKeys();
    return session;
  }
}
