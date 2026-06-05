import type { MediaKeysMap } from '../api';
import { BaseMediaKeysEngine, BaseMediaKeysEngineSession } from '../api';
import { fromBase64, fromBuffer } from '../utils';

type RemoteParams = {
  keySystem: string;
  baseUrl: string;
  secret?: string;
  client?: string;
  headers?: Record<string, string>;
  requestTimeoutMs?: number;
};

const createHttpClient = ({ baseUrl, secret, ...params }: RemoteParams) => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(params.headers || {}),
  };
  if (secret) headers['x-secret-key'] = secret;

  const requestTimeoutMs = params.requestTimeoutMs ?? 30_000;
  const json = (data: any) => JSON.stringify(data);

  const handleError = (data: any, response: Response) => {
    if (data.error) {
      const error = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      throw new Error(error, { cause: response });
    }
  };

  const readJsonBody = async (response: Response) => {
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) return;

    const text = await response.text();
    if (!text.trim()) return;
    return JSON.parse(text);
  };

  const throwForStatus = async (response: Response) => {
    const text = await response.text();
    let details = text.trim();
    if (details) {
      try {
        const data = JSON.parse(details);
        details =
          typeof data?.error === 'string'
            ? data.error
            : typeof data === 'string'
              ? data
              : JSON.stringify(data);
      } catch {}
    }

    const message = details
      ? `${response.status} ${response.statusText}: ${details}`
      : `${response.status} ${response.statusText}`;
    throw new Error(message, { cause: response });
  };

  const request = async (route: string, init: RequestInit) => {
    const signal = AbortSignal.timeout(requestTimeoutMs);

    try {
      return await fetch(`${baseUrl}${route}`, {
        ...init,
        signal,
      });
    } catch (error) {
      if (signal.aborted) {
        throw new Error(`Remote CDM request timed out after ${requestTimeoutMs}ms`, {
          cause: error,
        });
      }
      throw error;
    }
  };

  const http = {
    post: async (route: string, body?: object) => {
      const response = await request(route, {
        method: 'POST',
        headers,
        ...(body ? { body: json(body) } : {}),
      });
      if (!response.ok) await throwForStatus(response);
      const data = await readJsonBody(response);
      if (data === undefined) return;
      handleError(data, response);
      return data;
    },
    get: async (route: string) => {
      const response = await request(route, {
        method: 'GET',
        headers,
      });
      if (!response.ok) await throwForStatus(response);
      const data = await readJsonBody(response);
      if (data === undefined) return;
      handleError(data, response);
      return data;
    },
    delete: async (route: string) => {
      const response = await request(route, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) await throwForStatus(response);
      const data = await readJsonBody(response);
      if (data === undefined) return;
      handleError(data, response);
      return data;
    },
  };

  return http;
};

class RemoteSession extends BaseMediaKeysEngineSession {
  #http: ReturnType<typeof createHttpClient>;
  #dispose: (sessionId: string) => void;
  #closed: boolean;

  constructor(
    sessionId: string,
    sessionType: MediaKeySessionType,
    http: ReturnType<typeof createHttpClient>,
    dispose: (sessionId: string) => void,
  ) {
    super(sessionType);
    this.sessionId = sessionId;
    this.#http = http;
    this.#dispose = dispose;
    this.#closed = false;
  }

  async generateRequest(initData: Uint8Array, initDataType: string = 'cenc') {
    if (this.#closed) throw new Error('session closed');
    const data = await this.#http.post(`/sessions/${this.sessionId}/generate-request`, {
      initDataType,
      initData: fromBuffer(initData).toBase64(),
    });
    const message = fromBase64(data.message).toBuffer();
    this.emitMessage({
      message,
      messageType: data.messageType,
    });
  }

  async update(response: Uint8Array) {
    if (this.#closed) throw new Error('session closed');
    const data = await this.#http.post(`/sessions/${this.sessionId}/update`, {
      response: fromBuffer(response).toBase64(),
    });
    if (data?.message) {
      this.emitMessage({
        message: fromBase64(data.message).toBuffer(),
        messageType: data.messageType,
      });
      return;
    }

    if (data?.keys) {
      this.#syncKeys(new Map(Object.entries(data.keys as Record<string, string>)));
      this.emitKeysChange();
      this.emitKeyStatusesChange();
      return;
    }

    const keys = await this.#getKeys();
    if (keys.size) {
      this.#syncKeys(keys);
      this.emitKeysChange();
      this.emitKeyStatusesChange();
    }
  }

  async close() {
    this.#closed = true;
    await this.#http.post(`/sessions/${this.sessionId}/close`);
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('closed'));
  }

  async remove() {
    this.#closed = true;
    await this.#http.delete(`/sessions/${this.sessionId}`);
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('removed'));
  }

  async #getKeys() {
    const keys = await this.#http.get(`/sessions/${this.sessionId}/keys`);
    return new Map(Object.entries(keys as Record<string, string>));
  }

  #syncKeys(keys: MediaKeysMap) {
    this.keys.clear();
    this.keyStatuses.clear();

    for (const [keyId, key] of keys) {
      this.keys.set(keyId, key);
      this.keyStatuses.set(keyId, 'usable');
    }
  }
}

export class Remote extends BaseMediaKeysEngine {
  keySystem = 'remote';
  sessions: Map<string, RemoteSession>;

  #http: ReturnType<typeof createHttpClient>;
  #client?: string;

  constructor(params: RemoteParams) {
    super();
    this.keySystem = params.keySystem;
    this.#http = createHttpClient(params);
    this.#client = params.client;
    this.sessions = new Map();
  }

  async setServerCertificate(): Promise<boolean> {
    return true;
  }

  async createSession(sessionType: MediaKeySessionType = 'temporary') {
    const data = await this.#http.post(`/sessions`, {
      keySystem: this.keySystem,
      sessionType,
      client: this.#client,
    });
    const session = new RemoteSession(data.id, sessionType, this.#http, (sessionId) => {
      this.sessions.delete(sessionId);
    });
    this.sessions.set(session.sessionId, session);
    return session;
  }
}
