import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';

test('deletes records immediately, updates history and recent keys, and restores the empty list', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-record-deletion-'));
  const extension = resolve('.output/chrome-mv3');
  try {
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      headless: true,
      viewport: { width: 500, height: 650 },
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const key: KeyInfo = {
        id: '00112233445566778899aabbccddeeff',
        value: 'ffeeddccbbaa99887766554433221100',
        url: 'https://example.com/first',
        pssh: 'cHNzaA==',
        createdAt: Date.now(),
      };
      const otherPage = { ...key, url: 'https://example.com/second' };
      await worker.evaluate(
        async (records) => {
          await browser.storage.local.set({
            'all-keys': JSON.stringify(records),
            'recent-keys': JSON.stringify(records),
            'recent-keys-by-domain': JSON.stringify({ 'example.com': records }),
          });
        },
        [key, otherPage],
      );
      const popup = await context.newPage();
      const errors: string[] = [];
      popup.on('pageerror', (error) => errors.push(error.message));
      popup.on('dialog', async (dialog) => {
        errors.push(`Unexpected ${dialog.type()} dialog`);
        await dialog.dismiss();
      });
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      const dashboard = await context.newPage();
      await dashboard.addInitScript(() => {
        const query = browser.tabs.query.bind(browser.tabs);
        browser.tabs.query = async (options) =>
          (await query(options)).map((tab) => ({ ...tab, url: 'https://example.com/first' }));
      });
      await dashboard.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await expect.poll(() => dashboard.locator('code').count()).toBe(2);
      await popup.getByRole('link', { name: 'Keys', exact: true }).click();
      await expect.poll(() => popup.locator('code').count()).toBe(2);
      await popup.locator('code').first().click();
      await popup.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect.poll(() => popup.locator('code').count()).toBe(1);
      expect(await popup.getByRole('status').innerText()).toBe('1 / 1 keys');
      await expect.poll(() => dashboard.locator('code').count()).toBe(1);
      expect(await popup.locator('#root > main').isVisible()).toBe(true);
      const readRecords = () =>
        worker.evaluate(async () =>
          browser.storage.local.get(['all-keys', 'recent-keys', 'recent-keys-by-domain']),
        );
      expect(await readRecords()).toEqual({
        'all-keys': JSON.stringify([otherPage]),
        'recent-keys': JSON.stringify([otherPage]),
        'recent-keys-by-domain': JSON.stringify({ 'example.com': [otherPage] }),
      });
      await dashboard.locator('code').click();
      await dashboard.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect.poll(() => popup.getByRole('status').innerText()).toBe('0 / 0 keys');
      expect(await popup.locator('#root > main').isVisible()).toBe(true);
      expect(await readRecords()).toEqual({
        'all-keys': '[]',
        'recent-keys': '[]',
        'recent-keys-by-domain': JSON.stringify({ 'example.com': [] }),
      });
      await expect.poll(() => dashboard.locator('code').count()).toBe(0);
      expect(await dashboard.locator('#root > main').isVisible()).toBe(true);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
