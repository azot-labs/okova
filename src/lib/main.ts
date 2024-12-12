import { Client } from './client';
import { Session, Logger } from './session';
import { defaultRequestFilter, defaultResponseFilter } from './http';
import { fromBase64 } from './utils';

interface FetchDecryptionKeysParams {
  client: Client;

  pssh: string;
  server: string;
  individualizationServer?: string;

  headers?: Record<string, string>;
  requestFilter?: (body: Uint8Array) => Uint8Array;
  responseFilter?: (data: Uint8Array) => Uint8Array;
  fetch?: typeof fetch;

  requestTemplate?: string;
  logger?: Logger;
}

const fetchDecryptionKeys = async (params: FetchDecryptionKeysParams) => {
  const { pssh, client } = params;
  const initDataType = 'cenc';
  const initData = fromBase64(pssh).toBuffer();

  const session = new Session('temporary', client);
  session.privacyMode = !!params.individualizationServer;
  if (params.logger) session.setLogger(params.logger);

  session.addEventListener(
    'message',
    async (event: Event) => {
      const type = (event as MediaKeyMessageEvent).messageType;
      const message = (event as MediaKeyMessageEvent)
        .message as unknown as Uint8Array;
      const isIndividualization = type === 'individualization-request';
      const url = isIndividualization
        ? params.individualizationServer || params.server
        : params.server;
      const { requestFilter, requestTemplate, responseFilter } = params;
      const body =
        requestFilter?.(message) ||
        defaultRequestFilter(message, requestTemplate);
      const response = await (params.fetch || fetch)(url, {
        method: 'POST',
        headers: params.headers,
        body: body,
      });
      const data = await response
        .arrayBuffer()
        .then((buffer) => new Uint8Array(buffer));
      const signedMessage =
        responseFilter?.(data) || defaultResponseFilter(data, params.logger);
      session.update(signedMessage);
    },
    false,
  );

  await new Promise((resolve) => {
    session.addEventListener('keystatuseschange', resolve, false);
    session.generateRequest(initDataType, initData);
  });

  const keys = Array.from(session.keys.values());
  return keys;
};

export { fetchDecryptionKeys };
export { Session };
export * from './connect';
export * from './utils';
export * from './client';
export * from './key';
