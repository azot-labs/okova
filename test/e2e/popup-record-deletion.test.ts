import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import { readStoredCaptures } from './capture-storage';

test('manifest-only captures update live, survive tab closure, and delete by stable identity', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-capture-deletion-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 500, height: 700 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await expect
      .poll(() =>
        worker.evaluate(async () => (await browser.storage.local.get('settings')).settings),
      )
      .toBeTruthy();
    await context.route('https://example.test/**', (route) => {
      const url = route.request().url();
      return route.fulfill({
        contentType: url.endsWith('.m3u8')
          ? 'application/vnd.apple.mpegurl'
          : url.endsWith('.mpd')
            ? 'application/dash+xml'
            : 'text/html',
        body: url.endsWith('master.m3u8')
          ? '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1000\naudio.m3u8\n'
          : url.endsWith('audio.m3u8')
            ? '#EXTM3U\n#EXTINF:4,\naudio.ts\n'
            : url.endsWith('.mpd')
              ? '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"/>'
              : '<title>Capture lifecycle</title>',
      });
    });
    const source = await context.newPage();
    await source.goto('https://example.test/watch');
    const tabId = await worker.evaluate(
      async () => (await browser.tabs.query({ url: 'https://example.test/watch' }))[0]!.id!,
    );
    const popup = await context.newPage();
    await worker.evaluate((id) => browser.tabs.update(id, { active: true }), tabId);
    const popupUrl = `chrome-extension://${new URL(worker.url()).hostname}/popup.html`;
    await popup.goto(popupUrl);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    const captures = popup.locator('[data-capture-row]');
    expect(await captures.count()).toBe(0);
    await source.evaluate(async () => {
      await fetch('/master.m3u8');
      await fetch('/audio.m3u8');
      await fetch('/movie.mpd');
    });
    await expect.poll(() => captures.count()).toBe(2);
    const master = captures.filter({ hasText: 'master.m3u8' });
    await expect.poll(() => master.textContent()).toContain('1 child playlist');
    await master.getByRole('checkbox').check();
    await popup.getByRole('button', { name: 'Delete (1)', exact: true }).click();
    const dialog = popup.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    expect(await captures.count()).toBe(2);
    await popup.getByRole('button', { name: 'Delete (1)', exact: true }).click();
    // A new capture after the confirmation snapshot must survive deletion.
    await source.evaluate(async () => {
      await fetch('/new.mpd');
    });
    await expect.poll(async () => (await readStoredCaptures(worker)).length).toBe(3);
    await dialog.getByRole('button', { name: 'Delete 1 capture', exact: true }).click();
    await expect.poll(() => captures.count()).toBe(2);
    expect(
      await source.evaluate(() => window.MANIFEST_LIST.has('https://example.test/audio.m3u8')),
    ).toBe(false);
    await source.evaluate(async () => {
      await fetch('/master.m3u8');
      await fetch('/audio.m3u8');
    });
    await popup.getByRole('button', { name: 'Refresh', exact: true }).click();
    expect(await captures.count()).toBe(2);
    await source.close();
    await popup.goto(popupUrl);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await expect.poll(() => captures.count()).toBe(2);
    await captures
      .filter({ hasText: 'movie.mpd' })
      .locator(':scope > summary')
      .click({ position: { x: 8, y: 8 } });
    await mkdir('output/playwright/capture-history', { recursive: true });
    await popup.screenshot({
      path: 'output/playwright/capture-history/persisted.png',
      fullPage: true,
    });
    await popup.getByRole('button', { name: 'Delete All', exact: true }).click();
    await dialog.getByRole('button', { name: 'Delete 2 captures', exact: true }).click();
    await expect.poll(async () => (await readStoredCaptures(worker)).length).toBe(0);
    expect(
      await worker.evaluate(
        async () =>
          await browser.storage.local.get(['all-keys', 'recent-keys', 'recent-keys-by-domain']),
      ),
    ).toEqual({});
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
