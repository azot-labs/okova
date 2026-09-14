import { seedKeyRecords } from './capture-storage';
import type { KeyInfo } from '../../src/extension/utils/storage';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

test('groups captures by manifest or session and embeds existing record details', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-streams-'));
  const extension = resolve('.output/chrome-mv3');
  const screenshots = resolve('output/playwright/captures');
  const server = createServer();
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 500, height: 600 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    await mkdir(screenshots, { recursive: true });
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await expect
      .poll(() =>
        worker.evaluate(async () => (await browser.storage.local.get('settings')).settings),
      )
      .toBeTruthy();
    await worker.evaluate(async () => {
      await browser.storage.local.set({
        settings: JSON.stringify({
          spoofing: false,
          emeInterception: false,
          clientPlayback: false,
          requestInterception: true,
          theme: 'light',
        }),
      });
    });
    await expect
      .poll(() =>
        worker.evaluate(
          async () =>
            (
              await browser.scripting.getRegisteredContentScripts({ ids: ['okova-interception'] })
            )[0]?.js,
        ),
      )
      .toEqual(['network.js']);
    server.on('request', (request, response) => {
      const path = request.url?.split('?')[0];
      if (path === '/live/master.m3u8') {
        response.setHeader('content-type', 'application/vnd.apple.mpegurl');
        response.end('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000\nmedia-start');
      } else if (path === '/live/media-start') {
        response.writeHead(302, { location: '/live/720p.m3u8?signature=child-token' });
        response.end();
      } else if (path === '/live/720p.m3u8') {
        response.setHeader('content-type', 'application/vnd.apple.mpegurl');
        response.end('#EXTM3U\n#EXTINF:4,\nsegment.ts');
      } else if (path === '/stream') {
        response.setHeader('content-type', 'application/dash+xml');
        response.end('<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"><Period/></MPD>');
      } else {
        response.setHeader('content-type', 'text/html');
        response.end(
          `<!doctype html><title>Stream observation demo</title>${path === '/watch' ? '<iframe src="/embedded"></iframe>' : ''}`,
        );
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing local server address');
    const origin = `http://127.0.0.1:${address.port}`;
    const master = `${origin}/live/master.m3u8?signature=exact-master-token`;
    const dash = `${origin}/stream?id=sample-film&signature=exact-dash-token`;
    const page = await context.newPage();
    await page.goto(`${origin}/watch`);
    await page.evaluate(
      async ({ master, dash }) => {
        await fetch('/live/media-start');
        await fetch(master);
        await fetch(master);
        await fetch(dash);
      },
      { master, dash },
    );
    const embedded = page.frames().find((frame) => frame.url() === `${origin}/embedded`);
    if (!embedded) throw new Error('Missing embedded player');
    await embedded.evaluate(async (url) => {
      await fetch(url);
    }, dash);
    await expect.poll(() => page.evaluate(() => window.MANIFEST_LIST.size)).toBe(3);
    await expect.poll(() => embedded.evaluate(() => window.MANIFEST_LIST.size)).toBe(1);
    const sourceId = await worker.evaluate(
      async (url) => (await browser.tabs.query({ url }))[0]?.id,
      `${origin}/watch`,
    );
    if (sourceId === undefined) throw new Error('Missing source tab');
    const popup = await context.newPage();
    const errors: string[] = [];
    popup.on('pageerror', (error) => errors.push(error.message));
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await worker.evaluate(async (id) => {
      await browser.tabs.update(id, { active: true });
    }, sourceId);
    await popup.screenshot({
      animations: 'disabled',
      path: join(screenshots, 'dashboard-light.png'),
    });
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    const records = popup.locator('[data-capture-row]');
    await expect.poll(() => records.count()).toBe(3);
    expect(await records.filter({ hasText: '1 child playlist' }).count()).toBe(1);
    expect(
      await worker.evaluate(async () => (await browser.storage.local.get('all-keys'))['all-keys']),
    ).toBeUndefined();
    await popup.screenshot({ animations: 'disabled', path: join(screenshots, 'list-light.png') });
    const masterRecord = records.filter({ hasText: 'master.m3u8' });
    await masterRecord.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
    await expect
      .poll(() => masterRecord.textContent())
      .toContain('/live/720p.m3u8?signature=child-token');
    expect(await masterRecord.locator('a').first().getAttribute('href')).toContain('master.m3u8');
    await popup.screenshot({
      animations: 'disabled',
      path: join(screenshots, 'details-light.png'),
    });
    await popup.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect
      .poll(() => popup.getByRole('button', { name: 'Refresh', exact: true }).isEnabled())
      .toBe(true);
    expect(await masterRecord.getAttribute('open')).not.toBeNull();
    expect(await records.count()).toBe(3);
    await worker.evaluate(async () => {
      const stored = (await browser.storage.local.get('settings')).settings;
      if (typeof stored !== 'string') throw new Error('Missing settings');
      await browser.storage.local.set({
        settings: JSON.stringify({ ...JSON.parse(stored), theme: 'dark' }),
      });
    });
    // Existing settings state refreshes on popup initialization.
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await expect.poll(() => records.count()).toBe(3);
    await expect.poll(() => popup.locator('html').getAttribute('class')).toContain('dark');
    await masterRecord.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
    await popup.screenshot({ animations: 'disabled', path: join(screenshots, 'details-dark.png') });
    expect(await popup.evaluate(() => document.documentElement.scrollWidth)).toBe(500);

    // Saved captures survive both embedded-frame and top-level navigation.
    await embedded.goto(`${origin}/empty-frame`);
    await expect.poll(() => records.count()).toBe(3);
    await page.goto(`${origin}/empty`);
    await expect.poll(() => records.count()).toBe(3);
    await popup.getByRole('button', { name: 'Delete All', exact: true }).click();
    await popup
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete 3 captures', exact: true })
      .click();
    await expect.poll(() => records.count()).toBe(0);
    expect(
      await popup.getByText('No captures yet. Start playback to get it.', { exact: true }).count(),
    ).toBe(1);
    expect(await popup.getByRole('button', { name: 'Select All', exact: true }).isDisabled()).toBe(
      true,
    );
    await popup.screenshot({ animations: 'disabled', path: join(screenshots, 'empty-dark.png') });

    await worker.evaluate(async () => {
      const stored = (await browser.storage.local.get('settings')).settings;
      if (typeof stored !== 'string') throw new Error('Missing settings');
      await browser.storage.local.set({
        settings: JSON.stringify({ ...JSON.parse(stored), requestInterception: false }),
      });
    });
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await expect.poll(() => popup.getByText(/Request interception is off/).count()).toBe(1);
    await popup.screenshot({
      animations: 'disabled',
      path: join(screenshots, 'disabled-dark.png'),
    });
    const metadataRecords: KeyInfo[] = [
      { id: '10000000000000000000000000000001', captureId: 'session-audio', mpd: master },
      { id: '10000000000000000000000000000002', captureId: 'session-video', mpd: master },
      { id: '20000000000000000000000000000001', captureId: 'session-unresolved' },
      { id: '20000000000000000000000000000002', captureId: 'session-unresolved' },
      { id: '30000000000000000000000000000001', captureId: 'session-separate' },
    ].map((record) => ({
      ...record,
      value: 'usable',
      url: `${origin}/watch`,
      pssh: '',
      createdAt: Date.now(),
      drmSystem: 'W' as const,
    }));
    await seedKeyRecords(worker, metadataRecords);
    await worker.evaluate(async () => {
      const stored = (await browser.storage.local.get('settings')).settings;
      if (typeof stored !== 'string') throw new Error('Missing settings');
      await browser.storage.local.set({
        settings: JSON.stringify({
          ...JSON.parse(stored),
          theme: 'light',
          requestInterception: true,
        }),
      });
    });
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    expect(await popup.getByRole('link', { name: 'Streams', exact: true }).count()).toBe(0);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await expect.poll(() => records.count()).toBe(3);
    await popup.screenshot({
      animations: 'disabled',
      path: join(screenshots, 'grouped-light.png'),
    });
    const saved = records.filter({ hasText: 'master.m3u8' });
    await saved.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
    await expect.poll(() => saved.locator('[data-key-record]').count()).toBe(2);
    await popup.screenshot({
      animations: 'disabled',
      path: join(screenshots, 'key-ids-light.png'),
    });
    expect(await saved.locator('[data-capture-session]').count()).toBeGreaterThan(0);
    await popup.getByRole('button', { name: 'Search', exact: true }).click();
    await popup
      .getByRole('searchbox', { name: 'Search', exact: true })
      .fill(metadataRecords[0]!.id);
    await expect.poll(() => records.count()).toBe(1);
    // A matching key ID keeps its sibling visible and selects the complete capture.
    expect(await saved.locator('[data-key-record]').count()).toBe(2);
    await popup.getByRole('searchbox', { name: 'Search', exact: true }).press('Escape');
    await saved.getByRole('checkbox').check();
    await popup.getByRole('button', { name: 'Delete (1)', exact: true }).click();
    await expect
      .poll(() => popup.getByRole('heading', { name: 'Delete 1 capture?', exact: true }).count())
      .toBe(1);
    await popup.getByRole('button', { name: 'Cancel', exact: true }).click();
    await popup.getByRole('button', { name: 'Deselect All', exact: true }).click();
    await popup.getByRole('button', { name: 'Search', exact: true }).click();
    await popup.getByRole('searchbox', { name: 'Search', exact: true }).fill('');
    await popup.getByRole('searchbox', { name: 'Search', exact: true }).press('Escape');
    await expect.poll(() => records.count()).toBe(3);
    const unresolved = records.filter({ hasText: 'Manifest not detected' }).first();
    await unresolved.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
    await expect.poll(() => unresolved.locator('[data-key-record]').count()).toBe(2);
    expect(await unresolved.textContent()).toContain('session-unresolved');
    await saved.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
    await unresolved.scrollIntoViewIfNeeded();
    await popup.screenshot({
      animations: 'disabled',
      path: join(screenshots, 'session-fallback-light.png'),
    });
    await worker.evaluate(async () => {
      const stored = (await browser.storage.local.get('settings')).settings;
      if (typeof stored !== 'string') throw new Error('Missing settings');
      await browser.storage.local.set({
        settings: JSON.stringify({ ...JSON.parse(stored), theme: 'dark' }),
      });
    });
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await expect.poll(() => records.count()).toBe(3);
    await saved.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
    await expect.poll(() => saved.locator('[data-key-record]').count()).toBe(2);
    await popup.screenshot({ animations: 'disabled', path: join(screenshots, 'key-ids-dark.png') });
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(profile, { recursive: true, force: true });
  }
});
