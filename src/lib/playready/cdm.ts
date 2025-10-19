import type { Cdm } from '../api';
import { fromBuffer, fromText } from '../utils';
import { PlayReadyClient } from './client';
import { Pssh } from './pssh';
import { Session } from './session';

export class PlayReadyCdm implements Cdm {
  keySystem = 'com.microsoft.playready.recommendation';
  sessions: Map<string, Session>;
  client: PlayReadyClient;

  static Client = PlayReadyClient;

  constructor(options: { client: PlayReadyClient }) {
    this.sessions = new Map();
    this.client = options.client;
  }

  createSession(sessionType?: MediaKeySessionType) {
    const session = new Session(sessionType, this.client);
    this.sessions.set(session.sessionId, session);
    return session.sessionId;
  }

  async generateRequest(
    sessionId: string,
    initData: Uint8Array,
    initDataType?: string,
  ) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    const pssh = new Pssh(initData);
    const wrmHeader = pssh.wrmHeaders[0];
    const challenge = await session.getLicenseChallenge(wrmHeader);
    return fromText(challenge).toBuffer();
  }

  async updateSession(sessionId: string, response: Uint8Array) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    await session.parseLicense(fromBuffer(response).toText());
  }

  async closeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    this.sessions.delete(sessionId);
  }

  async getKeys(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    return session.keys.map((key) => ({
      key: fromBuffer(key.key).toHex(),
      keyId: fromBuffer(key.keyId).toHex(),
    }));
  }

  pauseSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    return session.toString();
  }

  resumeSession(state: string) {
    const session = Session.resume(state, this.client);
    this.sessions.set(session.sessionId, session);
    return { sessionId: session.sessionId, sessionType: session.sessionType };
  }
}
