import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

declare const chrome: typeof import('wxt/browser').browser;

test('popup keeps good credentials usable and supports failed re-import, repair and deletion', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-corrupt-credentials-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 500, height: 650 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const config = {
      protocol: 'okova',
      baseUrl: 'https://cdm.test',
      secret: 'test-secret',
      keySystem: 'com.widevine.alpha',
      credentials: 'good',
      label: 'Good credentials',
    };
    await worker.evaluate(async (config) => {
      await chrome.storage.local.set({
        'credentials-registry': {
          credentials: [
            { id: 'broken-wvd', info: { type: 'wvd', data: 'AAAA' } },
            { id: 'broken-remote', info: { type: 'remote', config: { secret: 'hidden-secret' } } },
            { id: 'good', info: { type: 'remote', config } },
          ],
          activeCredentialsId: 'good',
        },
      });
    }, config);
    const popup = await context.newPage();
    popup.setDefaultTimeout(10_000);
    const errors: string[] = [];
    popup.on('pageerror', (error) => errors.push(error.message));
    const popupUrl = `chrome-extension://${new URL(worker.url()).hostname}/popup.html`;
    await popup.goto(popupUrl);
    await popup.getByRole('link', { name: 'Credentials', exact: true }).click();
    await popup.getByText('Good credentials', { exact: true }).waitFor();
    expect(await popup.getByText('Unable to read credentials', { exact: true }).count()).toBe(2);
    expect(await popup.getByTitle('Active Credentials').count()).toBe(1);
    expect(await popup.locator('body').innerText()).not.toContain('hidden-secret');
    const repair = popup.getByLabel('Re-import credentials broken-wvd', { exact: true });
    await repair.setInputFiles({
      name: 'bad.wvd',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('invalid'),
    });
    await popup.getByRole('alert').waitFor();
    expect(await popup.getByText('Unable to read credentials', { exact: true }).count()).toBe(2);
    expect(await repair.inputValue()).toBe('');
    await mkdir(resolve('output/playwright/corrupt-credentials'), { recursive: true });
    await popup.screenshot({ path: resolve('output/playwright/corrupt-credentials/failed.png') });
    await repair.setInputFiles({
      name: 'repair.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({ ...config, credentials: 'repaired', label: 'Repaired credentials' }),
      ),
    });
    await popup.getByText('Repaired credentials', { exact: true }).waitFor();
    expect(await popup.getByText('Unable to read credentials', { exact: true }).count()).toBe(1);
    await popup.getByText('Repaired credentials', { exact: true }).click();
    await popup.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect
      .poll(() => popup.getByText('Unable to read credentials', { exact: true }).count())
      .toBe(0);
    await popup.goto(popupUrl);
    await popup.getByRole('link', { name: 'Credentials', exact: true }).click();
    await popup.getByText('Repaired credentials', { exact: true }).waitFor();
    await popup.getByText('Good credentials', { exact: true }).waitFor();
    expect(await popup.getByTitle('Active Credentials').count()).toBe(1);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
