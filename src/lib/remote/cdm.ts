import { Cdm } from '../api';
import { fromBase64, fromBuffer } from '../utils';

type RemoteParams = {
  baseUrl: string;
  secret: string;
  client?: string;
};

const createHttpClient = ({ baseUrl, secret }: RemoteParams) => {
  const headers = {
    'x-secret-key': secret,
    'content-type': 'application/json',
  };

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

  constructor({ secret, baseUrl, client }: RemoteParams) {
    this.#http = createHttpClient({ secret, baseUrl });
    this.#client = client;
  }

  async createSession(sessionType?: MediaKeySessionType) {
    const data = await this.#http.post(`/session`, {
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
      `/session/${sessionId}/generate-request`,
      {
        initDataType,
        initData: fromBuffer(initData).toBase64(),
      },
    );
    return fromBase64(data.licenseRequest).toBuffer();
  }

  async updateSession(sessionId: string, response: Uint8Array) {
    await this.#http.post(`/session/${sessionId}/update`, {
      response: fromBuffer(response).toBase64(),
    });
  }

  async closeSession(sessionId: string) {
    await this.#http.post(`/session/${sessionId}/close`);
  }

  async removeSession(sessionId: string) {
    await this.#http.delete(`/session/${sessionId}`);
  }

  async getKeys(sessionId: string) {
    const data = await this.#http.get(`/session/${sessionId}/keys`);
    return data.keys;
  }
}
