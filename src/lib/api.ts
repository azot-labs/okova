import { fromHex, parseBufferSource } from './utils';

export interface Key {
  keyId: string;
  key: string;
}

/**
 * https://w3c.github.io/encrypted-media/index.html#dfn-cdm
 */
export interface Cdm {
  keySystem: string;
  createSession: (
    sessionType?: MediaKeySessionType,
  ) => Promise<string> | string;
  generateRequest: (
    sessionId: string,
    initData: Uint8Array,
    initDataType?: string,
  ) => Promise<Uint8Array>;
  updateSession(sessionId: string, response: Uint8Array): Promise<void>;
  closeSession(sessionId: string): Promise<void>;
  removeSession?(sessionId: string): Promise<void>;
  getKeys?(sessionId: string): Key[];
}

/**
 * https://www.w3.org/TR/encrypted-media-2/#mediakeymessageevent
 */
export class MessageEvent extends Event implements MediaKeyMessageEvent {
  readonly messageType: MediaKeyMessageType;
  readonly message: ArrayBuffer;

  constructor(messageType: MediaKeyMessageType, message: ArrayBuffer) {
    super('message');
    this.messageType = messageType;
    this.message = message;
  }
}

export class Session extends EventTarget implements MediaKeySession {
  sessionId: string;
  readonly keyStatuses: Map<BufferSource, MediaKeyStatus>;
  readonly expiration: number;
  readonly closed: Promise<MediaKeySessionClosedReason>;

  onmessage: ((this: MediaKeySession, ev: MediaKeyMessageEvent) => any) | null;
  onkeyschange: ((this: MediaKeySession, ev: Event) => any) | null;
  onkeystatuseschange: ((this: MediaKeySession, ev: Event) => any) | null;

  sessionType?: MediaKeySessionType;
  keySystem: Cdm;
  keys: Key[];

  #closed: boolean;

  constructor(sessionType: MediaKeySessionType = 'temporary', keySystem: Cdm) {
    super();
    this.sessionId = '';
    this.keyStatuses = new Map();
    this.expiration = NaN;
    this.closed = new Promise<MediaKeySessionClosedReason>((resolve) => {
      this.addEventListener('closed', () => resolve('closed-by-application'));
    });

    this.onmessage = null;
    this.onkeyschange = null;
    this.onkeystatuseschange = null;

    this.sessionType = sessionType;
    this.keySystem = keySystem;
    this.keys = [];

    const sessionId = this.keySystem.createSession(this.sessionType);
    if (typeof sessionId === 'string') this.sessionId = sessionId;

    this.#closed = false;
  }

  async #validate() {
    if (this.#closed) throw new Error('Session closed');
    if (!this.sessionId) {
      this.sessionId = await this.keySystem.createSession(this.sessionType);
    }
  }

  async load(sessionId: string): Promise<boolean> {
    this.sessionId = sessionId;
    this.#closed = false;
    return true;
  }

  async generateRequest(
    initDataType: string,
    initData: BufferSource,
  ): Promise<void> {
    await this.#validate();
    const request = await this.keySystem.generateRequest(
      this.sessionId,
      parseBufferSource(initData),
      initDataType,
    );
    this.dispatchEvent(
      new MessageEvent('license-request', request as unknown as ArrayBuffer),
    );
  }

  async update(response: BufferSource): Promise<void> {
    await this.#validate();
    await this.keySystem.updateSession(
      this.sessionId,
      parseBufferSource(response),
    );

    const keys = this.keySystem.getKeys?.(this.sessionId);
    if (keys) {
      this.keys = keys;
      for (const key of keys) {
        const id = fromHex(key.keyId).toBuffer();
        this.keyStatuses.set(id, 'usable');
      }
      this.dispatchEvent(new Event('keystatuseschange'));
    }
  }

  async close(): Promise<void> {
    this.#closed = true;
    this.dispatchEvent(new Event('closed'));
  }

  async remove(): Promise<void> {
    this.dispatchEvent(new Event('removed'));
  }

  async waitForLicenseRequest() {
    return new Promise<Uint8Array>((resolve) => {
      this.addEventListener(
        'message',
        (e) => {
          const event = e as MessageEvent;
          if (event.messageType === 'license-request') {
            resolve(new Uint8Array(event.message));
          }
        },
        false,
      );
    });
  }

  async waitForKeyStatusesChange() {
    if (this.keys.length) return this.keys;
    return new Promise<Key[]>((resolve) => {
      this.addEventListener(
        'keystatuseschange',
        () => resolve(this.keys),
        false,
      );
    });
  }
}

/**
 * https://www.w3.org/TR/encrypted-media-2/#navigator-extension-requestmediakeysystemaccess
 */
export const requestMediaKeySystemAccess = (
  keySystem: string,
  supportedConfigurations: (MediaKeySystemConfiguration & { cdm: Cdm })[],
) => {
  const supportedKeySystems = new Set([
    'com.widevine.alpha',
    'com.microsoft.playready.recommendation',
  ]);
  if (!supportedKeySystems.has(keySystem))
    throw new Error('Unsupported media key system');
  return {
    keySystem,
    createMediaKeys: async () => {
      const state = { serverCertificate: null as BufferSource | null };
      return {
        createSession: (sessionType?: MediaKeySessionType) => {
          const cdm = supportedConfigurations[0].cdm;
          const session = new Session(sessionType, cdm);
          return session as MediaKeySession & Session;
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
};
