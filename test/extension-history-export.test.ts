import { expect, test } from 'vitest';
import { serializeHistory } from '../src/extension/entrypoints/popup/utils/history-export';
import type { KeyInfo } from '../src/extension/utils/storage';

const key: KeyInfo = {
  drmSystem: 'W',
  id: '00112233445566778899aabbccddeeff',
  value: 'ffeeddccbbaa99887766554433221100',
  url: 'https://example.com/watch/1',
  pssh: 'cHNzaA==',
  mpd: 'https://example.com/manifest.mpd',
  createdAt: 1,
};

test('JSON preserves individual records, metadata, and status-only entries', () => {
  const records = [
    key,
    { ...key, url: 'https://example.com/watch/2' },
    {
      ...key,
      value: 'expired',
      mpd: undefined,
      pssh: '',
    },
  ];

  expect(JSON.parse(serializeHistory(records, 'json'))).toEqual({ version: 1, records });
  expect(records[0]).toEqual(key);
});

test('TXT deduplicates pairs across records and hex casing but retains different keys for a KID', () => {
  const otherValue = '11223344556677889900aabbccddeeff';
  const records = [
    key,
    { ...key, url: 'https://example.com/watch/2' },
    { ...key, id: key.id.toUpperCase(), value: key.value.toUpperCase() },
    { ...key, value: otherValue },
    ...['usable', 'expired', 'output-restricted', 'status-pending', ''].map((value) => ({
      ...key,
      value,
    })),
  ];

  expect(serializeHistory(records, 'txt')).toBe(
    `${key.id}:${key.value}\n${key.id}:${otherValue}\n`,
  );
});

test('empty history produces an empty JSON collection or empty text', () => {
  expect(JSON.parse(serializeHistory([], 'json'))).toEqual({ version: 1, records: [] });
  expect(serializeHistory([], 'txt')).toBe('');
  expect(serializeHistory([{ ...key, value: 'usable' }], 'txt')).toBe('');
});
