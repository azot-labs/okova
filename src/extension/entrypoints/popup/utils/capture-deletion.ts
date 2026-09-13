import { browser } from 'wxt/browser';
import { getWebsiteDomain, keyRecordToken } from '@/utils/storage';
import { getCaptureDiagnosticsStorage } from '@/utils/session-diagnostics';
import { isManifestUrl } from '@/utils/manifest';
import { groupCaptureRecords, type CaptureGroup } from '@/utils/capture-groups';
import { getTabStreams } from './streams';
import { popupHistory } from './history';

export type CaptureDeletionScope =
  | { kind: 'all' }
  | { kind: 'site'; domain: string }
  | { kind: 'selected'; captures: CaptureGroup[] };

export const sameCapture = (left: CaptureGroup, right: CaptureGroup) =>
  left.id === right.id ||
  left.sessionIds.some((id) => right.sessionIds.includes(id)) ||
  (Boolean(left.manifestUrl) && left.url === right.url && left.manifestUrl === right.manifestUrl);

export const prepareCaptureDeletion = async (scope: CaptureDeletionScope) => {
  const window = await browser.windows.getCurrent();
  const tabs = (await browser.tabs.query({})).filter((tab) => tab.incognito === window.incognito);
  const [history, recent, domains] = await Promise.all([
    popupHistory.allKeys.getValue(),
    popupHistory.recentKeys.getValue(),
    popupHistory.recentKeysByDomain.getValue(),
  ]);
  const records = [
    ...new Map(
      [...(history ?? []), ...(recent ?? []), ...Object.values(domains ?? {}).flat()].map(
        (record) => [keyRecordToken(record), record],
      ),
    ).values(),
  ];
  const observations = await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id === undefined) return undefined;
      const tabId = tab.id;
      const diagnostics = (await getCaptureDiagnosticsStorage(tabId).getValue()) ?? [];
      const streams = isManifestUrl(tab.url)
        ? await getTabStreams(tabId).then(
            (result) => result.records,
            () => [],
          )
        : [];
      return { tabId, diagnostics, streams };
    }),
  );
  const available = observations.flatMap((item) => (item ? [item] : []));
  const groups = groupCaptureRecords(
    records,
    available.flatMap((item) => item.streams),
    available.flatMap((item) => item.diagnostics),
  );
  const captures = groups.filter((capture) => {
    switch (scope.kind) {
      case 'all':
        return true;
      case 'site':
        return getWebsiteDomain(capture.url) === scope.domain;
      case 'selected':
        return scope.captures.some((selected) => sameCapture(capture, selected));
    }
  });
  const selectedRecords = captures.flatMap((capture) =>
    capture.recordIndexes.flatMap((index) => (records[index] ? [records[index]] : [])),
  );
  const sessionIds = new Set(captures.flatMap((capture) => capture.sessionIds));
  const streamIds = new Set(
    captures.flatMap((capture) => (capture.stream ? [capture.stream.id] : [])),
  );
  return {
    captures,
    count: captures.length,
    tokens: selectedRecords.map(keyRecordToken),
    tabs: available
      .map((item) => ({
        tabId: item.tabId,
        diagnostics: item.diagnostics
          .filter((record) => sessionIds.has(record.captureId))
          .map((record) => record.captureId),
        streams: item.streams.filter((stream) => streamIds.has(stream.id)),
      }))
      .filter((item) => item.diagnostics.length || item.streams.length),
  };
};

export const deleteCaptureSnapshot = async (
  snapshot: Awaited<ReturnType<typeof prepareCaptureDeletion>>,
) => {
  // Freeze capture identities, not their member keys: late results for a selected
  // session still belong to the capture being deleted.
  const current = await prepareCaptureDeletion({ kind: 'selected', captures: snapshot.captures });
  for (const tab of current.tabs) {
    await navigator.locks.request(`okova:diagnostics:${tab.tabId}`, async () => {
      const storage = getCaptureDiagnosticsStorage(tab.tabId);
      const current = (await storage.getValue()) ?? [];
      await storage.setValue(
        current.filter((record) => !tab.diagnostics.includes(record.captureId)),
      );
    });
    for (const stream of tab.streams) {
      try {
        await browser.scripting.executeScript({
          target: stream.documentId
            ? { tabId: tab.tabId, documentIds: [stream.documentId] }
            : { tabId: tab.tabId, frameIds: [stream.frameId] },
          world: 'MAIN',
          func: (pageUrl: string, urls: string[]) => {
            if (location.href !== pageUrl) return;
            const cache = window.MANIFEST_LIST;
            if (!(cache instanceof Map)) return;
            for (const [key, value] of cache) {
              if (
                typeof value === 'object' &&
                value !== null &&
                'url' in value &&
                typeof value.url === 'string' &&
                urls.includes(value.url)
              )
                cache.delete(key);
            }
          },
          args: [
            stream.frameUrl,
            [stream.manifest, ...stream.playlists].flatMap((manifest) => [
              manifest.url,
              ...manifest.requestUrls,
            ]),
          ],
        });
      } catch (error) {
        // A closed tab or replaced document no longer contains this observation.
        const frames = await browser.webNavigation
          .getAllFrames({ tabId: tab.tabId })
          .catch(() => null);
        if (
          frames?.some((frame) =>
            stream.documentId
              ? frame.documentId === stream.documentId
              : frame.frameId === stream.frameId && frame.url === stream.frameUrl,
          )
        )
          throw error;
      }
    }
  }
  await popupHistory.deleteKeySnapshot([...new Set([...snapshot.tokens, ...current.tokens])]);
  await browser.storage.session.set({ 'capture-deletion-revision': crypto.randomUUID() });
};
