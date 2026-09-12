import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';

test('saved keys filter immediately by KID, page URL, and manifest URL', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-key-search-'));
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
      const keys: KeyInfo[] = [
        {
          id: 'AABBCCDD11223344556677889900AABB',
          value: '00112233445566778899aabbccddeeff',
          url: 'https://Watch.Example/Some-Show',
          mpd: 'https://CDN.Example/Video/Manifest.mpd',
          pssh: '',
          createdAt: Date.now(),
        },
        {
          id: '12345678-abcd-ef90-1234-567890abcdef',
          value: 'ffeeddccbbaa99887766554433221100',
          url: 'https://other.example/watch',
          pssh: '',
          createdAt: Date.now(),
        },
      ];
      await worker.evaluate(async (keys) => {
        await browser.storage.local.set({ 'all-keys': JSON.stringify(keys) });
      }, keys);
      const popup = await context.newPage();
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await popup.getByRole('link', { name: 'Captures', exact: true }).click();
      const searchButton = popup.getByRole('button', { name: 'Search', exact: true });
      const search = popup.getByRole('searchbox', { name: 'Search' });
      expect(await search.isVisible()).toBe(false);
      await searchButton.click();
      expect(await search.evaluate((input) => input === document.activeElement)).toBe(true);
      expect(await popup.getByLabel('DRM', { exact: true }).isVisible()).toBe(false);
      expect(await popup.getByLabel('Site', { exact: true }).isVisible()).toBe(false);
      expect(await popup.getByLabel('Order', { exact: true }).isVisible()).toBe(false);
      const count = popup.getByRole('status');
      await expect.poll(() => count.textContent()).toBe('(2)');
      await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(2);
      const manifestLink = popup
        .locator('[data-history-row]')
        .filter({ hasText: keys[0]!.id })
        .locator('a');
      for (const mpd of [
        'https://cdn.example/updated.m3u8',
        'javascript:alert(1)',
        keys[0]!.mpd!,
      ]) {
        const updated = [{ ...keys[0]!, mpd }, keys[1]!];
        await worker.evaluate(async (records) => {
          await browser.storage.local.set({ 'all-keys': JSON.stringify(records) });
        }, updated);
        const href = mpd.startsWith('javascript:') ? keys[0]!.url : mpd;
        await expect.poll(() => manifestLink.getAttribute('href')).toBe(href);
        expect(await manifestLink.getAttribute('title')).toBe(href);
        expect(await manifestLink.textContent()).toBe(href.replace('https://', ''));
      }
      for (const query of [
        'aabbccdd-1122-3344-5566-77889900aabb',
        ' DD-1122 ',
        'WATCH.EXAMPLE',
        'some-show',
        'cdn.example/video',
        'MANIFEST.MPD',
      ]) {
        await search.fill(query);
        await expect.poll(() => count.textContent()).toBe('(2)');
        await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(1);
        expect(await popup.locator('code').allTextContents()).toEqual([
          `${keys[0]!.id}:${keys[0]!.value}`,
        ]);
      }
      await search.press('Tab');
      expect(await search.isVisible()).toBe(false);
      expect(await searchButton.getAttribute('title')).toBe('Search: MANIFEST.MPD');
      expect(await searchButton.getAttribute('class')).toContain('text-blue-600');
      expect(await popup.getByLabel('DRM', { exact: true }).isVisible()).toBe(true);
      expect(await popup.getByLabel('Site', { exact: true }).isVisible()).toBe(true);
      expect(await popup.getByLabel('Order', { exact: true }).isVisible()).toBe(true);
      await expect.poll(() => count.textContent()).toBe('(2)');
      await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(1);
      await searchButton.click();
      expect(await search.inputValue()).toBe('MANIFEST.MPD');
      await search.fill('5678ABCDEF90');
      await expect.poll(() => count.textContent()).toBe('(2)');
      await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(1);
      expect(await popup.locator('code').allTextContents()).toEqual([
        `${keys[1]!.id}:${keys[1]!.value}`,
      ]);
      for (const query of ['missing.example', '---', keys[0]!.value]) {
        await search.fill(query);
        await expect.poll(() => count.textContent()).toBe('(2)');
        await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(0);
        expect(await popup.getByRole('heading', { name: 'No matching keys' }).isVisible()).toBe(
          true,
        );
        expect(await popup.locator('code').count()).toBe(0);
      }
      await mkdir(resolve('output/playwright/key-search'), { recursive: true });
      await popup.screenshot({ path: resolve('output/playwright/key-search/no-matches.png') });
      await popup.getByRole('button', { name: 'Clear filters', exact: true }).click();
      await expect.poll(() => count.textContent()).toBe('(2)');
      await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(2);
      expect(await searchButton.getAttribute('title')).toBe('Search');
      await searchButton.click();
      expect(await search.inputValue()).toBe('');
      await search.fill('   ');
      await expect.poll(() => count.textContent()).toBe('(2)');
      await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(2);
      await search.fill('');
      await search.press('Escape');
      expect(await search.isVisible()).toBe(false);
      expect(await searchButton.evaluate((button) => button === document.activeElement)).toBe(true);
      expect(await searchButton.getAttribute('class')).not.toContain('text-blue-600');
      await popup.screenshot({ path: resolve('output/playwright/key-search/all-keys.png') });
      await popup.getByRole('button', { name: 'Delete All', exact: true }).click();
      await popup
        .getByRole('dialog')
        .getByRole('button', { name: 'Delete 2 records', exact: true })
        .click();
      await expect.poll(() => count.textContent()).toBe('(0)');
      await expect.poll(() => popup.locator('[data-history-row]').count()).toBe(0);
      expect(await popup.getByRole('heading', { name: 'Keys will appear here' }).isVisible()).toBe(
        true,
      );
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
