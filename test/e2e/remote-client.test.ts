import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import { z } from 'zod';

declare const chrome: typeof import('wxt/browser').browser;

const registrySchema = z.object({
  clients: z.array(z.object({ id: z.string() })),
  activeClientId: z.string().nullable(),
});

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

test('first import on Clients survives a failed write, repeated selection and duplicate labels', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-client-transaction-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const popup = await context.newPage();
    const popupUrl = `chrome-extension://${new URL(worker.url()).hostname}/popup.html`;
    await popup.goto(popupUrl);
    await popup.getByRole('link', { name: 'Clients', exact: true }).click();
    const input = popup.locator('input[type=file]');
    const file = (device: string) => ({
      name: 'REMOTE.JSON',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          baseUrl: 'https://cdm.test',
          secret: 'test',
          keySystem: 'com.widevine.alpha',
          client: device,
          label: 'Same label',
        }),
      ),
    });
    // Fail the actual popup write once, without changing another extension context.
    await popup.evaluate(() => {
      const set = chrome.storage.local.set.bind(chrome.storage.local);
      chrome.storage.local.set = async () => {
        chrome.storage.local.set = set;
        throw new Error('Quota exceeded');
      };
    });
    await input.setInputFiles(file('one'));
    await expect.poll(() => popup.getByRole('alert').textContent()).toBe('Quota exceeded');
    expect(await popup.getByText('Same label', { exact: true }).count()).toBe(0);
    expect(await popup.getByTitle('Active Client').count()).toBe(0);
    expect(await input.inputValue()).toBe('');
    await input.setInputFiles(file('one'));
    await popup.getByText('Same label', { exact: true }).waitFor();
    await expect.poll(() => popup.getByTitle('Active Client').count()).toBe(1);
    const stored = await worker.evaluate(() =>
      chrome.storage.local.get(['client-registry', 'settings']),
    );
    const registry = registrySchema.parse(stored['client-registry']);
    expect(registry.clients).toHaveLength(1);
    expect(registry.activeClientId).toBe(registry.clients[0]!.id);
    expect(
      z
        .object({ clientPlayback: z.literal(true) })
        .parse(JSON.parse(z.string().parse(stored.settings))).clientPlayback,
    ).toBe(true);
    await input.setInputFiles(file('one'));
    await expect
      .poll(() => popup.getByRole('alert').textContent())
      .toBe('This client is already imported');
    await input.setInputFiles(file('two'));
    await expect.poll(() => popup.getByText('Same label', { exact: true }).count()).toBe(2);
    await popup.getByText('Same label', { exact: true }).last().click();
    await expect
      .poll(async () => {
        const stored = await worker.evaluate(() => chrome.storage.local.get('client-registry'));
        const registry = registrySchema.parse(stored['client-registry']);
        return registry.activeClientId === registry.clients[1]!.id;
      })
      .toBe(true);
    await popup.getByText('Same label', { exact: true }).last().hover();
    await popup.getByTitle('Client Settings').last().click();
    await popup.getByText('two', { exact: true }).waitFor();
    await popup.getByText('Delete', { exact: true }).click();
    await expect.poll(() => popup.getByTitle('Client Settings').count()).toBe(1);
    await expect.poll(() => popup.getByText('Same label', { exact: true }).count()).toBe(1);
    await popup.goto(popupUrl);
    await popup.getByRole('link', { name: 'Clients', exact: true }).click();
    await expect.poll(() => popup.getByText('Same label', { exact: true }).count()).toBe(1);
    await expect.poll(() => popup.getByTitle('Active Client').count()).toBe(1);
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
