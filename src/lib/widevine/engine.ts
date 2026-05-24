import type {
  MediaKeysEngine,
  MediaKeysEngineSession,
} from '../api';
import { WidevineDeviceCredentials } from './device-credentials';
import { WidevineSession } from './session';

export class Widevine implements MediaKeysEngine {
  keySystem = 'com.widevine.alpha';
  sessions: Map<string, MediaKeysEngineSession>;
  deviceCredentials: WidevineDeviceCredentials;

  static DeviceCredentials = WidevineDeviceCredentials;

  constructor({ deviceCredentials }: { deviceCredentials: WidevineDeviceCredentials }) {
    this.sessions = new Map();
    this.deviceCredentials = deviceCredentials;
  }

  async getStatusForPolicy(): Promise<MediaKeyStatus> {
    return 'usable';
  }

  async setServerCertificate(): Promise<boolean> {
    return true;
  }

  createSession(sessionType?: MediaKeySessionType) {
    const session = new WidevineSession(sessionType, this.deviceCredentials, (sessionId) => {
      this.sessions.delete(sessionId);
    });
    this.sessions.set(session.sessionId, session);
    return session;
  }

  resumeSession(state: string) {
    const session = WidevineSession.resume(state, this.deviceCredentials, (sessionId) => {
      this.sessions.delete(sessionId);
    });
    this.sessions.set(session.sessionId, session);
    return session;
  }
}
