import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';

test('deletes whole captures across history, sessions, and page manifests', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-capture-deletion-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 500, height: 600 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await context.route('https://example.test/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<title>Capture deletion</title>' }),
    );
    const source = await context.newPage();
    await source.goto('https://example.test/watch');
    await source.evaluate(() => {
      window.MANIFEST_LIST = new Map([
        [
          'https://example.test/movie.mpd',
          { url: 'https://example.test/movie.mpd', kind: 'dash', children: [], requestUrls: [] },
        ],
        [
          'https://example.test/master.m3u8',
          {
            url: 'https://example.test/master.m3u8',
            kind: 'hls-master',
            children: ['https://example.test/audio.m3u8'],
            requestUrls: [],
          },
        ],
        [
          'https://example.test/audio.m3u8',
          {
            url: 'https://example.test/audio.m3u8',
            kind: 'hls-media',
            children: [],
            requestUrls: [],
          },
        ],
      ]);
    });
    const tabId = await worker.evaluate(
      async () => (await browser.tabs.query({ url: 'https://example.test/watch' }))[0]!.id!,
    );
    const base: KeyInfo = {
      id: 'a'.repeat(32),
      value: 'b'.repeat(32),
      url: 'https://example.test/watch',
      mpd: 'https://example.test/movie.mpd',
      pssh: '',
      captureId: 'session-a',
      createdAt: 100,
    };
    const other = {
      ...base,
      captureId: 'other-session',
      mpd: 'https://other.test/other.mpd',
      url: 'https://other.test/watch',
    };
    const records = [base, { ...base, captureId: 'session-b', id: 'c'.repeat(32) }, other];
    await worker.evaluate(
      async ({ tabId, records }) => {
        await browser.storage.local.set({
          'all-keys': JSON.stringify(records),
          'recent-keys': JSON.stringify(records),
          'recent-keys-by-domain': JSON.stringify({
            'example.test': records.slice(0, 2),
            'other.test': records.slice(2),
          }),
        });
        await browser.storage.session.set({
          [`capture-diagnostics:${tabId}`]: ['session-a', 'session-b', 'failed-session'].map(
            (captureId) => ({
              captureId,
              owner: 'test',
              createdAt: 100,
              origin: 'https://example.test',
              frameOrigin: 'https://example.test',
              frameId: 0,
              documentId: 'test',
              keySystem: 'com.widevine.alpha',
              credential: null,
              sessionId: null,
              outcome: 'failed',
              keyCount: 0,
              events: [],
            }),
          ),
        });
      },
      { tabId, records },
    );
    const popup = await context.newPage();
    const errors: string[] = [];
    popup.on('pageerror', (error) => errors.push(error.message));
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await worker.evaluate((id) => browser.tabs.update(id, { active: true }), tabId);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await expect.poll(() => popup.locator('[data-capture-row]').count()).toBe(4);
    const movie = popup.locator('[data-capture-row]').filter({ hasText: 'movie.mpd' });
    await movie.getByRole('checkbox').check();
    await popup.getByRole('button', { name: 'Delete Selected (1)', exact: true }).click();
    const dialog = popup.getByRole('dialog');
    expect(await dialog.getByRole('heading').innerText()).toBe('Delete 1 capture?');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    expect(await popup.locator('[data-capture-row]').count()).toBe(4);
    await popup.getByRole('button', { name: 'Delete Selected (1)', exact: true }).click();
    const arriving = {
      ...base,
      captureId: 'new-session',
      mpd: 'https://example.test/new.mpd',
      createdAt: 200,
    };
    await worker.evaluate(async (record) => {
      const stored = (await browser.storage.local.get('all-keys'))['all-keys'];
      if (typeof stored !== 'string') throw new Error('Missing history');
      await browser.storage.local.set({
        'all-keys': JSON.stringify([
          ...JSON.parse(stored),
          {
            ...record,
            captureId: 'session-a',
            mpd: 'https://example.test/movie.mpd',
            id: 'f'.repeat(32),
          },
          record,
        ]),
      });
    }, arriving);
    await mkdir(resolve('output/playwright/capture-deletion'), { recursive: true });
    await popup.screenshot({
      path: resolve('output/playwright/capture-deletion/confirmation.png'),
    });
    await dialog.getByRole('button', { name: 'Delete 1 capture', exact: true }).click();
    await expect.poll(() => movie.count()).toBe(0);
    await expect.poll(() => popup.locator('[data-capture-row]').count()).toBe(4);
    const saved = await worker.evaluate(async () =>
      browser.storage.local.get(['all-keys', 'recent-keys', 'recent-keys-by-domain']),
    );
    if (
      typeof saved['all-keys'] !== 'string' ||
      typeof saved['recent-keys'] !== 'string' ||
      typeof saved['recent-keys-by-domain'] !== 'string'
    )
      throw new Error('Missing history stores');
    expect(JSON.parse(saved['all-keys'])).toEqual([other, arriving]);
    expect(JSON.parse(saved['recent-keys'])).toEqual([other]);
    expect(JSON.parse(saved['recent-keys-by-domain'])['example.test']).toEqual([]);
    expect(
      await worker.evaluate(async (tabId) => {
        const records = (await browser.storage.session.get(`capture-diagnostics:${tabId}`))[
          `capture-diagnostics:${tabId}`
        ];
        if (!Array.isArray(records)) throw new Error('Missing diagnostics');
        return records.map((record: { captureId: string }) => record.captureId);
      }, tabId),
    ).toEqual(['failed-session']);
    expect(
      await source.evaluate(() => window.MANIFEST_LIST.has('https://example.test/movie.mpd')),
    ).toBe(false);
    await popup.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect.poll(() => movie.count()).toBe(0);
    const master = popup.locator('[data-capture-row]').filter({ hasText: 'master.m3u8' });
    await master.getByRole('checkbox').check();
    await popup.getByRole('button', { name: 'Delete Selected (1)', exact: true }).click();
    await dialog.getByRole('button', { name: 'Delete 1 capture', exact: true }).click();
    await expect.poll(() => master.count()).toBe(0);
    expect(await source.evaluate(() => window.MANIFEST_LIST.size)).toBe(0);
    const failed = popup.locator('[data-capture-row]').filter({ hasText: 'Manifest not detected' });
    await failed.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
    await failed.getByRole('checkbox').check();
    await popup.getByRole('button', { name: 'Delete Selected (1)', exact: true }).click();
    await dialog.getByRole('button', { name: 'Delete 1 capture', exact: true }).click();
    await expect.poll(() => failed.count()).toBe(0);
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await expect.poll(() => popup.locator('[data-capture-row]').count()).toBe(2);
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('button', { name: 'Delete Site Captures', exact: true }).click();
    expect(await dialog.getByRole('heading').innerText()).toBe('Delete 1 capture?');
    await dialog.getByRole('button', { name: 'Delete 1 capture', exact: true }).click();
    await expect
      .poll(async () => {
        const stored = (await worker.evaluate(() => browser.storage.local.get('all-keys')))[
          'all-keys'
        ];
        return typeof stored === 'string' ? JSON.parse(stored).length : -1;
      })
      .toBe(1);
    await worker.evaluate(
      async (records) => browser.storage.local.set({ 'all-keys': JSON.stringify(records) }),
      [other, { ...arriving, url: 'https://sub.example.test/watch' }],
    );
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await popup.getByRole('combobox', { name: 'Site', exact: true }).selectOption('other.test');
    await popup.getByRole('button', { name: 'Delete All', exact: true }).click();
    expect(await dialog.getByRole('heading').innerText()).toBe('Delete 2 captures?');
    await dialog.getByRole('button', { name: 'Delete 2 captures', exact: true }).click();
    await expect.poll(() => popup.locator('[data-capture-row]').count()).toBe(0);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
