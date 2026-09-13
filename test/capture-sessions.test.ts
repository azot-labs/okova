import { expect, test } from 'vitest';
import { groupCaptureSessions } from '../src/extension/entrypoints/popup/utils/capture-sessions';
import type { HistoryRow } from '../src/extension/entrypoints/popup/utils/history-rows';

const row = (identity: number, captureId: string | undefined, pssh: string): HistoryRow => ({
  identity,
  visible: true,
  key: {
    captureId,
    pssh,
    id: 'shared-id',
    value: 'usable',
    url: 'https://example.test',
    createdAt: 1,
  },
});

test('keeps records in their session even when key IDs and PSSH values overlap', () => {
  const rows = [row(0, 'a', 'first'), row(1, 'b', 'first'), row(2, 'a', 'second')];
  const sessions = groupCaptureSessions(rows);
  expect(
    sessions.map(({ id, entries, psshValues }) => ({
      id,
      identities: entries.map((entry) => entry.identity),
      psshValues,
    })),
  ).toEqual([
    { id: 'a', identities: [0, 2], psshValues: ['first', 'second'] },
    { id: 'b', identities: [1], psshValues: ['first'] },
  ]);
  expect(sessions[0]?.entries[0]).toBe(rows[0]);
});

test('omits empty PSSH values and deduplicates within each session', () => {
  const sessions = groupCaptureSessions([
    row(0, 'a', ''),
    row(1, 'a', '  '),
    row(2, 'a', 'first'),
    row(3, 'a', 'first'),
  ]);
  expect(sessions[0]?.psshValues).toEqual(['first']);
  expect(sessions[0]?.entries).toHaveLength(4);
});

test('keeps records with unknown session identity separate from known sessions', () => {
  const sessions = groupCaptureSessions([row(0, undefined, ''), row(1, 'a', ''), row(2, '', '')]);
  expect(sessions.map(({ id, entries }) => ({ id, count: entries.length }))).toEqual([
    { id: undefined, count: 2 },
    { id: 'a', count: 1 },
  ]);
  expect(groupCaptureSessions([])).toEqual([]);
});
