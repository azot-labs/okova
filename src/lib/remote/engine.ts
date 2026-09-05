import type { MediaKeysMap } from '../api';
import { BaseMediaKeysEngine, BaseMediaKeysEngineSession } from '../api';
import { fromBase64, fromBuffer } from '../utils';
import { parseCertificate, verifyCertificate } from '../widevine/certificate';

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
  #getServerCertificate: () => string | undefined;

  constructor(
    sessionId: string,
    sessionType: MediaKeySessionType,
    http: ReturnType<typeof createHttpClient>,
    dispose: (sessionId: string) => void,
    getServerCertificate: () => string | undefined,
  ) {
    super(sessionType);
    this.sessionId = sessionId;
    this.#http = http;
    this.#dispose = dispose;
    this.#getServerCertificate = getServerCertificate;
  }

  async generateRequest(initData: Uint8Array, initDataType: string = 'cenc') {
    this.assertOpen();
    const serverCertificate = this.#getServerCertificate();
    const data = await this.#http.post(`/sessions/${this.sessionId}/generate-request`, {
      initDataType,
      serverCertificate,
      initData: fromBuffer(initData).toBase64(),
    });
    this.assertOpen();
    if (serverCertificate !== undefined && data?.serverCertificateAccepted !== true) {
      throw new Error(
        'Remote server did not acknowledge the server certificate; privacy mode may be unsupported',
      );
    }
    const message = fromBase64(data.message).toBuffer();
    this.emitMessage({
      message,
      messageType: data.messageType,
    });
  }

  async update(response: Uint8Array) {
    this.assertOpen();
    const data = await this.#http.post(`/sessions/${this.sessionId}/update`, {
      response: fromBuffer(response).toBase64(),
    });
    this.assertOpen();
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
    this.assertOpen();
    if (keys.size) {
      this.#syncKeys(keys);
      this.emitKeysChange();
      this.emitKeyStatusesChange();
    }
  }

  async close() {
    if (this.isClosed) return;
    await this.#http.post(`/sessions/${this.sessionId}/close`);
    if (this.isClosed) return;
    this.isClosed = true;
    this.keys.clear();
    this.keyStatuses.clear();
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('closed'));
  }

  async remove() {
    if (this.isClosed) return;
    await this.#http.delete(`/sessions/${this.sessionId}`);
    if (this.isClosed) return;
    this.isClosed = true;
    this.keys.clear();
    this.keyStatuses.clear();
    this.#dispose(this.sessionId);
    this.dispatchEvent(new Event('closed'));
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
  #serverCertificate?: string;

  constructor(params: RemoteParams) {
    super();
    this.keySystem = params.keySystem;
    this.#http = createHttpClient(params);
    this.#client = params.client;
    this.sessions = new Map();
  }

  async setServerCertificate(serverCertificate: Uint8Array): Promise<boolean> {
    if (this.keySystem !== 'com.widevine.alpha') {
      throw new Error(`Server certificates are unsupported for ${this.keySystem}`);
    }
    const certificate = new Uint8Array(serverCertificate);
    const { signedDrmCertificate } = await parseCertificate(certificate);
    if (!(await verifyCertificate(signedDrmCertificate))) {
      throw new Error('Certificate invalid: signature mismatch');
    }
    this.#serverCertificate = fromBuffer(certificate).toBase64();
    return true;
  }

  async createSession(sessionType: MediaKeySessionType = 'temporary') {
    const data = await this.#http.post(`/sessions`, {
      keySystem: this.keySystem,
      sessionType,
      client: this.#client,
    });
    const session = new RemoteSession(
      data.id,
      sessionType,
      this.#http,
      (sessionId) => this.sessions.delete(sessionId),
      () => this.#serverCertificate,
    );
    this.sessions.set(session.sessionId, session);
    return session;
  }
}
