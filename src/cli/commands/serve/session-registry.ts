import { z } from 'zod';
import type { Session } from '../../../lib/api';

const timeoutMs = z.number().int().positive().max(2_147_483_647);
export const sessionLimitsSchema = z.object({
  maxSessions: z.number().int().positive().default(64),
  maxConcurrentRequests: z.number().int().positive().default(64),
  idleTimeoutMs: timeoutMs.default(300_000),
  keyWaitTimeoutMs: timeoutMs.default(30_000),
});

type Entry = {
  session: Session;
  timer: ReturnType<typeof setTimeout>;
  handleClosed: () => void;
};

export class SessionRegistry {
  #entries = new Map<string, Entry>();
  #pendingSessions = 0;
  #activeRequests = 0;

  constructor(readonly getLimits: () => z.infer<typeof sessionLimitsSchema>) {}

  get size() {
    return this.#entries.size;
  }

  // Reserve before asynchronous device loading so simultaneous opens cannot exceed capacity.
  reserve() {
    if (this.size + this.#pendingSessions >= this.getLimits().maxSessions) return;
    this.#pendingSessions++;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.#pendingSessions--;
    };
  }

  beginRequest() {
    if (this.#activeRequests >= this.getLimits().maxConcurrentRequests) return;
    this.#activeRequests++;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.#activeRequests--;
    };
  }

  set(key: string, session: Session) {
    if (this.#entries.has(key)) throw new Error('Session already registered');
    if (this.size >= this.getLimits().maxSessions) throw new Error('Session capacity reached');
    const handleClosed = () => this.delete(key);
    const timer = setTimeout(() => {
      void this.#close(key).catch((error: unknown) => {
        console.error('Failed to close expired session', error);
      });
    }, this.getLimits().idleTimeoutMs);
    timer.unref();
    this.#entries.set(key, { session, timer, handleClosed });
    session.addEventListener('closed', handleClosed, { once: true });
  }

  get(key: string) {
    const entry = this.#entries.get(key);
    entry?.timer.refresh();
    return entry?.session;
  }

  has(key: string) {
    return this.#entries.has(key);
  }

  *values() {
    for (const entry of this.#entries.values()) yield entry.session;
  }

  delete(key: string) {
    const entry = this.#entries.get(key);
    if (!entry) return;
    clearTimeout(entry.timer);
    entry.session.removeEventListener('closed', entry.handleClosed);
    this.#entries.delete(key);
  }

  async #close(key: string) {
    const entry = this.#entries.get(key);
    if (!entry) return;
    try {
      await entry.session.close();
    } finally {
      this.delete(key);
    }
  }

  async clear() {
    await Promise.all([...this.#entries.keys()].map((key) => this.#close(key)));
  }
}
