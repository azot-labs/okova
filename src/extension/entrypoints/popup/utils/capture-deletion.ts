import { browser } from 'wxt/browser';
import { getWebsiteDomain } from '@/utils/storage';
import { storedCaptureGroups, type CaptureGroup } from '@/utils/capture-groups';
import { popupHistory } from './history';

export type CaptureDeletionScope =
  | { kind: 'all' }
  | { kind: 'site'; domain: string }
  | { kind: 'selected'; captures: CaptureGroup[] };

export const sameCapture = (left: CaptureGroup, right: CaptureGroup) => left.id === right.id;

export const prepareCaptureDeletion = async (scope: CaptureDeletionScope) => {
  const captures = (await popupHistory.captures.getValue()).filter((capture) => {
    if (scope.kind === 'all') return true;
    if (scope.kind === 'site') return getWebsiteDomain(capture.source.url) === scope.domain;
    return scope.captures.some(
      (selected) => selected.id === capture.id || capture.aliases.includes(selected.id),
    );
  });
  return { captures, count: captures.length };
};

export const deleteCaptureSnapshot = async (
  snapshot: Awaited<ReturnType<typeof prepareCaptureDeletion>>,
) => {
  // Re-read members at confirmation. Stable IDs keep new sessions in the selected capture,
  // while genuinely new captures remain outside the deletion.
  const current = await prepareCaptureDeletion({
    kind: 'selected',
    captures: storedCaptureGroups(snapshot.captures),
  });
  await popupHistory.deleteCaptures(snapshot.captures.map((capture) => capture.id));
  for (const capture of current.captures) {
    const { tabId, frameId, documentId } = capture.source;
    if (tabId === undefined || !capture.manifest) continue;
    const urls = [capture.manifest, ...capture.playlists].flatMap((manifest) => [
      manifest.url,
      ...(manifest.requestUrls ?? []),
    ]);
    await browser.scripting
      .executeScript({
        target: documentId
          ? { tabId, documentIds: [documentId] }
          : { tabId, frameIds: [frameId ?? 0] },
        world: 'MAIN',
        func: (pageUrl: string, urls: string[]) => {
          if (location.href !== pageUrl) return;
          if (window.MANIFEST_LIST instanceof Map)
            for (const [key, value] of window.MANIFEST_LIST) {
              if (
                typeof value === 'object' &&
                value !== null &&
                'url' in value &&
                typeof value.url === 'string' &&
                urls.includes(value.url)
              )
                window.MANIFEST_LIST.delete(key);
            }
          if (window.MPD_LIST instanceof Map)
            for (const [key, url] of window.MPD_LIST) {
              if (urls.includes(url)) window.MPD_LIST.delete(key);
            }
        },
        args: [capture.source.url, urls],
      })
      .catch(() => {});
  }
};
