import type {
  MediaKeysEngine,
  MediaKeysEngineSession,
} from '../api';
import { parseCertificate, verifyCertificate } from './certificate';
import { WidevineDeviceCredentials } from './device-credentials';
import { SignedDrmCertificate } from './proto';
import { WidevineSession } from './session';

export class Widevine implements MediaKeysEngine {
  keySystem = 'com.widevine.alpha';
  sessions: Map<string, MediaKeysEngineSession>;
  deviceCredentials: WidevineDeviceCredentials;
  serverCertificate?: SignedDrmCertificate;

  static DeviceCredentials = WidevineDeviceCredentials;

  constructor({ deviceCredentials }: { deviceCredentials: WidevineDeviceCredentials }) {
    this.sessions = new Map();
    this.deviceCredentials = deviceCredentials;
  }

  async getStatusForPolicy(): Promise<MediaKeyStatus> {
    return 'usable';
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
      (sessionId) => {
        this.sessions.delete(sessionId);
      },
      () => this.serverCertificate,
    );
    this.sessions.set(session.sessionId, session);
    return session;
  }

  resumeSession(state: string) {
    const session = WidevineSession.resume(
      state,
      this.deviceCredentials,
      (sessionId) => {
        this.sessions.delete(sessionId);
      },
      () => this.serverCertificate,
    );
    this.sessions.set(session.sessionId, session);
    return session;
  }
}
