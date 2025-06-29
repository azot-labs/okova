import { fromBase64, Logger } from './utils';
import { Cdm, requestMediaKeySystemAccess } from './api';

interface FetchDecryptionKeysParams {
  cdm: Cdm;

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

  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });
  const session = mediaKeys.createSession();
  session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const request = new Request(params.server, {
    body: licenseRequest,
    method: 'POST',
    headers: params.headers,
  });

  const response = await fetch((await transformRequest?.(request)) || request)
    .then((r) => transformResponse?.(r) || r)
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  session.update(response);
  const keys = await session.waitForKeyStatusesChange();
  return keys;
};

export { fetchDecryptionKeys };
export * from './utils';
export * from './api';
export * from './widevine/cdm';
export * from './widevine/client';
export * from './playready/cdm';
export * from './playready/client';
export * from './remote/cdm';
