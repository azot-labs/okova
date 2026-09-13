import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';

test('dashboard combines search, DRM and order within recent site captures and follows live updates', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-dashboard-filters-'));
  const extension = resolve('.output/chrome-mv3');
  try {
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      headless: true,
      viewport: { width: 500, height: 600 },
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const widevine: KeyInfo = {
        id: 'aabbccdd11223344556677889900aabb',
        value: '1'.repeat(32),
        url: 'https://watch.example/first',
        mpd: 'https://cdn.example/movie.mpd',
        pssh: '',
        drmSystem: 'W',
        createdAt: 1_000,
      };
      const playready: KeyInfo = {
        ...widevine,
        id: 'b'.repeat(32),
        drmSystem: 'P',
        createdAt: 2_000,
      };
      const otherSite = { ...widevine, url: 'https://other.example/watch', createdAt: 4_000 };
      const olderCapture = { ...widevine, id: 'd'.repeat(32), createdAt: 500 };
      const save = (recent: KeyInfo[]) =>
        worker.evaluate(
          async ({ recent, otherSite, olderCapture }) => {
            await browser.storage.local.set({
              'all-keys': JSON.stringify([...recent, otherSite, olderCapture]),
              'recent-keys': JSON.stringify([otherSite]),
              'recent-keys-by-domain': JSON.stringify({
                'watch.example': recent,
                'other.example': [otherSite],
              }),
            });
          },
          { recent, otherSite, olderCapture },
        );
      await save([widevine, playready]);
      const popup = await context.newPage();
      const errors: string[] = [];
      popup.on('pageerror', (error) => errors.push(error.message));
      await popup.addInitScript(() => {
        const query = browser.tabs.query.bind(browser.tabs);
        browser.tabs.query = async (options) =>
          (await query(options)).map((tab) => ({ ...tab, url: 'https://watch.example/first' }));
      });
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      const visible = () => popup.locator('[data-history-row] code').allTextContents();
      const pair = (key: KeyInfo) => `${key.id}:${key.value}`;
      await expect.poll(visible).toEqual([playready, widevine].map(pair));
      await popup.getByLabel('Order', { exact: true }).selectOption('oldest');
      await expect.poll(visible).toEqual([widevine, playready].map(pair));
      await popup.getByLabel('DRM', { exact: true }).selectOption('W');
      await expect.poll(visible).toEqual([pair(widevine)]);
      await popup.getByRole('button', { name: 'Search', exact: true }).click();
      await popup.getByRole('searchbox').fill('AABB-CCDD');
      await expect.poll(visible).toEqual([pair(widevine)]);
      await popup.getByRole('searchbox').fill('MOVIE.MPD');
      await popup.getByRole('searchbox').press('Escape');
      expect(
        await popup
          .getByRole('button', { name: 'Search', exact: true })
          .evaluate((element) => element === document.activeElement),
      ).toBe(true);
      const incoming = { ...widevine, id: 'c'.repeat(32), createdAt: 3_000 };
      await save([widevine, playready, incoming]);
      await expect.poll(visible).toEqual([widevine, incoming].map(pair));
      await popup.getByLabel('DRM', { exact: true }).selectOption('unknown');
      await expect.poll(visible).toEqual([]);
      expect(await popup.getByRole('heading', { name: 'No matching keys' }).isVisible()).toBe(true);
      expect(await popup.getByLabel('DRM', { exact: true }).isVisible()).toBe(false);
      await popup.getByRole('button', { name: 'Clear filters', exact: true }).click();
      await expect.poll(visible).toEqual([widevine, playready, incoming].map(pair));
      expect(await popup.getByLabel('Order', { exact: true }).inputValue()).toBe('oldest');
      expect(await popup.getByLabel('DRM', { exact: true }).inputValue()).toBe('all');
      expect(
        await popup.getByRole('button', { name: 'Search', exact: true }).getAttribute('title'),
      ).toBe('Search');
      const section = popup
        .locator('section')
        .filter({ has: popup.getByLabel('DRM', { exact: true }) });
      expect(await section.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      );
      await mkdir(resolve('output/playwright/dashboard-filters'), { recursive: true });
      await popup.screenshot({ path: resolve('output/playwright/dashboard-filters/controls.png') });
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
