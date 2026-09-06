import { CLIENT_KEY_SYSTEMS } from '@okova/lib/key-system';
import { appStorage } from '@/utils/storage';
import type { PublicPath } from 'wxt/browser';

const getActiveClientKeySystem = async () => {
  const client = await appStorage.clients.active.raw.getValue();
  if (!client) return null;
  if (typeof client === 'string' || client.type === 'wvd') return CLIENT_KEY_SYSTEMS.widevine;
  return CLIENT_KEY_SYSTEMS.playready;
};

const inject = async (script: PublicPath) => {
  return new Promise((resolve) => {
    const element = document.createElement('script');
    element.type = 'text/javascript';
    element.src = browser.runtime.getURL(script);
    element.onload = function () {
      element.remove();
      resolve(true);
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
    const settings = await appStorage.settings.getValue();

    // Injecting scripts into current page
    inject('/manifest.js');
    if (settings?.requestInterception) {
      console.log(`[okova] Injecting request interception...`);
      inject('/network.js');
    }
    if (settings?.emeInterception) {
      console.log(`[okova] Injecting EME interception...`);
      inject(settings.spoofing && settings.clientPlayback ? '/eme-playback.js' : '/eme.js');
    }

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
            log.action === 'playback-config'
              ? await getActiveClientKeySystem()
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
