import { DOMParser } from '@xmldom/xmldom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import manifest from '../src/extension/entrypoints/manifest';
import { findManifest, splitPssh } from '../src/extension/utils/manifest';
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
const post = (text: string) =>
  receive({
    source: window,
    data: { namespace: 'okova:network', method: 'response', params: { url, text } },
  });

beforeEach(() => {
  vi.stubGlobal('DOMParser', DOMParser);
  vi.stubGlobal('window', {
    addEventListener: (_name: string, callback: typeof receive) => {
      receive = callback;
    },
  });
  manifest.main();
});
afterEach(() => vi.unstubAllGlobals());

test.each([null, undefined, false, 42, 'page-owned', {}, []])(
  'replaces an incompatible page-owned manifest cache: %j',
  (value) => {
    Reflect.set(window, 'MPD_LIST', value);
    expect(findManifest(widevine)).toBeUndefined();
    manifest.main();
    post(mpd(combined));
    expect(findManifest(widevine)).toBe(url);
    expect(findManifest(playready)).toBe(url);
  },
);

test('preserves existing manifest associations when initialized again', () => {
  post(mpd(widevine));
  const cache = window.MPD_LIST;
  manifest.main();
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
