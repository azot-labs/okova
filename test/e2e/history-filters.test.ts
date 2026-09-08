import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';

test('filters and ordering control visible history and both export formats', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-history-filters-'));
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
      const records: KeyInfo[] = [
        {
          id: 'a'.repeat(32),
          value: '1'.repeat(32),
          drmSystem: 'W',
          createdAt: Date.parse('2026-03-08T05:00:00Z'),
          url: 'https://watch.example/first',
          pssh: '',
        },
        {
          id: 'b'.repeat(32),
          value: '2'.repeat(32),
          drmSystem: 'P',
          createdAt: Date.parse('2026-03-09T03:59:59Z'),
          url: 'https://watch.example/second',
          pssh: '',
        },
        {
          id: 'c'.repeat(32),
          value: '3'.repeat(32),
          drmSystem: 'W',
          createdAt: Date.parse('2026-03-09T04:00:00Z'),
          url: 'https://watch.example/third',
          pssh: '',
        },
      ];
      const save = () =>
        worker.evaluate(async (records) => {
          await browser.storage.local.set({ 'all-keys': JSON.stringify(records) });
        }, records);
      await save();
      const popup = await context.newPage();
      await popup.addInitScript(() =>
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined }),
      );
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await popup.getByRole('link', { name: 'Keys', exact: true }).click();
      const visible = () => popup.locator('[data-history-row] code').allTextContents();
      const pair = (key: KeyInfo) => `${key.id}:${key.value}`;
      await expect.poll(visible).toEqual([...records].reverse().map(pair));
      await popup.getByLabel('Order', { exact: true }).selectOption('oldest');
      await expect.poll(visible).toEqual(records.map(pair));
      await popup.getByRole('button', { name: 'Search', exact: true }).click();
      await popup.getByRole('searchbox').fill('WATCH.EXAMPLE');
      await popup.getByRole('searchbox').press('Tab');
      await popup.getByLabel('DRM', { exact: true }).selectOption('W');
      await expect.poll(visible).toEqual([records[0]!, records[2]!].map(pair));
      await popup.getByRole('button', { name: 'Select All', exact: true }).click();
      await expect.poll(() => popup.getByRole('status').textContent()).toBe('(2/3)');
      await popup.getByRole('button', { name: 'Search', exact: true }).click();
      await popup.getByRole('searchbox').fill('first');
      await expect.poll(visible).toEqual([pair(records[0]!)]);
      await expect.poll(() => popup.getByRole('status').textContent()).toBe('(1/3)');
      for (const format of ['JSON', 'TXT']) {
        const downloaded = popup.waitForEvent('download');
        await popup.getByRole('button', { name: format, exact: true }).click();
        const download = await downloaded;
        const path = await download.path();
        if (!path) throw new Error('Missing export download');
        const content = await readFile(path, 'utf8');
        if (format === 'JSON')
          expect(JSON.parse(content)).toEqual({ version: 1, records: [records[0]] });
        else expect(content).toBe(`${pair(records[0]!)}\n`);
      }
      records.push({
        ...records[0]!,
        id: 'd'.repeat(32),
        createdAt: Date.parse('2026-03-08T10:00:00Z'),
      });
      await save();
      await expect.poll(visible).toEqual([pair(records[0]!), pair(records[3]!)]);
      await mkdir(resolve('output/playwright/history-filters'), { recursive: true });
      await popup.screenshot({
        path: resolve('output/playwright/history-filters/filtered.png'),
        fullPage: true,
      });
      expect(
        await popup.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await popup.getByRole('button', { name: /^Delete Selected \(/ }).click();
      await expect.poll(() => popup.getByRole('dialog').isVisible()).toBe(true);
      await popup.getByRole('button', { name: 'Cancel', exact: true }).click();
      await popup.getByLabel('DRM', { exact: true }).selectOption('C');
      await expect.poll(visible).toEqual([]);
      expect(await popup.getByRole('button', { name: 'JSON', exact: true }).isDisabled()).toBe(
        true,
      );
      expect(await popup.getByLabel('DRM', { exact: true }).isVisible()).toBe(true);
      expect(await popup.getByLabel('Order', { exact: true }).isVisible()).toBe(true);
      await popup.getByLabel('DRM', { exact: true }).selectOption('W');
      await expect.poll(visible).toEqual([pair(records[0]!), pair(records[3]!)]);
      await popup.getByLabel('DRM', { exact: true }).selectOption('C');
      await popup.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
      await expect
        .poll(visible)
        .toEqual([records[0]!, records[3]!, records[1]!, records[2]!].map(pair));
      expect(
        await popup.getByRole('button', { name: 'Search', exact: true }).getAttribute('title'),
      ).toBe('Search');
      expect(await popup.getByLabel('DRM', { exact: true }).inputValue()).toBe('all');
      expect(await popup.getByLabel('Order', { exact: true }).inputValue()).toBe('oldest');
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
