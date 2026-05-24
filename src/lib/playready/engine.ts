import type {
  MediaKeysEngine,
  MediaKeysEngineSession,
} from '../api';
import { PlayReadyDeviceCredentials } from './device-credentials';
import { TooManySessions } from './exceptions';
import { RevocationInfoStore } from './revocation-info';
import { PlayReadySession } from './session';

export class PlayReady implements MediaKeysEngine {
  static MAX_NUM_OF_SESSIONS = 16;
  static SESSION_TIMEOUT_MS = 30_000;

  keySystem = 'com.microsoft.playready.recommendation';
  sessions: Map<string, MediaKeysEngineSession>;
  deviceCredentials: PlayReadyDeviceCredentials;
  revocationInfo: RevocationInfoStore;

  #openedAt: Map<string, number>;

  static DeviceCredentials = PlayReadyDeviceCredentials;

  constructor(options: { deviceCredentials: PlayReadyDeviceCredentials }) {
    this.sessions = new Map();
    this.deviceCredentials = options.deviceCredentials;
    this.revocationInfo = new RevocationInfoStore();
    this.#openedAt = new Map();
  }

  async getStatusForPolicy(): Promise<MediaKeyStatus> {
    return 'usable';
  }

  async setServerCertificate(): Promise<boolean> {
    return true;
  }

  #handleSessionDisposed = (sessionId: string) => {
    this.sessions.delete(sessionId);
    this.#openedAt.delete(sessionId);
  };

  #cleanupStaleSessions() {
    const now = Date.now();

    for (const [sessionId, openedAt] of this.#openedAt.entries()) {
      if (now - openedAt <= PlayReady.SESSION_TIMEOUT_MS) {
        continue;
      }

      const session = this.sessions.get(sessionId);
      this.sessions.delete(sessionId);
      this.#openedAt.delete(sessionId);
      void session?.close?.();
    }
  }

  #assertSessionCapacity() {
    this.#cleanupStaleSessions();

    if (this.sessions.size >= PlayReady.MAX_NUM_OF_SESSIONS) {
      throw new TooManySessions(`Too many Sessions open (${PlayReady.MAX_NUM_OF_SESSIONS}).`);
    }
  }

  #trackSession(session: MediaKeysEngineSession) {
    this.sessions.set(session.sessionId, session);
    this.#openedAt.set(session.sessionId, Date.now());
    return session;
  }

  createSession(sessionType?: MediaKeySessionType) {
    this.#assertSessionCapacity();

    const session = new PlayReadySession(sessionType, this.deviceCredentials, this.#handleSessionDisposed, {
      getRevocationListsXml: () => this.revocationInfo.buildRequestXml(),
      mergeRevocationInfo: (revInfoXml) => {
        this.revocationInfo.merge(revInfoXml);
      },
    });

    return this.#trackSession(session);
  }

  resumeSession(state: string) {
    this.#assertSessionCapacity();

    const session = PlayReadySession.resume(
      state,
      this.deviceCredentials,
      this.#handleSessionDisposed,
      {
        getRevocationListsXml: () => this.revocationInfo.buildRequestXml(),
        mergeRevocationInfo: (revInfoXml) => {
          this.revocationInfo.merge(revInfoXml);
        },
      },
    );

    return this.#trackSession(session);
  }
}
