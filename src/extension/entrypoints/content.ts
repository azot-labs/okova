import { settingsStorage } from '@/utils/storage/settings';
import type { PublicPath } from 'wxt/browser';

const inject = (script: PublicPath) => {
  return new Promise<void>((resolve, reject) => {
    const element = document.createElement('script');
    element.type = 'text/javascript';
    element.src = browser.runtime.getURL(script);
    element.onload = function () {
      element.remove();
      resolve();
    };
    element.onerror = () => {
      element.remove();
      reject(new Error(`Failed to inject ${script}`));
    };
    (document.head || document.documentElement).appendChild(element);
  });
};

export default defineContentScript({
  matches: ['https://*/*'],
  runAt: 'document_start',
  allFrames: true,
  async main() {
    // Checking if interception enabled
    const settings = await settingsStorage.getValue();

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
                error: error instanceof Error ? error.message : String(error),
              }),
            }),
          );
        }
      },
      false,
    );
    try {
      await inject('/manifest.js');
      const scripts: Promise<void>[] = [];
      if (settings?.requestInterception) scripts.push(inject('/network.js'));
      if (settings?.emeInterception) {
        scripts.push(
          inject(settings.spoofing && settings.clientPlayback ? '/eme-playback.js' : '/eme.js'),
        );
      }
      await Promise.all(scripts);
    } catch (error) {
      console.warn('[okova] Script injection failed', error);
    }
  },
});
