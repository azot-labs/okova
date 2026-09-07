import { expect, test } from 'vitest';
import {
  filterHistory,
  type HistoryFilters,
} from '../src/extension/entrypoints/popup/utils/history-filters';
import type { KeyInfo } from '../src/extension/utils/storage';

const defaults: HistoryFilters = { search: '', drm: 'all', order: 'newest' };
const record = (createdAt: string, drmSystem?: KeyInfo['drmSystem']): KeyInfo => ({
  id: 'aabbccdd11223344556677889900aabb',
  value: 'usable',
  url: 'https://watch.example/show',
  mpd: 'https://cdn.example/manifest.mpd',
  pssh: '',
  createdAt: new Date(createdAt).getTime(),
  drmSystem,
});
const records = [
  record('2026-03-08T00:00:00', 'W'),
  record('2026-03-08T23:59:59.999', 'P'),
  record('2026-03-09T00:00:00', 'C'),
  record('2026-03-07T23:59:59.999'),
];

test('combines DRM and normalized search', () => {
  for (const search of ['AABB-CCDD', ' WATCH.EXAMPLE ', 'MANIFEST.MPD']) {
    expect(
      filterHistory(records, {
        ...defaults,
        search,
        drm: 'P',
      }),
    ).toEqual([records[1]]);
  }
  expect(filterHistory(records, { ...defaults, drm: 'unknown' })).toEqual([records[3]]);
  expect(filterHistory(records, { ...defaults, drm: 'C' })).toEqual([records[2]]);
  expect(filterHistory(records, { ...defaults, search: '---' })).toEqual([]);
});

test('sorts timestamps in both directions without changing storage order and keeps ties stable', () => {
  const original = [...records];
  expect(filterHistory(records, defaults)).toEqual([
    records[2],
    records[1],
    records[0],
    records[3],
  ]);
  expect(filterHistory(records, { ...defaults, order: 'oldest' })).toEqual([
    records[3],
    records[0],
    records[1],
    records[2],
  ]);
  expect(records).toEqual(original);
  const ties = [record('2026-03-08T00:00:00', 'W'), record('2026-03-08T00:00:00', 'P')];
  expect(filterHistory(ties, defaults)).toEqual(ties);
});
