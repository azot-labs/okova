import { beforeEach, expect, test, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { storage } from '#imports';
import {
  appStorage,
  getKeyHistory,
  clearClosedPrivateHistory,
  type KeyInfo,
} from '../src/extension/utils/storage';
import { captureRecords } from '../src/extension/utils/storage/capture-history';
import type { CaptureDiagnostic } from '../src/extension/utils/session-diagnostics';
import { browser } from 'wxt/browser';

const source = {
  url: 'https://example.test/watch',
  tabId: 1,
  frameId: 0,
  documentId: 'document-a',
};
const key: KeyInfo = {
  captureId: 'session-a',
  id: '00112233445566778899aabbccddeeff',
  value: 'ffeeddccbbaa99887766554433221100',
  pssh: 'cHNzaA==',
  drmSystem: 'W',
  url: source.url,
  createdAt: 1,
};
const manifest = {
  url: 'https://example.test/movie.mpd',
  kind: 'dash' as const,
  initData: [key.pssh],
  keyIds: [key.id],
  children: [],
};
const diagnostic: CaptureDiagnostic = {
  captureId: 'session-a',
  owner: 'owner-a',
  createdAt: 1,
  origin: source.url,
  frameOrigin: source.url,
  frameId: 0,
  documentId: source.documentId,
  keySystem: 'com.widevine.alpha',
  credential: null,
  sessionId: 'actual-eme-id',
  outcome: 'keys-returned',
  keyCount: 1,
  events: [],
};
beforeEach(() => fakeBrowser.reset());

test('migrates all three legacy stores once without keeping duplicate copies', async () => {
  await storage.setItem('local:all-keys', JSON.stringify([{ ...key, mpd: manifest.url }]));
  await storage.setItem('local:recent-keys', JSON.stringify([{ ...key, mpd: manifest.url }]));
  await storage.setItem(
    'local:recent-keys-by-domain',
    JSON.stringify({
      'example.test': [
        { ...key, mpd: manifest.url },
        { ...key, captureId: 'session-b', mpd: manifest.url },
      ],
    }),
  );
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(1);
  expect(captures[0]?.sessions).toHaveLength(2);
  expect((await appStorage.captures.getValue())[0]?.id).toBe(captures[0]?.id);
  expect(await storage.getItem('local:all-keys')).toBeNull();
  expect(await storage.getItem('local:recent-keys')).toBeNull();
  expect(await storage.getItem('local:recent-keys-by-domain')).toBeNull();
});

test('persists manifest-only captures and attaches later sessions', async () => {
  await appStorage.observeManifest(source, manifest);
  const id = (await appStorage.captures.getValue())[0]!.id;
  await appStorage.upsertKeys([key], source);
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(1);
  expect(captures[0]?.sessions[0]?.records[0]?.kind).toBe('key');
  // Both the initial manifest identity and attached session identity remain addressable.
  expect([captures[0]?.id, ...captures[0]!.aliases]).toContain(id);
});

test('late manifest preserves session-only identity and persists diagnostic metadata', async () => {
  await appStorage.upsertDiagnostic(source, diagnostic, key.pssh);
  const id = (await appStorage.captures.getValue())[0]!.id;
  await appStorage.upsertKeys([key], source);
  await appStorage.observeManifest(source, manifest);
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(1);
  expect(captures[0]?.id).toBe(id);
  expect(captures[0]?.sessions[0]?.diagnostic?.sessionId).toBe('actual-eme-id');
  expect(captures[0]?.sessions[0]?.diagnostic).not.toHaveProperty('owner');
});

test('KID fallback is frame-scoped and refuses competing manifests', async () => {
  await appStorage.observeManifest(source, { ...manifest, initData: [] });
  await appStorage.observeManifest(source, {
    ...manifest,
    url: 'https://example.test/other.mpd',
    initData: [],
  });
  await appStorage.upsertKeys([key], source);
  expect(await appStorage.captures.getValue()).toHaveLength(3);
  await appStorage.upsertKeys([{ ...key, captureId: 'other-frame' }], {
    ...source,
    frameId: 2,
    documentId: 'document-b',
  });
  expect(await appStorage.captures.getValue()).toHaveLength(4);
});

test('stores statuses separately from keys and does not downgrade captured values', async () => {
  await appStorage.upsertKeys([{ ...key, value: 'usable' }], source);
  await appStorage.upsertKeys([key], source);
  await appStorage.upsertKeys([{ ...key, value: 'expired' }], source);
  const captures = await appStorage.captures.getValue();
  expect(captures[0]?.sessions[0]?.records).toEqual([
    { kind: 'key', id: key.id, value: key.value, status: 'expired' },
  ]);
  expect(captureRecords(captures)[0]?.value).toBe(key.value);
});

test('deletes the whole capture including late members and rejects late session events', async () => {
  await appStorage.observeManifest(source, manifest);
  await appStorage.upsertKeys([key], source);
  const id = (await appStorage.captures.getValue())[0]!.id;
  await appStorage.upsertKeys([{ ...key, captureId: 'session-b' }], source);
  await appStorage.deleteCaptures([id]);
  await appStorage.upsertKeys([key], source);
  await appStorage.upsertDiagnostic(source, diagnostic, key.pssh);
  await appStorage.observeManifest(source, manifest);
  expect(await appStorage.captures.getValue()).toEqual([]);
  await appStorage.observeManifest({ ...source, documentId: 'new-document' }, manifest);
  expect(await appStorage.captures.getValue()).toHaveLength(1);
});

test('completed identical sessions keep only the newest without losing capture identity', async () => {
  await appStorage.observeManifest(source, manifest);
  await appStorage.upsertKeys([key], source);
  const id = (await appStorage.captures.getValue())[0]!.id;
  await appStorage.upsertKeys([{ ...key, captureId: 'new-session', createdAt: 2 }], source);
  await appStorage.replaceDuplicateSessions('new-session');
  const captures = await appStorage.captures.getValue();
  expect(captures[0]?.id).toBe(id);
  expect(captures[0]?.sessions.map((session) => session.id)).toEqual(['new-session']);
  await appStorage.upsertKeys([key], source);
  expect((await appStorage.captures.getValue())[0]?.sessions).toHaveLength(1);
});

test('HLS child observations become part of the master capture', async () => {
  const child = { ...manifest, url: 'https://example.test/audio.m3u8', kind: 'hls-media' as const };
  await appStorage.observeManifest(source, child);
  await appStorage.upsertKeys([{ ...key, mpd: child.url }], source);
  await appStorage.observeManifest(source, {
    ...manifest,
    url: 'https://example.test/master.m3u8',
    kind: 'hls-master',
    children: [child.url],
  });
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(1);
  expect(captures[0]?.manifest?.kind).toBe('hls-master');
  expect(captures[0]?.playlists[0]?.url).toBe(child.url);
  expect(captures[0]?.sessions).toHaveLength(1);
});

test('isolates private captures and clears the private generation when its windows close', async () => {
  const window = await browser.windows.create({ incognito: true });
  if (window?.id === undefined) throw new Error('Private window was not created');
  const history = await getKeyHistory(true, window.id);
  await history.observeManifest(source, manifest);
  expect(await appStorage.captures.getValue()).toEqual([]);
  expect(await history.captures.getValue()).toHaveLength(1);
  await browser.windows.remove(window.id!);
  await clearClosedPrivateHistory();
  expect(await storage.getItem('session:incognito:capture-history')).toBeNull();
  await history.upsertKeys([key], source);
  expect(await storage.getItem('session:incognito:capture-history')).toBeNull();
});

test('concurrent writes and confirmation preserve whole captures created afterwards', async () => {
  await appStorage.observeManifest(source, manifest);
  const selected = (await appStorage.captures.getValue()).map((capture) => capture.id);
  await Promise.all([
    appStorage.upsertKeys([key], source),
    appStorage.observeManifest(source, {
      ...manifest,
      url: 'https://example.test/later.mpd',
      initData: [],
      keyIds: [],
    }),
    appStorage.upsertKeys([{ ...key, captureId: 'session-b' }], source),
  ]);
  await appStorage.deleteCaptures(selected);
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(1);
  expect(captures[0]?.manifest?.url).toBe('https://example.test/later.mpd');
  expect(captures[0]?.sessions).toEqual([]);
});

test('shared HLS playlists never merge their master captures', async () => {
  const child = { ...manifest, url: 'https://example.test/audio.m3u8', kind: 'hls-media' as const };
  const master = {
    ...manifest,
    url: 'https://example.test/master.m3u8',
    kind: 'hls-master' as const,
    children: [child.url],
  };
  await appStorage.observeManifest(source, child);
  await appStorage.observeManifest(source, master);
  await appStorage.upsertKeys([{ ...key, mpd: master.url }], source);
  await appStorage.observeManifest(source, { ...master, url: 'https://example.test/other.m3u8' });
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(2);
  expect(captures.flatMap((capture) => capture.sessions)).toHaveLength(1);
  expect(captures.find((capture) => capture.sessions.length)?.manifest?.url).toBe(master.url);
});

test('retention evicts complete captures and an oversized write preserves saved history', async () => {
  const records = Array.from({ length: 1002 }, (_, index) => ({
    ...key,
    captureId: `session-${index}`,
    createdAt: index,
  }));
  await appStorage.upsertKeys(records);
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(1000);
  expect(captures[0]?.sessions[0]?.id).toBe('session-2');
  await expect(
    appStorage.upsertKeys([
      { ...key, captureId: 'oversized', createdAt: 2000, pssh: 'A'.repeat(7 * 1024 * 1024) },
    ]),
  ).rejects.toThrow('Capture exceeds history storage budget');
  expect(await appStorage.captures.getValue()).toEqual(captures);
});

test('failed migration leaves legacy history available for retry', async () => {
  await storage.setItem('local:all-keys', JSON.stringify([key]));
  const write = vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('quota'));
  await expect(appStorage.captures.getValue()).rejects.toThrow('quota');
  expect(await storage.getItem('local:all-keys')).not.toBeNull();
  write.mockRestore();
  expect(await appStorage.captures.getValue()).toHaveLength(1);
});

test('session closure is persisted and browser restart clears only transient deletion markers', async () => {
  await appStorage.upsertDiagnostic(
    source,
    { ...diagnostic, outcome: 'pending', events: [{ stage: 'license', status: 'started', at: 1 }] },
    key.pssh,
  );
  await appStorage.closePendingSessions(source.tabId);
  let captures = await appStorage.captures.getValue();
  expect(captures[0]?.sessions[0]?.diagnostic).toMatchObject({
    outcome: 'closed',
    events: [{ status: 'interrupted' }],
  });
  await appStorage.deleteCaptures(captures.map((capture) => capture.id));
  await appStorage.observeManifest(source, manifest);
  captures = await appStorage.captures.getValue();
  const id = captures[0]!.id;
  await storage.removeItem('session:capture-history-runtime-id');
  expect((await appStorage.captures.getValue())[0]?.id).toBe(id);
  await appStorage.upsertKeys([key], source);
  expect((await appStorage.captures.getValue())[0]?.sessions).toHaveLength(1);
});

test('migration preserves unassociated manifest metadata without inventing session links', async () => {
  await storage.setItem(
    'local:all-keys',
    JSON.stringify([
      {
        ...key,
        mpd: manifest.url,
        manifests: [
          { url: manifest.url, kind: 'dash', matched: true },
          { url: 'https://example.test/master.m3u8', kind: 'hls-master', matched: false },
        ],
      },
    ]),
  );
  const captures = await appStorage.captures.getValue();
  expect(captures).toHaveLength(2);
  expect(captures.find((capture) => capture.manifest?.kind === 'hls-master')?.sessions).toEqual([]);
  expect(captures.find((capture) => capture.manifest?.kind === 'dash')?.sessions).toHaveLength(1);
});

test('session replacement retains different DRM systems and different results', async () => {
  await appStorage.observeManifest(source, manifest);
  await appStorage.upsertKeys([key], source, true);
  await appStorage.upsertKeys(
    [{ ...key, captureId: 'other-system', drmSystem: 'P', createdAt: 2 }],
    source,
    true,
  );
  await appStorage.upsertKeys(
    [{ ...key, captureId: 'other-result', value: '1'.repeat(32), createdAt: 3 }],
    source,
    true,
  );
  expect((await appStorage.captures.getValue())[0]?.sessions.map((session) => session.id)).toEqual([
    'session-a',
    'other-system',
    'other-result',
  ]);
});
