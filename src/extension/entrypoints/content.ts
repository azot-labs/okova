import { parseDetectedManifest } from '@/utils/manifest';
import { pageRequestHeadersSchema } from '@/utils/request-headers';
import { drmErrorResponse } from '@/utils/drm-error';

export default defineContentScript({
  matches: ['https://*/*', 'http://*/*'],
  matchOriginAsFallback: true,
  matchAboutBlank: true,
  runAt: 'document_start',
  allFrames: true,
  main() {
    // Listen for event from injected script
    window.addEventListener(
      'message',
      async (event) => {
        if (event.source !== window) return;
        if (event.data?.namespace === 'okova:manifest-observed') {
          const manifest = parseDetectedManifest(event.data.manifest);
          if (manifest)
            void browser.runtime
              .sendMessage({ action: 'observed-manifest', manifest })
              .catch(() => {});
          return;
        }
        if (event.data?.namespace === 'okova:request-headers') {
          const parsed = pageRequestHeadersSchema.safeParse(event.data);
          if (parsed.success) {
            void browser.runtime
              .sendMessage({ action: 'observed-request-headers', ...parsed.data })
              .catch(() => {});
          }
          return;
        }
        if (event.data?.type === 'drm-startup') {
          const { action, token } = event.data;
          if (action !== 'load-eme') return;
          try {
            await browser.runtime.sendMessage({ action, token });
          } catch (error) {
            console.warn('[okova] Unable to initialize interception', error);
          }
          return;
        }
        if (event.data?.type !== 'drm-message') return;
        if (['startup-settings', 'load-eme'].includes(event.data.log?.action)) return;
        if (typeof event.data.requestId !== 'string') return;
        if (!event.data.log) return;
        const { requestId, log } = event.data;
        const message = { ...log, url: window.location.href };
        try {
          const body = await browser.runtime.sendMessage(message);
          // Firefox blocks page scripts from reading object detail created in a content script.
          window.dispatchEvent(
            new CustomEvent('drm-message-response', {
              detail: JSON.stringify({ requestId, body }),
            }),
          );
        } catch (error) {
          window.dispatchEvent(
            new CustomEvent('drm-message-response', {
              detail: JSON.stringify({
                requestId,
                ...drmErrorResponse(error, 'bridge', 'transport'),
              }),
            }),
          );
        }
      },
      false,
    );
  },
});
