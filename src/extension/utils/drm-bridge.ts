type DrmResponse = {
  requestId: string;
  body?: unknown;
  error?: string;
};

export const sendDrmMessage = (data: Record<string, unknown>): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const cleanup = () => {
      window.removeEventListener('drm-message-response', onResponse);
      clearTimeout(timer);
    };
    const onResponse = (event: Event) => {
      const detail = (event as CustomEvent<DrmResponse | null>).detail;
      if (!detail || detail.requestId !== requestId) return;

      cleanup();
      if (typeof detail.error === 'string') {
        reject(new Error(detail.error));
      } else {
        resolve(detail.body);
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for DRM response to "${data.action}" (${requestId})`));
    }, 30_000);

    window.addEventListener('drm-message-response', onResponse);
    try {
      window.postMessage({ type: 'drm-message', requestId, log: data }, '*');
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
};
