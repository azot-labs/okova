import { expect, test } from 'vitest';
import { getBadgeAppearance, getBadgeDrmSystem, getBadgeKey } from '../src/extension/utils/badge';
import type { KeyInfo } from '../src/extension/utils/storage';

const key: KeyInfo = {
  drmSystem: 'W',
  id: '00112233445566778899aabbccddeeff',
  value: 'ffeeddccbbaa99887766554433221100',
  url: 'https://example.com/video',
  pssh: '',
  createdAt: 1,
};

test('distinguishes observed IDs, saved keys, fresh keys and failures', () => {
  expect(getBadgeAppearance([{ ...key, value: 'usable' }], null)).toMatchObject({
    text: '1W',
    color: '#666666',
    title: expect.stringContaining('1 key IDs observed'),
  });
  expect(getBadgeAppearance([key, { ...key, id: 'other', value: 'usable' }], null)).toMatchObject({
    text: '1W',
    color: '#2169EB',
    title: expect.stringContaining('1 content keys available from history'),
  });
  expect(
    getBadgeAppearance([key], [{ kind: 'success', system: 'W', keys: [getBadgeKey(key)] }]),
  ).toMatchObject({
    text: '1W',
    color: '#16803C',
  });
  expect(
    getBadgeAppearance([key], [{ kind: 'failure', system: 'P', error: 'No client' }]),
  ).toMatchObject({
    text: 'P!',
    color: '#C75300',
    title: expect.stringContaining('No client'),
  });
});

test('handles empty and legacy history without guessing the DRM system, and caps counts', () => {
  expect(getBadgeAppearance([], null)).toMatchObject({ text: '', title: 'Okova' });
  expect(getBadgeAppearance([{ ...key, drmSystem: undefined }], null).text).toBe('1');
  expect(
    getBadgeAppearance(
      Array.from({ length: 100 }, (_, id) => ({ ...key, id: String(id) })),
      null,
    ).text,
  ).toBe('99+W');
});

test('shows the latest DRM result and retains the other systems in the tooltip', () => {
  const clearKey: KeyInfo = { ...key, drmSystem: 'C' };
  const badge = getBadgeAppearance(
    [clearKey],
    [
      { kind: 'success', system: 'W', keys: [getBadgeKey(key)] },
      { kind: 'success', system: 'C', keys: [getBadgeKey(clearKey)] },
    ],
  );
  expect(badge.text).toBe('1C');
  expect(badge.title).toContain('Widevine: 1 content keys retrieved this visit');
  expect(badge.title).toContain('ClearKey: 1 content keys retrieved this visit');
});

test.each([
  ['com.widevine.alpha', 'W'],
  ['com.microsoft.playready.recommendation.3000', 'P'],
  ['com.microsoft.playready.hardware', 'P'],
  ['org.w3.clearkey', 'C'],
  ['unsupported', undefined],
])('maps %s to %s', (system, expected) => {
  expect(getBadgeDrmSystem(system)).toBe(expected);
});
