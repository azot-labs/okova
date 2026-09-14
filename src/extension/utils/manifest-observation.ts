import { browser } from 'wxt/browser';
import type { CaptureSource } from './storage/capture-history';

// MAIN-world messages are page-controlled. Browser response metadata corroborates
// the URL and frame; a token exposed through postMessage would not authenticate them.
export const installManifestObservation = () => {
  const frames = new Map<string, { documentId?: string; urls: Set<string> }>();
  browser.webRequest.onHeadersReceived.addListener(
    (details) => {
      if (details.tabId < 0 || details.method !== 'GET') return;
      const type =
        details.responseHeaders?.find((header) => header.name.toLowerCase() === 'content-type')
          ?.value ?? '';
      if (
        !/xml|dash|octet-stream|mpegurl|vnd\.ms-sstr|text\/plain/i.test(type) &&
        !/\.(?:mpd|m3u8?|ismc)$|\.ism\/manifest(?:\([^/]*\))?$/i.test(new URL(details.url).pathname)
      )
        return;
      const key = `${details.tabId}:${details.frameId}`;
      const previous = frames.get(key);
      const frame = previous?.documentId === details.documentId ? previous : undefined;
      const entry = frame ?? { documentId: details.documentId, urls: new Set<string>() };
      if (entry.urls.size < 50) entry.urls.add(details.url);
      frames.set(key, entry);
      while (frames.size > 256) frames.delete(frames.keys().next().value!);
    },
    { urls: ['http://*/*', 'https://*/*'] },
    ['responseHeaders'],
  );
  browser.webNavigation.onCommitted.addListener(({ tabId, frameId }) => {
    for (const key of frames.keys())
      if (frameId === 0 ? key.startsWith(`${tabId}:`) : key === `${tabId}:${frameId}`)
        frames.delete(key);
  });
  browser.tabs.onRemoved.addListener((tabId) => {
    for (const key of frames.keys()) if (key.startsWith(`${tabId}:`)) frames.delete(key);
  });
  return (source: CaptureSource, url: string) => {
    const frame = frames.get(`${source.tabId}:${source.frameId ?? 0}`);
    return Boolean(
      frame && (!frame.documentId || frame.documentId === source.documentId) && frame.urls.has(url),
    );
  };
};
