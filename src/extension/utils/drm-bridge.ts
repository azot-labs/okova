import { drmErrorSchema, DrmRequestError } from './drm-error';

export const sendDrmMessage = (
  data: Record<string, unknown>,
  timeoutMs = 30_000,
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    // getRandomValues also works on HTTP pages where randomUUID is unavailable.
    const requestId = crypto.getRandomValues(new Uint32Array(4)).join('-');
    const cleanup = () => {
      window.removeEventListener('drm-message-response', onResponse);
      clearTimeout(timer);
    };
    const onResponse = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (typeof detail !== 'string') return;

      let response: unknown;
      try {
        response = JSON.parse(detail);
      } catch {
        return;
      }
      if (
        typeof response !== 'object' ||
        response === null ||
        !('requestId' in response) ||
        response.requestId !== requestId
      )
        return;

      cleanup();
      const body = 'body' in response ? response.body : undefined;
      const failure = drmErrorSchema.safeParse(
        'error' in response
          ? response.error
          : typeof body === 'object' && body !== null && 'error' in body
            ? body.error
            : undefined,
      );
      if (failure.success) {
        reject(new DrmRequestError(failure.data));
      } else if ('error' in response && typeof response.error === 'string') {
        reject(new Error(response.error));
      } else {
        resolve(body);
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new DrmRequestError({
          kind: 'timeout',
          stage: 'bridge',
          message: `Timed out waiting for DRM response to "${data.action}" (${requestId})`,
        }),
      );
    }, timeoutMs);

    window.addEventListener('drm-message-response', onResponse);
    try {
      window.postMessage({ type: 'drm-message', requestId, log: data }, '*');
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
};
