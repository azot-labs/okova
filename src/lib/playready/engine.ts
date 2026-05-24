import type {
  MediaKeysEngine,
  MediaKeysEngineSession,
} from '../api';
import { PlayReadyDeviceCredentials } from './device-credentials';
import { PlayReadySession } from './session';

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
    const session = new PlayReadySession(sessionType, this.deviceCredentials, (sessionId) => {
      this.sessions.delete(sessionId);
    });
    this.sessions.set(session.sessionId, session);
    return session;
  }

  resumeSession(state: string) {
    const session = PlayReadySession.resume(state, this.deviceCredentials, (sessionId) => {
      this.sessions.delete(sessionId);
    });
    this.sessions.set(session.sessionId, session);
    return session;
  }
}
