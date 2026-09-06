import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

test('imports, selects, exports, and deletes remote clients in the popup', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-remote-ui-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 500, height: 600 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Clients', exact: true }).click();
    const input = popup.locator('input[type=file]');
    await input.waitFor({ state: 'attached' });
    await input.setInputFiles({
      name: 'remote.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{invalid'),
    });
    await expect.poll(() => popup.getByRole('alert').textContent()).toBe('Invalid JSON file');
    // Import from the dashboard, where the import control disappears on success.
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await input.setInputFiles({
      name: 'remote.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          host: 'https://cdm.test',
          secret: 'test-secret',
          device_name: 'Fallback device',
        }),
      ),
    });
    await popup.getByText('Fallback device @ cdm.test', { exact: true }).waitFor();
    expect(await popup.getByRole('status').textContent()).toContain('Imported as Widevine');
    await mkdir(resolve('output/playwright/remote-client'), { recursive: true });
    await popup.screenshot({
      path: resolve('output/playwright/remote-client/fallback-warning.png'),
    });
    await popup.getByRole('link', { name: 'Clients', exact: true }).click();
    await popup.getByText('Widevine · Remote · pywidevine', { exact: true }).waitFor();
    await popup.getByRole('button', { name: 'Dismiss import warning' }).click();
    expect(await popup.getByRole('status').count()).toBe(0);
    const config = {
      protocol: 'okova',
      label: 'Local API',
      keySystem: 'com.widevine.alpha',
      baseUrl: 'http://localhost:8787',
      secret: 'test-secret',
    };
    await input.setInputFiles({
      name: 'remote.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(config)),
    });
    await popup.getByText('Local API', { exact: true }).waitFor();
    await expect.poll(() => popup.getByTitle('Active Client').count()).toBe(1);
    await input.setInputFiles({
      name: 'remote.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          host: 'https://cdm.test',
          secret: 'test-secret',
          device_name: 'Python device',
          security_level: 2000,
        }),
      ),
    });
    const pythonClient = popup.getByText('Python device @ cdm.test', { exact: true });
    await pythonClient.click();
    await pythonClient.hover();
    await popup.getByTitle('Client Settings').last().click();
    await popup.getByText('pyplayready', { exact: true }).waitFor();
    expect(await popup.locator('body').textContent()).not.toContain('test-secret');
    await popup.evaluate(() =>
      Object.defineProperty(window, 'showSaveFilePicker', { value: undefined }),
    );
    const downloaded = popup.waitForEvent('download');
    await popup.getByText('Export to JSON', { exact: true }).click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toMatch(/\.remote\.json$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    expect(JSON.parse(Buffer.concat(chunks).toString())).toMatchObject({
      protocol: 'pyplayready',
      device: 'Python device',
      secret: 'test-secret',
    });
    await mkdir(resolve('output/playwright/remote-client'), { recursive: true });
    await popup.screenshot({ path: resolve('output/playwright/remote-client/settings.png') });
    await popup.getByText('Delete', { exact: true }).click();
    await popup.getByText('Local API', { exact: true }).waitFor();
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Clients', exact: true }).click();
    await popup.getByText('Local API', { exact: true }).waitFor();
    await expect.poll(() => popup.getByTitle('Active Client').count()).toBe(1);
    await popup.screenshot({ path: resolve('output/playwright/remote-client/clients.png') });
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
