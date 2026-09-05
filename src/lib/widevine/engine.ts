import type { MediaKeysEngineSession } from '../api';
import { BaseMediaKeysEngine } from '../api';
import { parseCertificate, verifyCertificate } from './certificate';
import { WidevineDeviceCredentials } from './device-credentials';
import { SignedDrmCertificate } from './proto';
import { WidevineSession } from './session';

export class Widevine extends BaseMediaKeysEngine {
  keySystem = 'com.widevine.alpha';
  sessions: Map<string, MediaKeysEngineSession>;
  deviceCredentials: WidevineDeviceCredentials;
  serverCertificate?: SignedDrmCertificate;

  static DeviceCredentials = WidevineDeviceCredentials;
  #sessionNumber = 0;

  #handleSessionDisposed = (sessionId: string, session: MediaKeysEngineSession) => {
    if (this.sessions.get(sessionId) === session) this.sessions.delete(sessionId);
  };

  #trackSession(session: WidevineSession) {
    if (this.sessions.has(session.sessionId)) {
      throw new Error(`Session ${session.sessionId} is already open`);
    }
    this.sessions.set(session.sessionId, session);
    this.#sessionNumber = Math.max(this.#sessionNumber, session.sessionNumber);
    return session;
  }

  constructor({ deviceCredentials }: { deviceCredentials: WidevineDeviceCredentials }) {
    super();
    this.sessions = new Map();
    this.deviceCredentials = deviceCredentials;
  }

  async setServerCertificate(serverCertificate: Uint8Array): Promise<boolean> {
    const { signedDrmCertificate } = await parseCertificate(serverCertificate);
    const isValid = await verifyCertificate(signedDrmCertificate);
    if (!isValid) throw new Error('Certificate invalid: signature mismatch');
    this.serverCertificate = signedDrmCertificate;
    return true;
  }

  createSession(sessionType?: MediaKeySessionType) {
    const session = new WidevineSession(
      sessionType,
      this.deviceCredentials,
      this.#handleSessionDisposed,
      () => this.serverCertificate,
      this.#sessionNumber + 1,
    );
    return this.#trackSession(session);
  }

  resumeSession(state: string) {
    const session = WidevineSession.resume(
      state,
      this.deviceCredentials,
      this.#handleSessionDisposed,
      () => this.serverCertificate,
    );
    return this.#trackSession(session);
  }
}
