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
      await popup.getByRole('link', { name: 'Keys', exact: true }).click();
      const search = popup.getByRole('searchbox', { name: 'Search by KID or site' });
      const count = popup.getByRole('status');
      await expect.poll(() => count.textContent()).toBe('2 / 2 keys');
      for (const query of [
        'aabbccdd-1122-3344-5566-77889900aabb',
        ' DD-1122 ',
        'WATCH.EXAMPLE',
        'some-show',
        'cdn.example/video',
        'MANIFEST.MPD',
      ]) {
        await search.fill(query);
        await expect.poll(() => count.textContent()).toBe('1 / 2 keys');
        expect(await popup.locator('code').allTextContents()).toEqual([
          `${keys[0]!.id}:${keys[0]!.value}`,
        ]);
      }
      await search.fill('5678ABCDEF90');
      await expect.poll(() => count.textContent()).toBe('1 / 2 keys');
      expect(await popup.locator('code').allTextContents()).toEqual([
        `${keys[1]!.id}:${keys[1]!.value}`,
      ]);
      for (const query of ['missing.example', '---', keys[0]!.value]) {
        await search.fill(query);
        await expect.poll(() => count.textContent()).toBe('0 / 2 keys');
        expect(await popup.getByRole('heading', { name: 'No matching keys' }).isVisible()).toBe(
          true,
        );
        expect(await popup.locator('code').count()).toBe(0);
      }
      await mkdir(resolve('output/playwright/key-search'), { recursive: true });
      await popup.screenshot({ path: resolve('output/playwright/key-search/no-matches.png') });
      await popup.getByRole('button', { name: 'Clear search', exact: true }).click();
      await expect.poll(() => count.textContent()).toBe('2 / 2 keys');
      expect(await search.inputValue()).toBe('');
      await search.fill('   ');
      await expect.poll(() => count.textContent()).toBe('2 / 2 keys');
      await search.fill('');
      await popup.screenshot({ path: resolve('output/playwright/key-search/all-keys.png') });
      await popup.getByRole('button', { name: 'Delete All', exact: true }).click();
      await popup
        .getByRole('dialog')
        .getByRole('button', { name: 'Delete 2 records', exact: true })
        .click();
      await expect.poll(() => count.textContent()).toBe('0 / 0 keys');
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
