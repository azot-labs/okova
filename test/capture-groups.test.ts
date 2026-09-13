import type { CaptureDiagnostic } from '../src/extension/utils/session-diagnostics';
import { groupCaptureSessions } from '../src/extension/entrypoints/popup/utils/capture-sessions';
import { expect, test } from 'vitest';
import { groupCaptureRecords } from '../src/extension/utils/capture-groups';
import type { StreamRecord } from '../src/extension/utils/streams';

const page = 'https://example.test/watch';
const manifestUrl = 'https://example.test/master.m3u8?signature=exact';
const record = (id: string, captureId: string | undefined, mpd?: string) => ({
  id,
  captureId,
  mpd,
  url: page,
  createdAt: 100,
});
const stream: StreamRecord = {
  id: 'document-one:master',
  frameId: 0,
  frameUrl: page,
  manifest: {
    url: manifestUrl,
    kind: 'hls-master',
    children: ['https://example.test/child.m3u8'],
    requestUrls: [],
  },
  playlists: [
    { url: 'https://example.test/child.m3u8', kind: 'hls-media', children: [], requestUrls: [] },
  ],
};

test('groups stored metadata by manifest, keeping unresolved sessions separate', () => {
  const groups = groupCaptureRecords([
    record('audio', 'session-a', manifestUrl),
    record('video', 'session-b', manifestUrl),
    record('unresolved-a', 'session-c'),
    record('unresolved-b', 'session-c'),
    record('another-session', 'session-d'),
    record('legacy-a', undefined),
    record('legacy-b', undefined),
  ]);
  expect(groups.map((group) => group.recordIndexes)).toEqual([[0, 1], [2, 3], [4], [5], [6]]);
  expect(groups[0]?.sessionIds).toEqual(['session-a', 'session-b']);
});

test('uses an unambiguous manifest recorded later in the same session', () => {
  const groups = groupCaptureRecords([
    record('first', 'session'),
    record('second', 'session', manifestUrl),
  ]);
  expect(groups).toHaveLength(1);
  expect(groups[0]?.manifestUrl).toBe(manifestUrl);
  const ambiguous = groupCaptureRecords([
    record('first', 'session'),
    record('second', 'session', manifestUrl),
    record('third', 'session', `${manifestUrl}-other`),
  ]);
  expect(ambiguous).toHaveLength(3);
  expect(ambiguous[0]?.manifestUrl).toBeUndefined();
});

test('joins exact saved manifest metadata to its observed master and child', () => {
  const groups = groupCaptureRecords(
    [
      record('audio', 'session-a', stream.playlists[0]?.url),
      record('video', 'session-b', manifestUrl),
    ],
    [stream],
  );
  expect(groups).toHaveLength(1);
  expect(groups[0]).toMatchObject({ id: stream.id, recordIndexes: [0, 1], manifestUrl });
  expect(groupCaptureRecords([], [stream])[0]?.recordIndexes).toEqual([]);
});

test('does not attach records to ambiguous frames or another page', () => {
  const otherFrame = { ...stream, id: 'other-frame', frameId: 5 };
  expect(
    groupCaptureRecords([record('one', 'session', manifestUrl)], [stream, otherFrame]),
  ).toHaveLength(3);
  const otherPage = { ...record('one', 'session', manifestUrl), url: 'https://example.test/other' };
  expect(groupCaptureRecords([otherPage], [stream])).toHaveLength(2);
});

test('attaches diagnostics by capture identity and preserves sessions without history', () => {
  const diagnostic = {
    captureId: 'session-a',
    owner: 'test',
    createdAt: 200,
    origin: 'https://example.test',
    frameOrigin: 'https://example.test',
    frameId: 0,
    documentId: 'document-one',
    keySystem: 'com.widevine.alpha',
    credential: null,
    sessionId: 'eme-session',
    outcome: 'failed',
    keyCount: 0,
    events: [],
  } satisfies CaptureDiagnostic;
  const orphan = { ...diagnostic, captureId: 'failed-before-history' };
  const groups = groupCaptureRecords(
    [record('audio', 'session-a', manifestUrl)],
    [],
    [diagnostic, orphan],
  );
  expect(groups).toHaveLength(2);
  expect(groups[0]?.diagnostics).toEqual([diagnostic]);
  expect(groups[1]?.recordIndexes).toEqual([]);
  expect(groups[1]?.sessionIds).toEqual(['failed-before-history']);
  expect(groups[1]?.manifestUrl).toBeUndefined();
  expect(groups[1]?.createdAt).toBe(200);
  const sessions = groupCaptureSessions([], [orphan]);
  expect(sessions[0]?.diagnostic).toBe(orphan);
  expect(sessions[0]?.entries).toEqual([]);
  expect(groupCaptureRecords([], [stream], [orphan])).toHaveLength(2);
});

test('legacy capture identity does not depend on its position in a cache', () => {
  const legacy = record('legacy', undefined);
  const alone = groupCaptureRecords([legacy]);
  const history = groupCaptureRecords([record('other', undefined), legacy]);
  expect(alone[0]?.id).toBe(history[1]?.id);
});
