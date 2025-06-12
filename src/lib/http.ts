import { fromBase64, fromBuffer } from './utils';
import { Logger } from './widevine/session';

const defaultRequestFilter = (
  request: Uint8Array | string,
  template?: string,
) => {
  if (!template) return request;
  const challenge = ArrayBuffer.isView(request)
    ? fromBuffer(request).toBase64()
    : request;
  return template.replace('{{challenge}}', challenge);
};

const defaultResponseFilter = (response: Uint8Array, log: Logger = console) => {
  if (response[0] === /* '{' */ 0x7b) {
    let responseObject = null;
    try {
      responseObject = JSON.parse(fromBuffer(response).toText());
    } catch (e) {
      log.error(`Can't parse license response as JSON`);
      log.debug((e as unknown as Error).message);
      log.debug(`Base64 response data: ${fromBuffer(response).toBase64()}`);
    }
    if (!responseObject) return response;
    try {
      const LICENSE_PREFIX = 'CAIS';
      const license =
        LICENSE_PREFIX +
        fromBuffer(response)
          .toText()
          .split(`"${LICENSE_PREFIX}`)[1]
          .split('"')[0];
      return fromBase64(license).toBuffer();
    } catch (e) {
      log.error(`Can't recognize license response`);
      log.error(`Response: ${JSON.stringify(responseObject)}`);
    }
  }
  return response;
};

export { defaultRequestFilter, defaultResponseFilter };
