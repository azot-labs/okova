import type {
  MediaKeyMessageEventInit,
  MediaKeysEngine,
  MediaKeysEngineSession,
  MediaKeysMap,
  MediaKeyStatusesChangeEventInit,
  WaitForKeysOptions,
} from '../api';
import { waitForKeys } from '../api';
import { fromBuffer } from '../utils';
import { PlayReadyDeviceCredentials } from './device-credentials';
import { PlayReadySession } from './session';

class PlayReadyEngineSession extends EventTarget implements MediaKeysEngineSession {
  readonly sessionType: MediaKeySessionType;
  readonly keyStatuses: Map<string, MediaKeyStatus>;
  readonly keys: MediaKeysMap;

  onmessage:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyMessageEventInit>) => any)
    | null;
  onkeyschange: ((this: MediaKeysEngineSession, ev: Event) => any) | null;
  onkeystatuseschange:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyStatusesChangeEventInit>) => any)
    | null;

  #session: PlayReadySession;
  #dispose: (sessionId: string) => void;
  #closed: boolean;

  constructor(session: PlayReadySession, dispose: (sessionId: string) => void) {
    super();
    this.#session = session;
    this.#dispose = dispose;
    this.sessionType = session.sessionType;
    this.keyStatuses = new Map();
    this.keys = new Map();
    this.onmessage = null;
    this.onkeyschange = null;
    this.onkeystatuseschange = null;
    this.#closed = false;
    this.#syncKeys();
  }

  get sessionId() {
    return this.#session.sessionId;
  }

  async generateRequest(initData: Uint8Array, initDataType: string = 'cenc') {
    const message = await this.#session.generateRequest(this.sessionId, initData, initDataType);
    this.#emitMessage({
      message,
      messageType: 'license-request',
    });
  }

  async update(response: Uint8Array) {
    await this.#session.update(response);
    this.#syncKeys();
    const event = new Event('keyschange');
    this.dispatchEvent(event);
    this.onkeyschange?.call(this, event);
    this.#emitKeyStatusesChange();
  }

  async close() {
    this.#closed = true;
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('closed'));
  }

  pause() {
    return this.#session.pause();
  }

  waitForKeys(options?: WaitForKeysOptions) {
    return waitForKeys(this, () => this.keys, options);
  }

  #syncKeys() {
    this.keys.clear();
    this.keyStatuses.clear();

    for (const key of this.#session.keys) {
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

  #emitKeyStatusesChange() {
    const detail: MediaKeyStatusesChangeEventInit = {
      keys: new Map(this.keys),
      keyStatuses: new Map(this.keyStatuses),
    };
    const event = new CustomEvent<MediaKeyStatusesChangeEventInit>('keystatuseschange', { detail });
    this.dispatchEvent(event);
    this.onkeystatuseschange?.call(this, event);
  }
}

export class PlayReady implements MediaKeysEngine {
  keySystem = 'com.microsoft.playready.recommendation';
  sessions: Map<string, MediaKeysEngineSession>;
  deviceCredentials: PlayReadyDeviceCredentials;

  static DeviceCredentials = PlayReadyDeviceCredentials;

  constructor(options: { deviceCredentials: PlayReadyDeviceCredentials }) {
    this.sessions = new Map();
    this.deviceCredentials = options.deviceCredentials;
  }

  async getStatusForPolicy(): Promise<MediaKeyStatus> {
    return 'usable';
  }

  async setServerCertificate(): Promise<boolean> {
    return true;
  }

  createSession(sessionType?: MediaKeySessionType) {
    const session = new PlayReadySession(sessionType, this.deviceCredentials);
    const engineSession = new PlayReadyEngineSession(session, (sessionId) => {
      this.sessions.delete(sessionId);
    });
    this.sessions.set(engineSession.sessionId, engineSession);
    return engineSession;
  }

  resumeSession(state: string) {
    const session = PlayReadySession.resume(state, this.deviceCredentials);
    const engineSession = new PlayReadyEngineSession(session, (sessionId) => {
      this.sessions.delete(sessionId);
    });
    this.sessions.set(engineSession.sessionId, engineSession);
    return engineSession;
  }
}
