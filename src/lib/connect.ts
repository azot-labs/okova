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

  const post = async (route: string, body: object) => {
    const response = await fetch(`${baseUrl}${route}`, {
      method: 'POST',
      headers,
      body: json(body),
    });
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') return;
    return response.json();
  };

  const get = async (route: string) => {
    const response = await fetch(`${baseUrl}${route}`, {
      method: 'GET',
      headers,
    });
    return response.json();
  };

  const createSession = async (client: string) => {
    const data = await post(`/session`, { client });
    const sessionId = data.id;

    const generateRequest = async (initData: string, initDataType: string) => {
      const data = await post(`/session/${sessionId}/generate-request`, {
        initDataType,
        initData,
      });
      return data.licenseRequest;
    };

    const update = async (response: string) =>
      post(`/session/${sessionId}/update`, { response });

    const keys = async () => get(`/session/${sessionId}/keys`);

    return { sessionId, generateRequest, update, keys };
  };

  return { createSession };
};
