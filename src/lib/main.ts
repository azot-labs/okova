import { fromBase64, Logger, toBufferSource } from './utils';
import { MediaKeyMessageEventInit, MediaKeysEngine } from './api';

interface FetchDecryptionKeysParams {
  cdm: MediaKeysEngine;

  pssh: string;
  server: string;
  // Used only if an underlying engine emits `individualization-request` messages.
  individualizationServer?: string;
  headers?: Record<string, string>;

  fetch?: typeof fetch;
  transformRequest?: (request: Request) => Promise<Request>;
  transformResponse?: (response: Response) => Promise<Response>;

  logger?: Logger;
}

export class LicenseHttpError extends Error {
  readonly status: number;
  readonly endpoint: string;

  constructor(status: number, url: string) {
    const endpoint = new URL(url);
    endpoint.username = '';
    endpoint.password = '';
    endpoint.search = '';
    endpoint.hash = '';
    super(`License request failed with HTTP ${status} at ${endpoint.href}`);
    this.name = 'LicenseHttpError';
    this.status = status;
    this.endpoint = endpoint.href;
  }
}

const fetchDecryptionKeys = async (params: FetchDecryptionKeysParams) => {
  const { pssh, cdm, transformRequest, transformResponse } = params;
  const initDataType = 'cenc';
  const initData = fromBase64(pssh).toBuffer();

  const session = await cdm.createSession();
  const fetchImpl = params.fetch ?? globalThis.fetch;
  const sendRequest = async (server: string, body: Uint8Array) => {
    const headers = new Headers(params.headers);
    if (cdm.keySystem.startsWith('com.microsoft.playready') && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'text/xml; charset=utf-8');
    }
    const request = new Request(server, {
      body: toBufferSource(body),
      method: 'POST',
      headers,
    });

    const transformedRequest = (await transformRequest?.(request)) || request;
    const response = await fetchImpl(transformedRequest);
    const transformedResponse = (await transformResponse?.(response)) || response;
    if (!transformedResponse.ok) {
      throw new LicenseHttpError(transformedResponse.status, transformedRequest.url);
    }
    return new Uint8Array(await transformedResponse.arrayBuffer());
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
    // Observe key and flow failures before request generation can fail or emit messages.
    const requestGenerated = Promise.resolve().then(() =>
      session.generateRequest(initData, initDataType),
    );
    const [keys] = await Promise.all([Promise.race([keysReady, flowFailed]), requestGenerated]);
    return keys;
  } finally {
    session.removeEventListener('message', handleMessage);
    try {
      await session.close();
    } catch (error) {
      // Cleanup must not replace acquired keys or the original license-flow error.
      params.logger?.warn('Failed to close decryption session', error);
    }
  }
};

export { fetchDecryptionKeys };
export * from './utils';
export * from './api';
export * from './decrypt';
export * from './pssh';
export * from './widevine/engine';
export * from './widevine/device-credentials';
export * from './playready/engine';
export * from './playready/device-credentials';
export * from './remote/engine';
