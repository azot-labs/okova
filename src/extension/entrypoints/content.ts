import { defaultSettings, settingsStorage } from '@/utils/storage/settings';

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
        if (event.data?.type !== 'drm-message') return;
        if (typeof event.data.requestId !== 'string') return;
        if (!event.data.log) return;
        const { requestId, log } = event.data;
        const message = { ...log, url: window.location.href };
        try {
          const body =
            log.action === 'startup-settings'
              ? ((await settingsStorage.getValue()) ?? defaultSettings)
              : await browser.runtime.sendMessage(message);
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
                error: error instanceof Error ? error.message : String(error),
              }),
            }),
          );
        }
      },
      false,
    );
  },
});
