import { browser } from 'wxt/browser';
import { appStorage, defaultSettings, keyRecordToken, type KeyInfo } from './storage';
import { createRequestHeaderCache } from './request-headers';
import { getManifestMetadata } from './manifest';

export const installRequestHeaderObservation = () => {
  const cache = createRequestHeaderCache();
  let isEnabled = false;
  let revision = 0;
  appStorage.settings.watch((settings) => {
    revision++;
    isEnabled = (settings ?? defaultSettings).requestInterception;
    if (!isEnabled) cache.clear();
  });
  void appStorage.settings
    .getValue()
    .then((settings) => {
      if (revision === 0) isEnabled = (settings ?? defaultSettings).requestInterception;
    })
    .catch(() => {});
  browser.webRequest.onSendHeaders.addListener(
    (details) => {
      if (!isEnabled || details.tabId < 0 || details.method !== 'GET') return;
      scheduleExpiry();
      cache.observe(
        {
          requestId: details.requestId,
          tabId: details.tabId,
          frameId: details.frameId,
          url: details.url,
          headers: details.requestHeaders,
        },
        details.timeStamp,
      );
    },
    { urls: ['http://*/*', 'https://*/*'] },
    import.meta.env.FIREFOX ? ['requestHeaders'] : ['requestHeaders', 'extraHeaders'],
  );
  browser.webRequest.onBeforeRedirect.addListener(({ requestId }) => cache.redirect(requestId), {
    urls: ['http://*/*', 'https://*/*'],
  });
  browser.webRequest.onErrorOccurred.addListener(({ requestId }) => cache.fail(requestId), {
    urls: ['http://*/*', 'https://*/*'],
  });
  browser.tabs.onRemoved.addListener((tabId) => cache.clear(tabId));
  browser.webNavigation.onTabReplaced.addListener(({ replacedTabId }) =>
    cache.clear(replacedTabId),
  );
  browser.webNavigation.onCommitted.addListener(({ tabId, frameId }) =>
    cache.clear(tabId, frameId === 0 ? undefined : frameId),
  );
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  const scheduleExpiry = () => {
    if (expiryTimer !== undefined) return;
    expiryTimer = setTimeout(() => {
      expiryTimer = undefined;
      if (cache.expire()) scheduleExpiry();
    }, 60_000);
  };
  return {
    observePage: (value: unknown, tabId: number, frameId: number) => {
      if (isEnabled) cache.observePage(value, tabId, frameId);
    },
    capture: (keys: KeyInfo[], tabId: number, frameId: number, incognito: boolean) => {
      if (!isEnabled) return;
      for (const key of keys) {
        const metadata = getManifestMetadata(key);
        const urls = [
          ...new Set([
            ...(metadata.mpd ? [metadata.mpd] : []),
            ...(metadata.manifests ?? []).map((manifest) => manifest.url),
          ]),
        ];
        scheduleExpiry();
        cache.capture({ token: keyRecordToken(key), tabId, frameId, incognito }, urls);
      }
    },
    read: (token: string, url: string, incognito: boolean) =>
      isEnabled ? cache.read(token, url, incognito) : [],
  };
};
