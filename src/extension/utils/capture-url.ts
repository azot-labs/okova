import type { Browser } from 'wxt/browser';

// Opaque frames inherit their site; their literal URLs cannot index recent keys.
export const getCaptureUrl = (sender: Browser.runtime.MessageSender) => {
  for (const candidate of [sender.url, sender.origin, sender.tab?.url]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
      if (url.protocol === 'blob:' && url.origin !== 'null') return new URL(url.origin).href;
    } catch {
      // Try the browser-provided origin or enclosing tab next.
    }
  }
  return undefined;
};
