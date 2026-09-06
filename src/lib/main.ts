import { fromBase64, Logger, toBufferSource } from './utils';
import { withAbort } from './abort';
import { MediaKeyMessageEventInit, MediaKeysEngine, type MediaKeysEngineSession } from './api';

interface FetchDecryptionKeysParams {
  cdm: MediaKeysEngine;

  pssh: string;
  server: string;
  // Used only if an underlying engine emits `individualization-request` messages.
  individualizationServer?: string;
  headers?: Record<string, string>;

  /** Overall acquisition deadline in milliseconds. Default: 30,000. */
  timeoutMs?: number;
  signal?: AbortSignal;
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

export class NoContentKeysError extends Error {
  constructor() {
    super('License completed without content keys');
    this.name = 'NoContentKeysError';
  }
}

const fetchDecryptionKeys = async (params: FetchDecryptionKeysParams) => {
  const timeoutMs = params.timeoutMs ?? 30_000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647) {
    throw new RangeError('timeoutMs must be a positive integer no greater than 2147483647');
  }
  params.signal?.throwIfAborted();
  const controller = new AbortController();
  const signal = params.signal
    ? AbortSignal.any([params.signal, controller.signal])
    : controller.signal;
  const timer = setTimeout(() => {
    controller.abort(
      new DOMException(`Acquisition timed out after ${timeoutMs}ms`, 'TimeoutError'),
    );
  }, timeoutMs);
  const { cdm, transformRequest, transformResponse } = params;
  const state: { session: MediaKeysEngineSession | null } = { session: null };
  let isStopped = false;
  let messageCount = 0;
  const failed = Promise.withResolvers<never>();
  let messageChain = Promise.resolve();

  // Cleanup gets a bounded grace period even after the acquisition was cancelled.
  const closeSession = async (opened: MediaKeysEngineSession) => {
    const cleanup = new AbortController();
    const cleanupTimer = setTimeout(
      () => cleanup.abort(new Error('Session cleanup timed out')),
      1000,
    );
    try {
      await withAbort(opened.close(), cleanup.signal);
    } catch (error) {
      params.logger?.warn('Failed to close decryption session', error);
    } finally {
      clearTimeout(cleanupTimer);
    }
  };
  const handleMessage = (event: Event) => {
    if (isStopped || !state.session) return;
    const opened = state.session;
    const detail = (event as CustomEvent<MediaKeyMessageEventInit>).detail;
    messageCount++;
    messageChain = messageChain
      .then(async () => {
        signal.throwIfAborted();
        const server =
          detail.messageType === 'individualization-request'
            ? params.individualizationServer
            : params.server;
        if (!server) throw new Error(`Server URL is required for ${detail.messageType}`);
        const headers = new Headers(params.headers);
        if (cdm.keySystem.startsWith('com.microsoft.playready') && !headers.has('Content-Type')) {
          headers.set('Content-Type', 'text/xml; charset=utf-8');
        }
        const request = new Request(server, {
          body: toBufferSource(detail.message),
          method: 'POST',
          headers,
          signal,
        });
        const transformed = (await transformRequest?.(request)) || request;
        signal.throwIfAborted();
        // A transform may return a fresh Request; retain both cancellation signals.
        const outgoing = new Request(transformed, {
          signal: AbortSignal.any([signal, transformed.signal]),
        });
        const response = await (params.fetch ?? globalThis.fetch)(outgoing);
        signal.throwIfAborted();
        const incoming = (await transformResponse?.(response)) || response;
        signal.throwIfAborted();
        if (!incoming.ok) throw new LicenseHttpError(incoming.status, outgoing.url);
        const body = new Uint8Array(await incoming.arrayBuffer());
        signal.throwIfAborted();
        const previousMessageCount = messageCount;
        await opened.update(body);
        signal.throwIfAborted();
        if (!opened.keys.size && messageCount === previousMessageCount) {
          throw new NoContentKeysError();
        }
      })
      .catch((error: unknown) => {
        isStopped = true;
        failed.reject(error);
        controller.abort(error);
      });
  };

  const acquire = async () => {
    const opened = await cdm.createSession();
    if (signal.aborted) {
      void closeSession(opened);
      signal.throwIfAborted();
    }
    state.session = opened;
    opened.addEventListener('message', handleMessage);
    const keysReady = opened.waitForKeys({ signal });
    const generated = Promise.resolve().then(() => {
      signal.throwIfAborted();
      return opened.generateRequest(fromBase64(params.pssh).toBuffer(), 'cenc');
    });
    const [keys] = await Promise.all([keysReady, generated]);
    await messageChain;
    return keys;
  };

  try {
    return await withAbort(Promise.race([acquire(), failed.promise]), signal);
  } finally {
    isStopped = true;
    clearTimeout(timer);
    controller.abort();
    if (state.session) {
      state.session.removeEventListener('message', handleMessage);
      await closeSession(state.session);
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

export { parseRemoteConfig, type RemoteConfig } from './remote/config';
