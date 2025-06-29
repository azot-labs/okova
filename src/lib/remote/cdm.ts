import { Cdm } from '../api';
import { fromBase64, fromBuffer } from '../utils';

type RemoteParams = {
  keySystem: string;
  baseUrl: string;
  secret?: string;
  client?: string;
};

const createHttpClient = ({ baseUrl, secret }: RemoteParams) => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (secret) headers['x-secret-key'] = secret;

  const json = (data: any) => JSON.stringify(data);

  const http = {
    post: async (route: string, body?: object) => {
      const response = await fetch(`${baseUrl}${route}`, {
        method: 'POST',
        headers,
        ...(body ? { body: json(body) } : {}),
      });
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') return;
      return response.json();
    },
    get: async (route: string) => {
      const response = await fetch(`${baseUrl}${route}`, {
        method: 'GET',
        headers,
      });
      return response.json();
    },
    delete: async (route: string) => {
      await fetch(`${baseUrl}${route}`, { method: 'DELETE', headers });
    },
  };

  return http;
};

export class RemoteCdm implements Cdm {
  keySystem = 'remote';

  #http: ReturnType<typeof createHttpClient>;
  #client?: string;

  constructor(params: RemoteParams) {
    this.keySystem = params.keySystem;
    this.#http = createHttpClient(params);
    this.#client = params.client;
  }

  async createSession(sessionType?: MediaKeySessionType) {
    const data = await this.#http.post(`/sessions`, {
      sessionType,
      client: this.#client,
    });
    return data.id;
  }

  async generateRequest(
    sessionId: string,
    initData: Uint8Array,
    initDataType?: string,
  ) {
    const data = await this.#http.post(
      `/sessions/${sessionId}/generate-request`,
      {
        initDataType,
        initData: fromBuffer(initData).toBase64(),
      },
    );
    return fromBase64(data.licenseRequest).toBuffer();
  }

  async updateSession(sessionId: string, response: Uint8Array) {
    await this.#http.post(`/sessions/${sessionId}/update`, {
      response: fromBuffer(response).toBase64(),
    });
  }

  async closeSession(sessionId: string) {
    await this.#http.post(`/sessions/${sessionId}/close`);
  }

  async removeSession(sessionId: string) {
    await this.#http.delete(`/sessions/${sessionId}`);
  }

  async getKeys(sessionId: string) {
    const data = await this.#http.get(`/sessions/${sessionId}/keys`);
    return data.keys;
  }
}
