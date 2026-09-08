import { DOMParser } from '@xmldom/xmldom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { installManifestInspection } from '../src/extension/utils/manifest-inspection';
import {
  findManifest,
  getManifestCapture,
  getManifestMetadata,
  MAX_MANIFESTS,
  splitPssh,
} from '../src/extension/utils/manifest';
import { createPsshBox, psshBoxToBase64, PSSH_SYSTEM_IDS } from '../src/lib/pssh';

const widevine = psshBoxToBase64(createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine }));
const playready = psshBoxToBase64(createPsshBox({ systemId: PSSH_SYSTEM_IDS.playready }));
const combined = btoa(atob(widevine) + atob(playready));
const url = 'https://example.test/manifest.mpd';
let receive: (event: { source: unknown; data: unknown }) => void;

const mpd = (pssh: string, scheme: string = PSSH_SYSTEM_IDS.widevine) => `
  <dash:MPD xmlns:dash="urn:mpeg:dash:schema:mpd:2011" xmlns:other="urn:mpeg:cenc:2013">
    <dash:Period><dash:AdaptationSet><dash:ContentProtection schemeIdUri="urn:uuid:${scheme}">
      <other:pssh>\n ${pssh.slice(0, 16)}\n ${pssh.slice(16)} \n</other:pssh>
    </dash:ContentProtection></dash:AdaptationSet></dash:Period>
  </dash:MPD>`;
const post = (text: string, manifestUrl = url) =>
  receive({
    source: window,
    data: { namespace: 'okova:network', method: 'response', params: { url: manifestUrl, text } },
  });

beforeEach(() => {
  vi.stubGlobal('DOMParser', DOMParser);
  vi.stubGlobal('window', {
    addEventListener: (_name: string, callback: typeof receive) => {
      receive = callback;
    },
  });
  installManifestInspection();
});
afterEach(() => vi.unstubAllGlobals());

test.each([
  'javascript:alert(1)',
  'data:application/dash+xml,<MPD/>',
  'file:///tmp/manifest.mpd',
  'blob:https://example.test/manifest',
  'ftp://example.test/manifest.mpd',
  '//example.test/manifest.mpd',
  '/manifest.mpd',
  'not a URL',
  'https://',
  '',
])('rejects unsafe or invalid manifest URLs: %s', (manifestUrl) => {
  post(mpd(widevine), manifestUrl);
  expect(window.MPD_LIST.size).toBe(0);

  // The page can also write directly to the cache.
  window.MPD_LIST.set(widevine, manifestUrl);
  expect(findManifest(widevine)).toBeUndefined();
  expect(findManifest(combined)).toBeUndefined();
  window.MPD_LIST.set(playready, url);
  window.MPD_LIST.set(combined, manifestUrl);
  expect(findManifest(combined)).toBe(url);
});

test.each(['http://example.test/manifest.mpd', url, 'HTTPS://example.test/manifest.mpd'])(
  'accepts HTTP(S) manifest URLs: %s',
  (manifestUrl) => {
    post(mpd(widevine), manifestUrl);
    expect(findManifest(widevine)).toBe(manifestUrl);
  },
);

test.each([null, undefined, false, 42, 'page-owned', {}, []])(
  'replaces an incompatible page-owned manifest cache: %j',
  (value) => {
    Reflect.set(window, 'MPD_LIST', value);
    expect(findManifest(widevine)).toBeUndefined();
    installManifestInspection();
    post(mpd(combined));
    expect(findManifest(widevine)).toBe(url);
    expect(findManifest(playready)).toBe(url);
  },
);

test('preserves existing manifest associations when initialized again', () => {
  post(mpd(widevine));
  const cache = window.MPD_LIST;
  installManifestInspection();
  expect(window.MPD_LIST).toBe(cache);
  expect(findManifest(widevine)).toBe(url);
});

test.each([
  { pssh: widevine, scheme: PSSH_SYSTEM_IDS.widevine },
  { pssh: playready, scheme: PSSH_SYSTEM_IDS.playready },
])('associates prefixed DASH and normalized PSSH for $scheme', ({ pssh, scheme }) => {
  post(mpd(pssh, scheme));
  expect(findManifest(pssh)).toBe(url);
  expect(findManifest(combined)).toBe(url);
});

test('indexes each PSSH when a descriptor carries concatenated boxes', () => {
  post(mpd(combined));
  expect(findManifest(widevine)).toBe(url);
  expect(findManifest(playready)).toBe(url);
});

test('ignores unrelated page messages, foreign frames, and invalid response shapes', () => {
  const valid = {
    namespace: 'okova:network',
    method: 'response',
    params: { url, text: mpd(widevine) },
  };
  for (const data of [
    null,
    undefined,
    3,
    'response',
    {},
    { method: 'response', params: valid.params },
    { ...valid, params: null },
    { ...valid, params: { url: 42, text: mpd(widevine) } },
    { ...valid, params: { url, text: null } },
  ]) {
    expect(() => receive({ source: window, data })).not.toThrow();
  }
  receive({ source: {}, data: valid });
  expect(window.MPD_LIST.size).toBe(0);
});

test('ignores non-DASH XML, wrong namespaces, malformed XML and invalid base64', () => {
  post(mpd(widevine).replaceAll('urn:mpeg:dash:schema:mpd:2011', 'urn:other'));
  post(mpd(widevine).replaceAll('urn:mpeg:cenc:2013', 'urn:other'));
  post(mpd('%%%'));
  post('<MPD');
  expect(window.MPD_LIST.size).toBe(0);
});

test('rejects truncated sequences and handles extended and terminal box sizes', () => {
  const raw = Buffer.from(widevine, 'base64');
  const extended = Buffer.alloc(raw.length + 8);
  extended.writeUInt32BE(1);
  raw.copy(extended, 4, 4, 8);
  extended.writeBigUInt64BE(BigInt(extended.length), 8);
  raw.copy(extended, 16, 8);
  expect(splitPssh(extended.toString('base64'))).toEqual([extended.toString('base64')]);
  const terminal = Buffer.from(raw);
  terminal.writeUInt32BE(0);
  expect(splitPssh(terminal.toString('base64'))).toEqual([terminal.toString('base64')]);
  expect(splitPssh(btoa(atob(widevine) + 'x'))).toEqual([]);
  expect(splitPssh(raw.subarray(0, -1).toString('base64'))).toEqual([]);
  extended.writeBigUInt64BE(0xffffffffffffffffn, 8);
  expect(splitPssh(extended.toString('base64'))).toEqual([]);
  expect(findManifest(undefined)).toBeUndefined();
});

test('bounds manifest associations and evicts the oldest entry', () => {
  for (let index = 0; index < 1_000; index++) window.MPD_LIST.set(String(index), url);
  post(mpd(widevine));
  expect(window.MPD_LIST.size).toBe(1_000);
  expect(window.MPD_LIST.has('0')).toBe(false);
  expect(findManifest(widevine)).toBe(url);
});

test('retains multiple DASH URLs for a capture and unrelated manifests as explicit choices', () => {
  post(mpd(widevine));
  post(mpd(widevine), `${url}?alternate=1`);
  post(mpd(playready), 'https://example.test/other.mpd');
  const capture = getManifestCapture(widevine);
  expect(capture.manifests).toEqual([
    { url, kind: 'dash', matched: true },
    { url: `${url}?alternate=1`, kind: 'dash', matched: true },
    { url: 'https://example.test/other.mpd', kind: 'dash', matched: false },
  ]);
  expect(capture.mpd).toBe(url);
  expect(getManifestCapture(undefined).mpd).toBeUndefined();
});

test.each(['KEY', 'SESSION-KEY'])(
  'matches HLS EXT-X-%s embedded PSSH, including commas in quoted data URIs',
  (tag) => {
    post(
      `#EXTM3U\n#EXT-X-${tag}:METHOD=SAMPLE-AES,URI="data:text/plain;base64,${widevine}",KEYFORMAT="urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"\n#EXTINF:4,\nsegment.ts`,
      'https://example.test/video.m3u8',
    );
    expect(getManifestCapture(combined)).toEqual({
      mpd: 'https://example.test/video.m3u8',
      manifests: [
        {
          url: 'https://example.test/video.m3u8',
          kind: tag === 'SESSION-KEY' ? 'hls-master' : 'hls-media',
          matched: true,
        },
      ],
    });
  },
);

test('prefers the observed HLS master when a relative child matches', () => {
  const master = 'https://example.test/master.m3u8?masterToken=one';
  post(
    '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS="avc1.4d401f,mp4a.40.2"\nvideo/media.m3u8?token=two',
    master,
  );
  post(
    `#EXTM3U\n#EXT-X-KEY:METHOD=SAMPLE-AES,URI="data:text/plain;base64,${widevine}"`,
    'https://example.test/video/media.m3u8?token=two',
  );
  const capture = getManifestCapture(widevine);
  expect(capture.mpd).toBe(master);
  expect(capture.manifests?.map((manifest) => [manifest.kind, manifest.matched])).toEqual([
    ['hls-master', true],
    ['hls-media', true],
  ]);
});

test('records plain HLS playlists without claiming a DRM association or capturing segment/key URLs', () => {
  post(
    '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="secret.key"\n#EXTINF:10,\nsegment.ts',
    'https://example.test/plain.m3u8',
  );
  expect(getManifestCapture(widevine)).toEqual({
    mpd: undefined,
    manifests: [{ url: 'https://example.test/plain.m3u8', kind: 'hls-media', matched: false }],
  });
  post('#EXTM3U-not-a-playlist', 'https://example.test/fake.m3u8');
  expect(window.MANIFEST_LIST.size).toBe(1);
});

test('matches MSS ProtectionHeader as raw PlayReady data and as an EME PSSH', () => {
  const data = Buffer.from('synthetic PlayReady Object');
  const pssh = psshBoxToBase64(createPsshBox({ systemId: PSSH_SYSTEM_IDS.playready, data }));
  const mss = 'https://example.test/video.ism/Manifest';
  post(
    `<SmoothStreamingMedia MajorVersion="2" MinorVersion="1"><Protection><ProtectionHeader SystemID="{9A04F079-9840-4286-AB92-E65BE0885F95}">${data.toString('base64')}</ProtectionHeader></Protection></SmoothStreamingMedia>`,
    mss,
  );
  expect(getManifestCapture(pssh)).toEqual({
    mpd: mss,
    manifests: [{ url: mss, kind: 'mss', matched: true }],
  });
  expect(getManifestCapture(data.toString('base64')).mpd).toBe(mss);
});

test('ignores malformed protection data while keeping the detected manifest', () => {
  post(
    '<SmoothStreamingMedia><Protection><ProtectionHeader SystemID="9a04f079-9840-4286-ab92-e65be0885f95">%%%bad</ProtectionHeader></Protection></SmoothStreamingMedia>',
  );
  expect(getManifestCapture(widevine)).toEqual({
    mpd: undefined,
    manifests: [{ url, kind: 'mss', matched: false }],
  });
});

test('deduplicates reloads and bounds detected manifests without storing response bodies', () => {
  for (let index = 0; index < MAX_MANIFESTS + 1; index++)
    post('#EXTM3U\n#EXTINF:4,\nsegment.ts', `${url}?index=${index}`);
  post('#EXTM3U\n#EXTINF:5,\nnext.ts', `${url}?index=${MAX_MANIFESTS}`);
  const manifests = getManifestCapture(undefined).manifests;
  expect(manifests).toHaveLength(MAX_MANIFESTS);
  expect(manifests?.some((item) => item.url === `${url}?index=0`)).toBe(false);
  expect(manifests?.at(-1)).toEqual({
    url: `${url}?index=${MAX_MANIFESTS}`,
    kind: 'hls-media',
    matched: false,
  });
});

test('validates and bounds manifest metadata from page messages and old storage', () => {
  const valid = { url, kind: 'dash', matched: true };
  expect(
    getManifestMetadata({
      mpd: 'javascript:alert(1)',
      manifests: [
        valid,
        valid,
        { ...valid, url: 'file:///tmp/a' },
        null,
        { ...valid, kind: 'html' },
      ],
    }),
  ).toEqual({ mpd: undefined, manifests: [valid] });
  expect(getManifestMetadata({ mpd: url, manifests: 'not a list' })).toEqual({ mpd: url });
});

test.each(['dash', 'mss'] as const)(
  'prefers a direct %s match over an HLS master matched through its child',
  (kind) => {
    const data = Buffer.from('shared PlayReady Object');
    const pssh = psshBoxToBase64(createPsshBox({ systemId: PSSH_SYSTEM_IDS.playready, data }));
    const master = 'https://example.test/master.m3u8';
    post('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000\nmedia.m3u8', master);
    post(
      `#EXTM3U\n#EXT-X-KEY:METHOD=SAMPLE-AES,URI="data:text/plain;base64,${pssh}"`,
      'https://example.test/media.m3u8',
    );
    const direct = `https://example.test/${kind}`;
    const body =
      kind === 'dash'
        ? mpd(pssh, PSSH_SYSTEM_IDS.playready)
        : `<SmoothStreamingMedia><Protection><ProtectionHeader SystemID="9a04f079-9840-4286-ab92-e65be0885f95">${data.toString('base64')}</ProtectionHeader></Protection></SmoothStreamingMedia>`;
    post(body, direct);
    const capture = getManifestCapture(pssh);
    expect(capture.mpd).toBe(direct);
    expect(capture.manifests).toEqual([
      { url: direct, kind, matched: true },
      { url: master, kind: 'hls-master', matched: true },
      { url: 'https://example.test/media.m3u8', kind: 'hls-media', matched: true },
    ]);
  },
);
