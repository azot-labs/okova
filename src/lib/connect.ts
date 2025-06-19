import { fromBase64, fromBuffer } from './utils';

type ConnectParams = {
  baseUrl: string;
  secret: string;
};

export const connect = ({ baseUrl, secret }: ConnectParams) => {
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

  const createSession = async (
    sessionType: MediaKeySessionType,
    client: string,
  ) => {
    const data = await http.post(`/session`, { client });
    const sessionId = data.id;

    const generateRequest = async (
      initDataType: string,
      initData: Uint8Array,
    ) => {
      const data = await http.post(`/session/${sessionId}/generate-request`, {
        initDataType,
        initData: fromBuffer(initData).toBase64(),
      });
      return fromBase64(data.licenseRequest).toBuffer();
    };

    const update = async (response: Uint8Array) => {
      await http.post(`/session/${sessionId}/update`, {
        response: fromBuffer(response).toBase64(),
      });
    };

    const getKeys = async () => http.get(`/session/${sessionId}/keys`);

    const close = async () => http.post(`/session/${sessionId}/close`);

    const remove = async () => http.delete(`/session/${sessionId}`);

    return { sessionId, generateRequest, update, getKeys, close, remove };
  };

  return { createSession };
};
