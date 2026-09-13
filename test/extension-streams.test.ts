import { afterEach, expect, test, vi } from 'vitest';
import {
  frameStreamsSchema,
  groupStreamManifests,
  readFrameStreams,
  type ManifestObservation,
} from '../src/extension/utils/streams';

const media = (url: string): ManifestObservation => ({
  url,
  kind: 'hls-media',
  children: [],
  requestUrls: [],
});
const master = (url: string, children: string[]): ManifestObservation => ({
  ...media(url),
  kind: 'hls-master',
  children,
});
const origin = 'https://streams.test';

afterEach(() => vi.unstubAllGlobals());

test('groups a late master with nested redirected playlists without changing signed URLs', () => {
  const child = { ...media(`${origin}/media?token=two`), requestUrls: [`${origin}/redirect`] };
  const inner = master(`${origin}/inner.m3u8`, [`${origin}/redirect`]);
  const root = master(`${origin}/master.m3u8?token=one`, [inner.url]);
  expect(groupStreamManifests([child, inner, root, child])).toEqual([
    { manifest: root, playlists: [inner, child] },
  ]);
});

test('preserves independent masters sharing a child and independent DASH/MSS observations', () => {
  const child = media(`${origin}/media`);
  const first = master(`${origin}/master?a=1`, [child.url]);
  const second = master(`${origin}/master?a=2`, [child.url]);
  const dash = { ...media(`${origin}/dash`), kind: 'dash' as const };
  const mss = { ...media(`${origin}/mss`), kind: 'mss' as const };
  expect(groupStreamManifests([child, first, second, dash, mss])).toEqual([
    { manifest: first, playlists: [child] },
    { manifest: second, playlists: [child] },
    { manifest: dash, playlists: [] },
    { manifest: mss, playlists: [] },
  ]);
});

test('shows orphan playlists and cyclic references without losing observations', () => {
  const first = master(`${origin}/one`, [`${origin}/two`]);
  const second = master(`${origin}/two`, [first.url]);
  const orphan = media(`${origin}/orphan`);
  expect(groupStreamManifests([first, second, orphan])).toEqual([
    { manifest: orphan, playlists: [] },
    { manifest: first, playlists: [second] },
  ]);
});

test('reads bounded URL metadata, omitting page-owned getters and initialization data', () => {
  const manifest = media(`${origin}/media`);
  const cache = new Map<string, unknown>([
    [
      'bad',
      {
        get url() {
          throw new Error('Page getter');
        },
        kind: 'dash',
        children: [],
      },
    ],
    ['valid', { ...manifest, initData: ['do-not-export'], body: 'do-not-export' }],
    ['unsafe', { ...manifest, url: 'javascript:alert(1)' }],
  ]);
  vi.stubGlobal('window', { MANIFEST_LIST: cache, location: { href: `${origin}/watch` } });
  const raw = readFrameStreams();
  expect(JSON.stringify(raw)).not.toContain('do-not-export');
  expect(frameStreamsSchema.parse(raw).manifests).toEqual([manifest]);
  for (let index = 0; index < 60; index++) cache.set(String(index), media(`${origin}/${index}`));
  expect(readFrameStreams().limited).toBe(true);
  expect(readFrameStreams().manifests.length).toBeLessThanOrEqual(50);
});

test('bounds bytes without truncating signed URLs and tolerates a replaced cache', () => {
  const cache = new Map(
    Array.from({ length: 50 }, (_, index) => {
      const url = `${origin}/${index}?signature=${'漢'.repeat(7000)}`;
      return [url, media(url)];
    }),
  );
  vi.stubGlobal('window', { MANIFEST_LIST: cache, location: { href: origin } });
  const result = readFrameStreams();
  expect(result.limited).toBe(true);
  expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThan(129 * 1024);
  expect(result.manifests.every((manifest) => cache.has(manifest.url))).toBe(true);
  vi.stubGlobal('window', {
    get MANIFEST_LIST() {
      throw new Error('Replaced');
    },
    location: { href: origin },
  });
  expect(readFrameStreams().manifests).toEqual([]);
});
