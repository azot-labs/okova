import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import { seedKeyRecords } from './capture-storage';
import { openRecordDetails } from './capture-ui';

test('command headers require sensitive opt-in and expose loading and failure states', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-command-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 500, height: 700 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await seedKeyRecords(worker, [
      {
        id: '1'.repeat(32),
        value: '2'.repeat(32),
        pssh: '',
        captureId: 'test-session',
        url: 'https://example.test/watch',
        createdAt: 1,
      },
    ]);
    const popup = await context.newPage();
    await popup.addInitScript(() => {
      const original = browser.runtime.sendMessage.bind(browser.runtime);
      Object.defineProperty(browser.runtime, 'sendMessage', {
        value: (...args: Parameters<typeof browser.runtime.sendMessage>) => {
          const message: unknown = args[0];
          if (
            !message ||
            typeof message !== 'object' ||
            !('action' in message) ||
            message.action !== 'download-headers'
          )
            return original(...args);
          return new Promise((resolve, reject) => {
            window.addEventListener(
              'test-headers',
              (event) => {
                if (!(event instanceof CustomEvent)) return;
                if (event.detail === 'error') reject(new Error('Unavailable'));
                else resolve(event.detail);
              },
              { once: true },
            );
          });
        },
      });
    });
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    // An extension/new-tab active page must not expose another site's recent captures.
    await expect
      .poll(() => popup.getByRole('link', { name: 'Captures', exact: true }).textContent())
      .toContain('1');
    expect(await popup.locator('[data-capture-row]').count()).toBe(0);
    const reload = popup.getByRole('button', { name: 'Reload tab', exact: true });
    await reload.focus();
    expect(await reload.evaluate((element) => document.activeElement === element)).toBe(true);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    const row = popup.locator('[data-capture-row]');
    await openRecordDetails(row);
    const builder = row.locator('[data-command-builder]');
    const url = builder.getByRole('textbox', { name: 'Manifest URL', exact: true });
    const command = builder.getByRole('textbox', { name: 'Download command' });
    const copy = builder.getByRole('button', { name: 'Copy', exact: true });
    await url.fill('https://example.test/movie.mpd');
    await expect
      .poll(() => builder.getByRole('status').textContent())
      .toBe('Loading request headers…');
    expect(await copy.isDisabled()).toBe(true);
    await popup.evaluate(() =>
      window.dispatchEvent(
        new CustomEvent('test-headers', {
          detail: [
            { name: 'Referer', value: 'https://example.test/watch' },
            { name: 'Cookie', value: 'session=fixture-secret' },
          ],
        }),
      ),
    );
    await expect.poll(() => copy.isEnabled()).toBe(true);
    expect(await command.inputValue()).toContain('Referer:');
    expect(await command.inputValue()).not.toContain('fixture-secret');
    expect(await builder.textContent()).not.toContain('fixture-secret');
    const cookie = builder.getByRole('checkbox', { name: 'Include Cookie' });
    expect(await cookie.isChecked()).toBe(false);
    await cookie.check();
    await expect.poll(() => command.inputValue()).toContain('Cookie: session=fixture-secret');
    await cookie.uncheck();
    await expect.poll(() => command.inputValue()).not.toContain('fixture-secret');
    await mkdir('output/playwright/capture-command-builder', { recursive: true });
    await popup.screenshot({
      path: 'output/playwright/capture-command-builder/headers.png',
      fullPage: true,
    });
    await url.fill('https://example.test/failure.mpd');
    await expect.poll(() => builder.getByRole('status').count()).toBe(1);
    await popup.evaluate(() =>
      window.dispatchEvent(new CustomEvent('test-headers', { detail: 'error' })),
    );
    await expect
      .poll(() => builder.getByRole('alert').textContent())
      .toContain('Unable to load request headers');
    expect(await copy.isDisabled()).toBe(true);
    await popup.screenshot({
      path: 'output/playwright/capture-command-builder/error.png',
      fullPage: true,
    });
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
