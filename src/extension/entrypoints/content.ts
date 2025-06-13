import { appStorage } from '@/utils/storage';

const inject = async (script: string) => {
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
    inject('manifest.js');
    if (settings?.requestInterception) {
      console.log(`[orlan] Injecting request interception...`);
      inject('network.js');
    }
    if (settings?.emeInterception) {
      console.log(`[orlan] Injecting EME interception...`);
      inject('eme.js');
    }

    // Listen for event from injected script
    window.addEventListener(
      'message',
      (event) => {
        if (event.source != window) return;
        if (event.data.type !== 'drm-message') return;
        if (!event.data.log) return;
        const message = event.data.log;
        message.url = window.location.href;
        browser.runtime.sendMessage(message).then((response) => {
          window.dispatchEvent(
            new CustomEvent('drm-message-response', { detail: response }),
          );
        });
      },
      false,
    );
  },
});
