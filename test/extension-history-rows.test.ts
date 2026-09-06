import { expect, test } from 'vitest';
import { reconcileHistoryRows } from '../src/extension/entrypoints/popup/utils/history-rows';
import type { KeyInfo } from '../src/extension/utils/storage';

const record: KeyInfo = {
  id: 'shared-kid',
  value: 'usable',
  url: 'https://example.com',
  pssh: '',
  createdAt: 1,
};

test('selection follows a status replacement and metadata edits independently of filtering', () => {
  let identity = 0;
  const nextIdentity = () => identity++;
  const original = reconcileHistoryRows([], [record], [record], nextIdentity);
  const captured = { ...record, value: 'a'.repeat(32), url: 'https://other.example', pssh: 'new' };
  const updated = reconcileHistoryRows(original, [captured], [], nextIdentity);
  expect(updated).toEqual([{ identity: original[0]!.identity, key: captured, visible: false }]);
  expect(reconcileHistoryRows(updated, [], [], nextIdentity)).toEqual([]);
});

test('duplicate KIDs retain distinct identities when reordered, updated, and removed', () => {
  let identity = 0;
  const nextIdentity = () => identity++;
  const first = { ...record, value: 'a'.repeat(32) };
  const second = { ...record, value: 'b'.repeat(32), url: 'https://other.example' };
  const original = reconcileHistoryRows([], [first, second], [first, second], nextIdentity);
  const changed = { ...first, mpd: 'https://cdn.example/manifest.mpd' };
  const reordered = reconcileHistoryRows(
    original,
    [second, changed],
    [second, changed],
    nextIdentity,
  );
  expect(reordered.map((row) => row.identity)).toEqual([
    original[1]!.identity,
    original[0]!.identity,
  ]);
  const remaining = reconcileHistoryRows(reordered, [second], [second], nextIdentity);
  expect(remaining[0]!.identity).toBe(original[1]!.identity);
});
