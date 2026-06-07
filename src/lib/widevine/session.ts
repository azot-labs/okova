import type { MediaKeyMessageEventInit } from '../api';
import { BaseMediaKeysEngineSession } from '../api';
import {
  License,
  LicenseRequest,
  LicenseType,
  ProtocolVersion,
  SignedDrmCertificate,
  SignedMessage,
} from './proto';
import { createHmacSha256, getRandomBytes, getRandomHex } from '../crypto/common';
import { Key } from './key';
import { WidevineDeviceCredentials } from './device-credentials';
import { PSSH, createPssh } from './pssh';
import { deriveContext, deriveKeys } from './context';
import { getMessageType } from './message';
import { parseCertificate, verifyCertificate } from './certificate';
import { concatUint8Arrays } from '../buffer';
import { fromBase64, fromBuffer, fromText, Logger, parseBufferSource } from '../utils';

export const SESSION_TYPES = {
  temporary: 0,
  'persistent-license': 1,
} as const;

export type SessionType = keyof typeof SESSION_TYPES;

const toLittleEndianBytes = (value: number, byteLength: number) => {
  const bytes = new Uint8Array(byteLength);
  let remaining = value;
  for (let index = 0; index < byteLength; index++) {
    bytes[index] = remaining & 0xff;
    remaining = Math.floor(remaining / 256);
  }
  return bytes;
};

export const generateSessionId = (deviceType: string) => {
  switch (deviceType) {
    case 'chrome':
      return fromBuffer(getRandomBytes()).toBase64();
    case 'android':
    default: {
      // format: 16 random hexdigits, 2 digit counter, 14 0s
      const randAscii = getRandomHex();
      const counter = '01'; // this resets regularly so its fine to use 01
      const rest = '00000000000000';
      const hex = randAscii + counter + rest;
      return hex;
    }
  }
};

export const generateRequestId = (deviceType: string, sessionNumber: number) => {
  switch (deviceType) {
    case 'chrome':
      return getRandomBytes(16);
    case 'android':
    default: {
      const requestId = new Uint8Array(16);
      requestId.set(getRandomBytes(4), 0);
      requestId.set(toLittleEndianBytes(sessionNumber, 8), 8);
      return fromText(fromBuffer(requestId).toHex().toUpperCase()).toBuffer();
    }
  }
};

const generateKeyControlNonce = () => {
  const limit = 2 ** 31 - 1;
  return (crypto.getRandomValues(new Uint32Array(1))[0] % limit) + 1;
};

type ServiceCertificateProvider = () => SignedDrmCertificate | undefined;

export class WidevineSession extends BaseMediaKeysEngineSession {
  sessionId: string;
  expiration: number;
  closed: Promise<MediaKeySessionClosedReason>;
  sessionType: SessionType;
  deviceCredentials: WidevineDeviceCredentials;
  sessionNumber: number;
  initData?: Uint8Array;
  initDataType?: string;
  serviceCertificate?: SignedDrmCertificate;
  contexts: Map<string, { enc: Uint8Array; auth: Uint8Array }>;
  log: Logger;

  #contentKeys: Map<string, Key>;
  #dispose: (sessionId: string) => void;
  #getServiceCertificate: ServiceCertificateProvider;
  #closed: boolean;

  constructor(
    sessionType: SessionType = 'temporary',
    deviceCredentials: WidevineDeviceCredentials,
    dispose: (sessionId: string) => void = () => {},
    getServiceCertificate: ServiceCertificateProvider = () => undefined,
    sessionNumber = 1,
  ) {
    super(sessionType);
    this.sessionId = generateSessionId(deviceCredentials.type ?? 'android');
    this.expiration = NaN;
    this.closed = new Promise<MediaKeySessionClosedReason>((resolve) => {
      this.addEventListener('closed', () => resolve('closed-by-application'));
    });
    this.sessionType = sessionType;
    this.deviceCredentials = deviceCredentials;
    this.sessionNumber = sessionNumber;
    this.contexts = new Map();
    this.log = console;
    this.#contentKeys = new Map();
    this.#dispose = dispose;
    this.#getServiceCertificate = getServiceCertificate;
    this.#closed = false;
  }

  setLogger(logger: Logger) {
    this.log = logger;
  }

  async generateRequest(initData: Uint8Array, initDataType?: string): Promise<void>;
  async generateRequest(initDataType: string, initData: BufferSource): Promise<Uint8Array | void>;
  async generateRequest(
    first: Uint8Array | string,
    second?: string | BufferSource,
  ): Promise<Uint8Array | void> {
    const initData = typeof first === 'string' ? parseBufferSource(second as BufferSource) : first;
    const resolvedInitDataType =
      typeof first === 'string' ? first : typeof second === 'string' ? second : 'cenc';

    const pssh = createPssh(initData);
    const licenseRequest = await this.#createLicenseRequest(pssh);
    const message = await this.#signMessage(
      licenseRequest.bytes,
      SignedMessage.MessageType.LICENSE_REQUEST,
    );
    this.initData = initData;
    this.initDataType = resolvedInitDataType;
    this.contexts.set(
      fromBuffer(licenseRequest.requestId).toText(),
      deriveContext(licenseRequest.bytes),
    );
    this.emitMessage({
      message: new Uint8Array(message.bytes),
      messageType: 'license-request',
    });
    return typeof first === 'string' ? message.bytes : undefined;
  }

  async waitForLicenseRequest() {
    return new Promise<Uint8Array>((resolve) => {
      const handler = (event: Event) => {
        const detail = (event as CustomEvent<MediaKeyMessageEventInit>).detail;
        if (detail.messageType !== 'license-request') return;
        this.removeEventListener('message', handler);
        resolve(detail.message);
      };

      this.addEventListener('message', handler);
    });
  }

  async #createLicenseRequest(pssh: PSSH) {
    const serviceCertificate = this.#getCurrentServiceCertificate();
    const requestId = generateRequestId(
      this.deviceCredentials.type ?? 'android',
      this.sessionNumber,
    );
    const entity = LicenseRequest.create({
      clientId: serviceCertificate ? undefined : this.deviceCredentials.id,
      encryptedClientId: serviceCertificate
        ? await this.deviceCredentials.encryptId(serviceCertificate)
        : undefined,
      contentId: {
        widevinePsshData: {
          psshData: [pssh.toBuffer()],
          licenseType:
            this.sessionType === 'persistent-license' ? LicenseType.OFFLINE : LicenseType.STREAMING,
          requestId: requestId,
        },
      },
      type: LicenseRequest.RequestType.NEW,
      requestTime: Math.round(Date.now() / 1000),
      protocolVersion: ProtocolVersion.VERSION_2_1,
      keyControlNonce: generateKeyControlNonce(),
    });
    const bytes = LicenseRequest.encode(entity).finish();
    return { requestId, entity, bytes };
  }

  #getCurrentServiceCertificate() {
    return this.serviceCertificate ?? this.#getServiceCertificate();
  }

  async #signMessage(message: Uint8Array, type: SignedMessage.MessageType) {
    const entity = SignedMessage.create({
      type,
      msg: message,
      signature: await this.deviceCredentials.signWithKey(message),
    });
    const bytes = SignedMessage.encode(entity).finish();
    return { entity, bytes };
  }

  load(sessionId: string): Promise<boolean> {
    this.sessionId = sessionId;
    return Promise.resolve(true);
  }

  async update(response: Uint8Array): Promise<void> {
    let type: SignedMessage.MessageType;
    try {
      type = getMessageType(response);
    } catch (error) {
      this.log.error('Unable to parse license - check protobufs');
      this.log.debug(fromBuffer(response).toText());
      throw error;
    }
    if (type === SignedMessage.MessageType.SERVICE_CERTIFICATE) {
      await this.#setServiceCertificate(response);
      if (!this.initData || !this.initDataType) return;
      await this.generateRequest(this.initData, this.initDataType);
      return;
    }

    let signedLicense = null;
    try {
      signedLicense = SignedMessage.decode(response);
    } catch (error) {
      this.log.error('Unable to parse license - check protobufs');
      this.log.debug(fromBuffer(response).toText());
      throw new Error('Unable to parse license - check protobufs', { cause: error });
    }

    const license = License.decode(signedLicense.msg);
    const requestId = fromBuffer(license.id!.requestId!).toText();
    const context = this.contexts.get(requestId);
    if (!context) {
      throw new Error(`Failed to find context to decrypt keys, requestId: ${requestId}`);
    }

    const sessionKey = await this.deviceCredentials.decryptWithKey(signedLicense.sessionKey);
    const derivedKeys = await deriveKeys(context.enc, context.auth, sessionKey);

    const { success, signature } = await this.#verifyMessage(
      signedLicense,
      derivedKeys.macKeyServer,
    );
    if (!success) {
      this.log.debug(`Calculated signature: ${signature.calculated}`);
      this.log.debug(`Actual signature: ${signature.actual}`);
      throw new Error('Signature mismatch on license message, rejecting license');
    }

    for (const keyContainer of license.key) {
      if (!keyContainer.key || !keyContainer.iv) continue;
      const key = await Key.fromContainer(keyContainer, derivedKeys.encKey);
      if (!key.id || key.type !== 'CONTENT') continue;
      this.#addKey(key);
    }

    this.contexts.delete(requestId);
    this.emitKeysChange();
    this.emitKeyStatusesChange();
  }

  async #setServiceCertificate(certificate: Uint8Array) {
    const { signedDrmCertificate, drmCertificate } = await parseCertificate(certificate);
    const isValid = await verifyCertificate(signedDrmCertificate);
    if (!isValid) throw new Error('Certificate invalid: signature mismatch');
    this.serviceCertificate = signedDrmCertificate;
    return drmCertificate.providerId;
  }

  async #verifyMessage(message: SignedMessage, key: Uint8Array) {
    const actualSignatureHex = fromBuffer(message.signature).toHex();
    const data = [message.msg];
    if (message.oemcryptoCoreMessage?.length) data.unshift(message.oemcryptoCoreMessage);
    const calculatedSignature = await createHmacSha256(
      key as BufferSource,
      concatUint8Arrays(...data),
    );
    const calculatedSignatureHex = fromBuffer(calculatedSignature).toHex();
    return {
      success: actualSignatureHex === calculatedSignatureHex,
      signature: {
        actual: actualSignatureHex,
        calculated: calculatedSignatureHex,
      },
    };
  }

  #addKey(key: Key) {
    this.#contentKeys.set(key.id, key);
    this.keys.set(key.id, key.value);
    this.keyStatuses.set(key.id, 'usable');
  }

  async getKeys() {
    return Array.from(this.#contentKeys.values());
  }

  async close(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('closed'));
  }

  async remove(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('closed'));
  }

  pause() {
    const values = {
      sessionId: this.sessionId,
      sessionNumber: this.sessionNumber,
      sessionType: this.sessionType,
      initData: this.initData ? fromBuffer(this.initData).toBase64() : undefined,
      initDataType: this.initDataType,
      serviceCertificate: this.serviceCertificate
        ? fromBuffer(
            SignedDrmCertificate.encode(this.serviceCertificate).finish(),
          ).toBase64()
        : undefined,
      contexts: Object.fromEntries(
        this.contexts.entries().map(([key, value]) => [
          key,
          {
            enc: fromBuffer(value.enc).toBase64(),
            auth: fromBuffer(value.auth).toBase64(),
          },
        ]),
      ),
      keys: Object.fromEntries(
        Array.from(this.#contentKeys.entries(), ([keyId, key]) => [
          keyId,
          { id: key.id, value: key.value },
        ]),
      ),
      keyStatuses: Object.fromEntries(this.keyStatuses),
    };
    return JSON.stringify(values);
  }

  resume(state: string) {
    return WidevineSession.resume(
      state,
      this.deviceCredentials,
      this.#dispose,
      this.#getServiceCertificate,
    );
  }

  static resume(
    state: string,
    deviceCredentials: WidevineDeviceCredentials,
    dispose?: (sessionId: string) => void,
    getServiceCertificate: ServiceCertificateProvider = () => undefined,
  ) {
    const values = JSON.parse(state);
    const session = new WidevineSession(
      values.sessionType,
      deviceCredentials,
      dispose,
      getServiceCertificate,
      values.sessionNumber,
    );
    session.sessionId = values.sessionId;
    session.initData = values.initData ? fromBase64(values.initData).toBuffer() : undefined;
    session.initDataType = values.initDataType;
    session.serviceCertificate = values.serviceCertificate
      ? SignedDrmCertificate.decode(fromBase64(values.serviceCertificate).toBuffer())
      : undefined;
    session.contexts = new Map(
      Object.entries(values.contexts).map(([key, value]) => [
        key,
        {
          enc: fromBase64((value as { enc: string; auth: string }).enc).toBuffer(),
          auth: fromBase64((value as { enc: string; auth: string }).auth).toBuffer(),
        },
      ]),
    );
    session.#contentKeys = new Map(
      Object.entries(values.keys).map(([keyId, value]) => {
        const persistedKey = value as Key;
        return [keyId, new Key(persistedKey.id, persistedKey.value)];
      }),
    );
    session.keys = new Map(
      Array.from(session.#contentKeys.entries(), ([keyId, key]) => [keyId, key.value]),
    );
    session.keyStatuses = new Map(
      Object.entries(values.keyStatuses).map(([keyId, status]) => [
        keyId,
        status as MediaKeyStatus,
      ]),
    );
    return session;
  }
}
