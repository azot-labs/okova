import { Cdm } from '../api';
import { fromBase64, fromBuffer } from '../utils';

type RemoteParams = {
  keySystem: string;
  baseUrl: string;
  secret?: string;
  client?: string;
  headers?: Record<string, string>;
};

const createHttpClient = ({ baseUrl, secret, ...params }: RemoteParams) => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(params.headers || {}),
  };
  if (secret) headers['x-secret-key'] = secret;

  const json = (data: any) => JSON.stringify(data);

  const handleError = (data: any, response: Response) => {
    if (data.error) {
      const error =
        typeof data.error === 'string'
          ? data.error
          : JSON.stringify(data.error);
      throw new Error(error, { cause: response });
    }
  };

  const http = {
    post: async (route: string, body?: object) => {
      const response = await fetch(`${baseUrl}${route}`, {
        method: 'POST',
        headers,
        ...(body ? { body: json(body) } : {}),
      });
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') return;
      const data = await response.json();
      handleError(data, response);
      return data;
    },
    get: async (route: string) => {
      const response = await fetch(`${baseUrl}${route}`, {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      handleError(data, response);
      return data;
    },
    delete: async (route: string) => {
      const response = await fetch(`${baseUrl}${route}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      handleError(data, response);
      return data;
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
      keySystem: this.keySystem,
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
    const keys = await this.#http.get(`/sessions/${sessionId}/keys`);
    return keys;
  }
}
