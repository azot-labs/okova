import { expect, test, vi } from 'vitest';
import {
  MAX_DETECTED_MANIFEST_BYTES,
  parseDetectedManifest,
} from '../src/extension/utils/manifest';

const manifest = {
  url: 'https://example.test/movie.mpd',
  kind: 'dash',
  initData: [''],
  children: [],
};

test.each([
  ['one oversized string', ['A'.repeat(1024 * 1024)]],
  ['many individually small strings', Array.from({ length: 50 }, () => 'A'.repeat(3000))],
])('rejects %s before serializing the payload', (_name, initData) => {
  const serialize = vi.spyOn(JSON, 'stringify');
  try {
    expect(parseDetectedManifest({ ...manifest, initData })).toBeUndefined();
    expect(serialize).not.toHaveBeenCalled();
  } finally {
    serialize.mockRestore();
  }
});

test('rejects oversized arrays before visiting their elements', () => {
  const initData = new Array(100_000);
  const read = vi.fn(() => 'A');
  Object.defineProperty(initData, 0, { get: read });
  expect(parseDetectedManifest({ ...manifest, initData })).toBeUndefined();
  expect(read).not.toHaveBeenCalled();
});

test.each(['A', '漢', '\u0001', '\ud800'])(
  'preserves the exact UTF-8 JSON boundary for %j',
  (character) => {
    const overhead = Buffer.byteLength(JSON.stringify(manifest));
    const characterBytes = Buffer.byteLength(JSON.stringify(character)) - 2;
    const remaining = MAX_DETECTED_MANIFEST_BYTES - overhead;
    const value =
      character.repeat(Math.floor(remaining / characterBytes)) +
      'A'.repeat(remaining % characterBytes);
    const atLimit = { ...manifest, initData: [value] };
    expect(Buffer.byteLength(JSON.stringify(atLimit))).toBe(MAX_DETECTED_MANIFEST_BYTES);
    expect(parseDetectedManifest(atLimit)).toEqual(atLimit);
    expect(parseDetectedManifest({ ...manifest, initData: [value + 'A'] })).toBeUndefined();
  },
);

test('validates the bounded snapshot without rereading page-owned fields', () => {
  const read = vi
    .fn()
    .mockReturnValueOnce(['small'])
    .mockReturnValue(['A'.repeat(1024 * 1024)]);
  const input = { ...manifest };
  Object.defineProperty(input, 'initData', { get: read });
  expect(parseDetectedManifest(input)?.initData).toEqual(['small']);
  expect(read).toHaveBeenCalledTimes(1);
});
