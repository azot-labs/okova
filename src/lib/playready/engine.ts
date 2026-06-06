import type { MediaKeysEngineSession } from '../api';
import { BaseMediaKeysEngine } from '../api';
import { PlayReadyDeviceCredentials } from './device-credentials';
import { TooManySessions } from './exceptions';
import { RevocationInfoStore } from './revocation-info';
import { PlayReadySession } from './session';

export class PlayReady extends BaseMediaKeysEngine {
  static MAX_NUM_OF_SESSIONS = 16;

  keySystem = 'com.microsoft.playready.recommendation';
  sessions: Map<string, MediaKeysEngineSession>;
  deviceCredentials: PlayReadyDeviceCredentials;
  revocationInfo: RevocationInfoStore;

  static DeviceCredentials = PlayReadyDeviceCredentials;

  constructor(options: { deviceCredentials: PlayReadyDeviceCredentials }) {
    super();
    this.sessions = new Map();
    this.deviceCredentials = options.deviceCredentials;
    this.revocationInfo = new RevocationInfoStore();
  }

  async setServerCertificate(): Promise<boolean> {
    return true;
  }

  #handleSessionDisposed = (sessionId: string) => {
    this.sessions.delete(sessionId);
  };

  #assertSessionCapacity() {
    if (this.sessions.size >= PlayReady.MAX_NUM_OF_SESSIONS) {
      throw new TooManySessions(`Too many Sessions open (${PlayReady.MAX_NUM_OF_SESSIONS}).`);
    }
  }

  #trackSession(session: MediaKeysEngineSession) {
    this.sessions.set(session.sessionId, session);
    return session;
  }

  createSession(sessionType?: MediaKeySessionType) {
    this.#assertSessionCapacity();

    const session = new PlayReadySession(
      sessionType,
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
