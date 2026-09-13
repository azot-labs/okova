import { browser } from 'wxt/browser';
import {
  frameStreamsSchema,
  groupStreamManifests,
  readFrameStreams,
  type StreamRecord,
} from '@/utils/streams';

export const getTabStreams = async (tabId: number) => {
  const frames = await browser.webNavigation.getAllFrames({ tabId });
  if (!frames) throw new Error('The page is no longer available.');
  const results = await Promise.allSettled(
    frames.slice(0, 50).map(({ frameId }) =>
      browser.scripting.executeScript({
        target: { tabId, frameIds: [frameId] },
        world: 'MAIN',
        func: readFrameStreams,
      }),
    ),
  );
  const records: StreamRecord[] = [];
  let unavailableFrames = 0;
  let limited = frames.length > 50;
  for (const result of results) {
    if (result.status === 'rejected') {
      unavailableFrames++;
      continue;
    }
    for (const injection of result.value) {
      const parsed = frameStreamsSchema.safeParse(injection.result);
      if (!parsed.success) {
        unavailableFrames++;
        continue;
      }
      limited ||= parsed.data.limited;
      for (const group of groupStreamManifests(parsed.data.manifests)) {
        records.push({
          ...group,
          id: JSON.stringify([
            tabId,
            injection.documentId ?? injection.frameId,
            group.manifest.url,
          ]),
          frameId: injection.frameId,
          documentId: injection.documentId,
          frameUrl: parsed.data.url,
        });
      }
    }
  }
  return { records, unavailableFrames, limited };
};
