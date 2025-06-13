import { Cdm } from '../api';
import { WidevineClient } from './client';
import { Session } from './session';

export class Widevine implements Cdm {
  keySystem = 'com.widevine.alpha';
  sessions: Map<string, Session>;
  client: WidevineClient;

  static Client = WidevineClient;

  constructor({ client }: { client: WidevineClient }) {
    this.sessions = new Map();
    this.client = client;
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
    const licenseRequest = await session.generateRequest(
      initDataType ?? 'cenc',
      initData,
    );
    return licenseRequest!;
  }

  async updateSession(sessionId: string, response: Uint8Array) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    await session.update(response);
  }

  async closeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    await session.close();
    this.sessions.delete(sessionId);
  }

  async removeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    await session.remove();
    this.sessions.delete(sessionId);
  }

  getKeys(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    const keys = Array.from(session.keys.values());
    return keys.map((key) => ({ key: key.value, keyId: key.id }));
  }
}
