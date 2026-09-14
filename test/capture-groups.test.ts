import { expect, test } from 'vitest';
import { storedCaptureGroups } from '../src/extension/utils/capture-groups';
import { capturesForRecords } from './e2e/capture-storage';
import { captureRecords } from '../src/extension/utils/storage/capture-history';

test('projects stable capture identities and matching record offsets for the UI', () => {
  const records = ['audio', 'video', 'unresolved'].map((id, index) => ({
    captureId: id,
    id,
    value: 'usable',
    pssh: '',
    createdAt: index,
    url: 'https://example.test/watch',
    mpd: index < 2 ? 'https://example.test/master.m3u8' : undefined,
  }));
  const captures = capturesForRecords(records);
  const groups = storedCaptureGroups(captures);
  expect(groups.map((capture) => capture.recordIndexes)).toEqual([[0, 1], [2]]);
  expect(groups[0]?.sessionIds).toEqual(['audio', 'video']);
  const projected = captureRecords(captures);
  expect(
    groups.flatMap((capture) => capture.recordIndexes.map((index) => projected[index]?.id)),
  ).toEqual(['audio', 'video', 'unresolved']);
  expect(storedCaptureGroups(captures.slice(1))[0]?.id).toBe(groups[1]?.id);
});
