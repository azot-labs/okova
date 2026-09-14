import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

test('settings synchronize across popups and failed saves preserve toggle state until retry', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-settings-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const url = `chrome-extension://${new URL(worker.url()).hostname}/popup.html`;
    const first = await context.newPage();
    const second = await context.newPage();
    const errors: string[] = [];
    for (const popup of [first, second]) {
      popup.on('pageerror', (error) => errors.push(error.message));
      await popup.goto(url);
      await popup.getByRole('link', { name: 'Settings', exact: true }).last().click();
    }
    const firstToggle = first.getByRole('checkbox').nth(3);
    const secondToggle = second.getByRole('checkbox').nth(3);
    expect(await firstToggle.isChecked()).toBe(true);
    // Inject an actual rejected storage promise in this popup only.
    await first.evaluate(() => {
      const original = browser.storage.local.set.bind(browser.storage.local);
      const rejectionRequested = new Promise<void>((resolve) =>
        window.addEventListener('reject-settings-save', () => resolve(), { once: true }),
      );
      browser.storage.local.set = async () => {
        browser.storage.local.set = original;
        await rejectionRequested;
        throw new Error('Storage unavailable');
      };
    });
    // Hold the shared lock so the save cannot reach storage before rejection is requested.
    await second.evaluate(
      () =>
        new Promise<void>((resolve) => {
          void navigator.locks.request(
            'okova:settings',
            () =>
              new Promise<void>((release) => {
                window.addEventListener('release-settings-lock', () => release(), { once: true });
                resolve();
              }),
          );
        }),
    );
    await firstToggle.click({ force: true });
    expect(await firstToggle.isChecked()).toBe(true);
    expect(await firstToggle.isDisabled()).toBe(true);
    await first.evaluate(() => window.dispatchEvent(new Event('reject-settings-save')));
    await second.evaluate(() => window.dispatchEvent(new Event('release-settings-lock')));
    await expect
      .poll(() => first.getByRole('alert').textContent())
      .toBe('Unable to save settings. Please try again.');
    expect(await firstToggle.isChecked()).toBe(true);
    expect(await secondToggle.isChecked()).toBe(true);
    await firstToggle.click({ force: true });
    await expect.poll(() => firstToggle.isChecked()).toBe(false);
    await expect.poll(() => secondToggle.isChecked()).toBe(false);
    expect(await first.getByRole('alert').count()).toBe(0);
    await Promise.all([
      first.getByRole('button', { name: 'Dark', exact: true }).click(),
      second.getByRole('checkbox').nth(1).click({ force: true }),
    ]);
    await expect.poll(() => first.getByRole('checkbox').nth(1).isChecked()).toBe(true);
    await expect.poll(() => second.locator('html').getAttribute('class')).toContain('dark');
    const saved = await worker.evaluate(
      async () => (await browser.storage.local.get('settings')).settings,
    );
    if (typeof saved !== 'string') throw new Error('Expected serialized settings');
    expect(JSON.parse(saved)).toMatchObject({
      theme: 'dark',
      spoofing: true,
      requestInterception: false,
    });
    await first.goto(url);
    await first.getByRole('link', { name: 'Settings', exact: true }).last().click();
    expect(await first.getByRole('checkbox').nth(3).isChecked()).toBe(false);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
