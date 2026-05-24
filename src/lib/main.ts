import { fromBase64, Logger, toBufferSource } from './utils';
import { MediaKeyMessageEventInit, MediaKeysEngine } from './api';

interface FetchDecryptionKeysParams {
  cdm: MediaKeysEngine;

  pssh: string;
  server: string;
  individualizationServer?: string;
  headers?: Record<string, string>;

  fetch?: typeof fetch;
  transformRequest?: (request: Request) => Promise<Request>;
  transformResponse?: (response: Response) => Promise<Response>;

  logger?: Logger;
}

const fetchDecryptionKeys = async (params: FetchDecryptionKeysParams) => {
  const { pssh, cdm, transformRequest, transformResponse } = params;
  const initDataType = 'cenc';
  const initData = fromBase64(pssh).toBuffer();

  const session = await cdm.createSession();
  const fetchImpl = params.fetch ?? globalThis.fetch;
  const sendRequest = async (server: string, body: Uint8Array) => {
    const request = new Request(server, {
      body: toBufferSource(body),
      method: 'POST',
      headers: params.headers,
    });

    return fetchImpl((await transformRequest?.(request)) || request)
      .then((r) => transformResponse?.(r) || r)
      .then((r) => r.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer));
  };

  let rejectFlow: ((error: unknown) => void) | null = null;
  const flowFailed = new Promise<never>((_, reject) => {
    rejectFlow = reject;
  });
  let messageChain = Promise.resolve();
  let flowStopped = false;
  const handleMessage = (event: Event) => {
    const detail = (event as CustomEvent<MediaKeyMessageEventInit>).detail;
    messageChain = messageChain
      .then(async () => {
        if (flowStopped) return;
        const server =
          detail.messageType === 'individualization-request'
            ? params.individualizationServer
            : params.server;
        if (!server) {
          throw new Error(`Server URL is required for ${detail.messageType}`);
        }

        const response = await sendRequest(server, detail.message);
        await session.update(response);
      })
      .catch((error) => {
        flowStopped = true;
        rejectFlow?.(error);
      });
  };

  session.addEventListener('message', handleMessage);
  try {
    const keysReady = session.waitForKeys();
    await session.generateRequest(initData, initDataType);
    return await Promise.race([keysReady, flowFailed]);
  } finally {
    session.removeEventListener('message', handleMessage);
  }
};

export { fetchDecryptionKeys };
export * from './utils';
export * from './api';
export * from './widevine/engine';
export * from './widevine/device-credentials';
export * from './playready/engine';
export * from './playready/device-credentials';
export * from './remote/engine';
