import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import type { KeyInfo } from '../../src/extension/utils/storage';

test('deletes individual records and confirms frozen selected, site, and all-record scopes', async () => {
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
      const otherSite = { ...key, url: 'https://other.example/watch' };
      const records = [key, otherPage, otherSite];
      const seed = async (records: KeyInfo[]) =>
        worker.evaluate(async (records) => {
          await browser.storage.local.set({
            'all-keys': JSON.stringify(records),
            'recent-keys': JSON.stringify(records),
            'recent-keys-by-domain': JSON.stringify({
              'example.com': records.filter((key) => key.url.startsWith('https://example.com/')),
              'other.example': records.filter((key) =>
                key.url.startsWith('https://other.example/'),
              ),
            }),
          });
        }, records);
      await seed(records);
      await expect.poll(() => popup.locator('code').count()).toBe(3);
      const rowCheckboxes = popup.getByRole('checkbox', { name: /^Select record/ });
      await rowCheckboxes.first().check();
      expect(
        await popup
          .getByRole('checkbox', { name: 'Select All Results' })
          .evaluate((element: HTMLInputElement) => element.indeterminate),
      ).toBe(true);
      expect(await popup.getByText('1 selected', { exact: true }).isVisible()).toBe(true);
      expect(await popup.getByRole('heading', { name: 'Key Settings' }).count()).toBe(0);
      await popup.getByLabel('Search by KID or site').fill('other.example');
      await expect.poll(() => popup.getByText('0 selected', { exact: true }).count()).toBe(1);
      await popup.getByLabel('Search by KID or site').fill('example.com');
      await popup.getByRole('checkbox', { name: 'Select All Results' }).check();
      await popup.getByRole('button', { name: 'Delete Selected', exact: true }).click();
      const dialog = popup.getByRole('dialog');
      await expect.poll(() => dialog.isVisible()).toBe(true);
      expect(await dialog.getByRole('heading').innerText()).toBe('Delete 2 records?');
      expect(
        await dialog
          .getByRole('button', { name: 'Cancel' })
          .evaluate((element) => element === document.activeElement),
      ).toBe(true);
      expect(
        await dialog
          .getByRole('button')
          .evaluateAll((buttons) =>
            buttons.every((button) => getComputedStyle(button).cursor === 'pointer'),
          ),
      ).toBe(true);
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      // Let a mistakenly bubbled click finish preparing a second confirmation.
      await popup.waitForTimeout(150);
      expect(await dialog.count()).toBe(0);
      expect(await popup.getByText('2 selected', { exact: true }).isVisible()).toBe(true);
      expect(
        await popup
          .getByRole('button', { name: 'Clear', exact: true })
          .evaluate((button) => getComputedStyle(button).cursor),
      ).toBe('pointer');
      await popup.getByRole('button', { name: 'Delete Selected', exact: true }).click();
      await dialog.waitFor({ state: 'visible' });
      await popup.keyboard.press('Escape');
      expect(await dialog.count()).toBe(0);
      expect(await popup.getByText('2 selected', { exact: true }).isVisible()).toBe(true);
      await popup.getByRole('button', { name: 'Delete Selected', exact: true }).click();
      const arriving = { ...key, url: 'https://example.com/new', createdAt: key.createdAt + 100 };
      await seed([...records, arriving]);
      expect(await dialog.getByRole('heading').innerText()).toBe('Delete 2 records?');
      await mkdir(resolve('output/playwright/bulk-deletion'), { recursive: true });
      await popup.screenshot({ path: resolve('output/playwright/bulk-deletion/confirmation.png') });
      await popup.setViewportSize({ width: 500, height: 300 });
      await popup.evaluate(() => document.documentElement.classList.add('dark'));
      await popup.screenshot({
        path: resolve('output/playwright/bulk-deletion/confirmation-dark-short.png'),
      });
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      );
      await dialog.getByRole('button', { name: 'Delete 2 records', exact: true }).click();
      await popup.setViewportSize({ width: 500, height: 650 });
      await popup.evaluate(() => document.documentElement.classList.remove('dark'));
      await expect.poll(() => popup.locator('code').count()).toBe(1);
      expect(JSON.parse(String((await readRecords())['all-keys']))).toEqual([otherSite, arriving]);
      await popup.getByLabel('Search by KID or site').fill('');
      await popup.screenshot({ path: resolve('output/playwright/bulk-deletion/selection.png') });
      await dashboard.getByRole('button', { name: 'Delete Site Keys', exact: true }).click();
      const siteDialog = dashboard.getByRole('dialog');
      await expect.poll(() => siteDialog.isVisible()).toBe(true);
      expect(await siteDialog.innerText()).toContain('example.com');
      await siteDialog.getByRole('button', { name: 'Delete 1 record', exact: true }).click();
      await expect.poll(() => popup.locator('code').count()).toBe(1);
      expect(JSON.parse(String((await readRecords())['all-keys']))).toEqual([otherSite]);
      await popup.getByLabel('Search by KID or site').fill('no-match');
      await popup.getByRole('button', { name: 'Delete All', exact: true }).click();
      await expect.poll(() => dialog.isVisible()).toBe(true);
      expect(await dialog.innerText()).toContain(
        'All sites, regardless of the current search or selection.',
      );
      await seed([otherSite, arriving]);
      await dialog.getByRole('button', { name: 'Delete 1 record', exact: true }).click();
      await expect
        .poll(async () => JSON.parse(String((await readRecords())['all-keys'])))
        .toEqual([arriving]);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
