import type { EncryptedPacket } from './decrypt';
import { decryptPacketWithKeys } from './decrypt';
import { fromHex, parseBufferSource } from './utils';
export type {
  EncryptedPacket,
  EncryptionPattern,
  EncryptionScheme,
  PsshBox,
  SubsampleEncryption,
} from './decrypt';

export type MediaKeySessionId = string;
export type MediaKeyId = string;
export type MediaKey = string;
export type MediaKeysMap = Map<MediaKeyId, MediaKey>;

export interface MediaKeyMessageEventInit {
  message: Uint8Array<ArrayBuffer>;
  messageType: MediaKeyMessageType;
}

export interface MediaKeyStatusesChangeEventInit {
  keyStatuses: Map<MediaKeyId, MediaKeyStatus>;
  keys: MediaKeysMap;
}

export interface WaitForKeysOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface MediaKeysEngineSession extends EventTarget {
  readonly sessionId: MediaKeySessionId;
  readonly sessionType: MediaKeySessionType;
  readonly keyStatuses: Map<MediaKeyId, MediaKeyStatus>;
  readonly keys: MediaKeysMap;

  onmessage:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyMessageEventInit>) => any)
    | null;
  onkeyschange: ((this: MediaKeysEngineSession, ev: Event) => any) | null;
  onkeystatuseschange:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyStatusesChangeEventInit>) => any)
    | null;

  generateRequest(
    initData: Uint8Array,
    /** Default: `cenc` */
    initDataType?: 'cenc' | 'webm' | 'keyids' | 'skd' | 'sinf' | string,
  ): Promise<void>;

  update(response: Uint8Array): Promise<void>;
  decrypt(packet: EncryptedPacket): Promise<Uint8Array>;
  close(): Promise<void>;
  remove?(): Promise<void>;
  pause?(): string;

  waitForKeys(options?: WaitForKeysOptions): Promise<MediaKeysMap>;
}

export interface MediaKeysEngine {
  readonly keySystem: string;

  getStatusForPolicy(policy?: MediaKeysPolicy): Promise<MediaKeyStatus>;
  setServerCertificate(serverCertificate: Uint8Array): Promise<boolean>;

  createSession(
    /** Default: `temporary` */
    sessionType?: MediaKeySessionType,
  ): Promise<MediaKeysEngineSession> | MediaKeysEngineSession;

  resumeSession?(state: string): MediaKeysEngineSession;
}

export abstract class BaseMediaKeysEngineSession
  extends EventTarget
  implements MediaKeysEngineSession
{
  sessionId = '';
  sessionType: MediaKeySessionType;
  keyStatuses: Map<MediaKeyId, MediaKeyStatus>;
  keys: MediaKeysMap;

  onmessage:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyMessageEventInit>) => any)
    | null;
  onkeyschange: ((this: MediaKeysEngineSession, ev: Event) => any) | null;
  onkeystatuseschange:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyStatusesChangeEventInit>) => any)
    | null;

  protected constructor(sessionType: MediaKeySessionType = 'temporary') {
    super();
    this.sessionType = sessionType;
    this.keyStatuses = new Map();
    this.keys = new Map();
    this.onmessage = null;
    this.onkeyschange = null;
    this.onkeystatuseschange = null;
  }

  abstract generateRequest(initData: Uint8Array, initDataType?: string): Promise<void>;
  abstract update(response: Uint8Array): Promise<void>;
  abstract close(): Promise<void>;
  remove?(): Promise<void>;
  pause?(): string;

  async decrypt(packet: EncryptedPacket) {
    return decryptPacketWithKeys(packet, this.keys, this.keyStatuses);
  }

  waitForKeys(options?: WaitForKeysOptions) {
    return waitForKeys(this, () => this.keys, options);
  }

  protected emitMessage(detail: MediaKeyMessageEventInit) {
    const event = new CustomEvent<MediaKeyMessageEventInit>('message', { detail });
    this.dispatchEvent(event);
    this.onmessage?.call(this, event);
  }

  protected emitKeysChange() {
    const event = new Event('keyschange');
    this.dispatchEvent(event);
    this.onkeyschange?.call(this, event);
  }

  protected emitKeyStatusesChange() {
    const detail: MediaKeyStatusesChangeEventInit = {
      keys: new Map(this.keys),
      keyStatuses: new Map(this.keyStatuses),
    };
    const event = new CustomEvent<MediaKeyStatusesChangeEventInit>('keystatuseschange', { detail });
    this.dispatchEvent(event);
    this.onkeystatuseschange?.call(this, event);
  }
}

export abstract class BaseMediaKeysEngine implements MediaKeysEngine {
  abstract readonly keySystem: string;

  async getStatusForPolicy(): Promise<MediaKeyStatus> {
    return 'usable';
  }

  abstract setServerCertificate(serverCertificate: Uint8Array): Promise<boolean>;
  abstract createSession(
    sessionType?: MediaKeySessionType,
  ): Promise<MediaKeysEngineSession> | MediaKeysEngineSession;

  resumeSession?(state: string): MediaKeysEngineSession;
}

/**
 * https://www.w3.org/TR/encrypted-media-2/#mediakeymessageevent
 */
export class MediaKeyMessageEvent extends Event {
  readonly messageType: MediaKeyMessageType;
  readonly message: ArrayBuffer;

  constructor(messageType: MediaKeyMessageType, message: ArrayBuffer) {
    super('message');
    this.messageType = messageType;
    this.message = message;
  }
}

export { MediaKeyMessageEvent as MessageEvent };

const toArrayBuffer = (bytes: Uint8Array) =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

export const waitForKeys = (
  target: EventTarget,
  getKeys: () => MediaKeysMap,
  options: WaitForKeysOptions = {},
): Promise<MediaKeysMap> => {
  const currentKeys = getKeys();
  if (currentKeys.size) return Promise.resolve(new Map(currentKeys));
  if (options.signal?.aborted) {
    return Promise.reject(options.signal.reason ?? new Error('Aborted while waiting for keys'));
  }

  return new Promise<MediaKeysMap>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      target.removeEventListener('keyschange', handler);
      options.signal?.removeEventListener('abort', handleAbort);
    };

    const handler = () => {
      const keys = getKeys();
      if (!keys.size) return;
      cleanup();
      resolve(new Map(keys));
    };

    const handleAbort = () => {
      cleanup();
      reject(options.signal?.reason ?? new Error('Aborted while waiting for keys'));
    };

    if (options.timeoutMs !== undefined) {
      timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out after ${options.timeoutMs}ms waiting for keys`));
      }, options.timeoutMs);
    }

    target.addEventListener('keyschange', handler);
    options.signal?.addEventListener('abort', handleAbort, { once: true });
  });
};

const syncSessionKeys = (
  target: Map<BufferSource, MediaKeyStatus>,
  source: Map<MediaKeyId, MediaKeyStatus>,
) => {
  target.clear();
  for (const [keyId, status] of source) {
    target.set(fromHex(keyId).toBuffer() as BufferSource, status);
  }
};

export class Session extends EventTarget implements MediaKeySession {
  expiration: number;
  closed: Promise<MediaKeySessionClosedReason>;
  keyStatuses: Map<BufferSource, MediaKeyStatus>;

  onmessage: ((this: MediaKeySession, ev: MediaKeyMessageEvent) => any) | null;
  onkeyschange: ((this: MediaKeySession, ev: Event) => any) | null;
  onkeystatuseschange: ((this: MediaKeySession, ev: Event) => any) | null;

  sessionType?: MediaKeySessionType;
  engine: MediaKeysEngine;
  keys: MediaKeysMap;

  // @ts-ignore
  initData?: BufferSource | undefined;
  initDataType?: string | undefined;

  #closed: boolean;
  #engineSession: MediaKeysEngineSession | null;
  #engineSessionPromise: Promise<MediaKeysEngineSession>;
  #messageQueue: MediaKeyMessageEventInit[];

  constructor(
    sessionType: MediaKeySessionType = 'temporary',
    engine: MediaKeysEngine,
    engineSession?: MediaKeysEngineSession | Promise<MediaKeysEngineSession>,
  ) {
    super();
    this.expiration = NaN;
    this.closed = new Promise<MediaKeySessionClosedReason>((resolve) => {
      this.addEventListener('closed', () => resolve('closed-by-application'));
    });
    this.keyStatuses = new Map();

    this.onmessage = null;
    this.onkeyschange = null;
    this.onkeystatuseschange = null;

    this.sessionType = sessionType;
    this.engine = engine;
    this.keys = new Map();

    this.#closed = false;
    this.#engineSession = null;
    this.#messageQueue = [];
    const initialEngineSession = engineSession ?? this.engine.createSession(this.sessionType);
    if (initialEngineSession instanceof Promise) {
      this.#engineSessionPromise = initialEngineSession.then((session) => {
        this.#attachEngineSession(session);
        return session;
      });
    } else {
      this.#attachEngineSession(initialEngineSession);
      this.#engineSessionPromise = Promise.resolve(initialEngineSession);
    }
  }

  get sessionId() {
    return this.#engineSession?.sessionId ?? '';
  }

  async #getEngineSession() {
    if (this.#closed) throw new Error('Session closed');
    return this.#engineSessionPromise;
  }

  #attachEngineSession(session: MediaKeysEngineSession) {
    this.#engineSession = session;
    this.#bindEngineSession(session);
    this.#syncFromEngineSession(session);
  }

  #bindEngineSession(session: MediaKeysEngineSession) {
    session.addEventListener('message', this.#handleMessage);
    session.addEventListener('keystatuseschange', this.#handleKeyStatusesChange);
    session.addEventListener('keyschange', this.#handleKeysChange);
    session.addEventListener('closed', this.#handleClosed);
  }

  #handleMessage = (event: Event) => {
    const { message, messageType } = (event as CustomEvent<MediaKeyMessageEventInit>).detail;
    this.#messageQueue.push({ message, messageType });
    const messageEvent = new MediaKeyMessageEvent(messageType, toArrayBuffer(message));
    this.dispatchEvent(messageEvent);
    this.onmessage?.call(this as unknown as MediaKeySession, messageEvent);
  };

  #handleKeysChange = () => {
    const keysChangeEvent = new Event('keyschange');
    this.dispatchEvent(keysChangeEvent);
    this.onkeyschange?.call(this as unknown as MediaKeySession, keysChangeEvent);
  };

  #handleKeyStatusesChange = (event: Event) => {
    const { detail } = event as CustomEvent<MediaKeyStatusesChangeEventInit>;
    this.keys = new Map(detail.keys);
    syncSessionKeys(this.keyStatuses, detail.keyStatuses);

    const keyStatusesChangeEvent = new Event('keystatuseschange');
    this.dispatchEvent(keyStatusesChangeEvent);
    this.onkeystatuseschange?.call(this as unknown as MediaKeySession, keyStatusesChangeEvent);
  };

  #handleClosed = () => {
    if (this.#closed) return;
    this.#closed = true;
    this.dispatchEvent(new Event('closed'));
  };

  #handleRemove = () => {
    if (!this.#closed) {
      this.#closed = true;
      this.dispatchEvent(new Event('closed'));
    }

    this.dispatchEvent(new Event('removed'));
  };

  #syncFromEngineSession(session: MediaKeysEngineSession) {
    this.keys = new Map(session.keys);
    syncSessionKeys(this.keyStatuses, session.keyStatuses);
  }

  async load(_sessionId: string): Promise<boolean> {
    return false;
  }

  async generateRequest(initDataType: string, initData: BufferSource): Promise<void> {
    const session = await this.#getEngineSession();
    this.initDataType = initDataType;
    this.initData = initData;
    await session.generateRequest(parseBufferSource(initData), initDataType);
  }

  async update(response: BufferSource): Promise<void> {
    const session = await this.#getEngineSession();
    await session.update(parseBufferSource(response));
    this.#syncFromEngineSession(session);
  }

  async close(): Promise<void> {
    const session = await this.#getEngineSession();
    await session.close();
    if (!this.#closed) {
      this.#closed = true;
      this.dispatchEvent(new Event('closed'));
    }
  }

  async remove(): Promise<void> {
    const session = await this.#getEngineSession();
    await session.remove?.();
    this.#handleRemove();
  }

  async waitForLicenseRequest() {
    const queuedMessage = this.#messageQueue.find(
      (message) => message.messageType === 'license-request',
    );
    if (queuedMessage) return queuedMessage.message;

    return new Promise<Uint8Array>((resolve) => {
      const handler = (event: Event) => {
        const messageEvent = event as MediaKeyMessageEvent;
        if (messageEvent.messageType !== 'license-request') return;

        this.removeEventListener('message', handler);
        resolve(new Uint8Array(messageEvent.message));
      };

      this.addEventListener('message', handler);
    });
  }

  async waitForKeyStatusesChange() {
    if (this.keys.size) return this.keys;

    return new Promise<MediaKeysMap>((resolve) => {
      const handler = () => {
        this.removeEventListener('keystatuseschange', handler);
        resolve(new Map(this.keys));
      };

      this.addEventListener('keystatuseschange', handler);
    });
  }

  pause() {
    if (!this.#engineSession?.pause) {
      throw new Error('Key system does not support session serialization');
    }
    return this.#engineSession.pause();
  }

  resume(state: string) {
    return Session.resume(state, this.engine);
  }

  static resume(state: string, engine: MediaKeysEngine) {
    if (!engine.resumeSession) {
      throw new Error('Key system does not support session serialization');
    }
    const nativeSession = engine.resumeSession(state);
    return new Session(nativeSession.sessionType, engine, nativeSession);
  }
}

export const ALL_ENGINES: MediaKeysEngine[] = [];

const enginesByKeySystem = new Map<string, MediaKeysEngine>();

export const setSupportedEngines = (engines: MediaKeysEngine[]) => {
  enginesByKeySystem.clear();
  for (const engine of engines) {
    enginesByKeySystem.set(engine.keySystem, engine);
  }
};

/**
 * https://www.w3.org/TR/encrypted-media-2/#navigator-extension-requestmediakeysystemaccess
 */
export const requestMediaKeySystemAccess = (
  keySystem: string,
  supportedConfigurations: MediaKeySystemConfiguration[],
) => {
  const engine = enginesByKeySystem.get(keySystem);
  if (!engine) throw new Error('Unsupported media key system');
  return {
    keySystem: engine.keySystem,
    createMediaKeys: async () => {
      return {
        createSession: (sessionType?: MediaKeySessionType) => {
          return new Session(sessionType, engine);
        },
        setServerCertificate: async (serverCertificate: BufferSource): Promise<boolean> => {
          return engine.setServerCertificate(parseBufferSource(serverCertificate));
        },
        getStatusForPolicy: async (policy?: MediaKeysPolicy): Promise<MediaKeyStatus> => {
          return engine.getStatusForPolicy(policy);
        },
      };
    },
    getConfiguration: () => supportedConfigurations[0],
  };
};
