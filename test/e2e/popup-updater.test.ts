import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

test('popup displays update failure, retries, and renders a release without Temporal', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-popup-updater-'));
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
      const popup = await context.newPage();
      await popup.addInitScript(() => {
        Reflect.deleteProperty(globalThis, 'Temporal');
      });
      let shouldFail = true;
      await popup.route(
        'https://api.github.com/repos/azot-labs/okova/releases/latest',
        async (route) => {
          if (shouldFail) {
            await route.fulfill({ status: 503, body: 'Unavailable' });
            return;
          }
          await route.fulfill({
            json: {
              tag_name: 'v99.0.0',
              published_at: '2026-09-01T00:00:00Z',
              assets: [
                {
                  name: 'okova-chrome.zip',
                  browser_download_url: 'https://example.com/chrome.zip',
                },
              ],
            },
          });
        },
      );
      const pageErrors: string[] = [];
      popup.on('pageerror', (error) => pageErrors.push(error.message));
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await popup.getByRole('link', { name: 'Settings', exact: true }).click();
      await popup.getByRole('button', { name: 'Check for Updates', exact: true }).click();
      const retry = popup.getByRole('button', { name: /Retry Update Check/ });
      await expect.poll(() => retry.isVisible()).toBe(true);
      expect(await popup.getByText('Up to Date', { exact: true }).count()).toBe(0);
      expect(await popup.getByText('Update check failed. Please try again.').isVisible()).toBe(
        true,
      );
      shouldFail = false;
      await retry.click();
      await expect.poll(() => popup.getByText(/Version 99.0.0 \(published/).isVisible()).toBe(true);
      expect(pageErrors).toEqual([]);
      await mkdir(resolve('output/playwright/popup-updater'), { recursive: true });
      await popup.screenshot({ path: resolve('output/playwright/popup-updater/success.png') });
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
