import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

test('dash.js encrypted capability checks reach custom playback in Helium', async ({ skip }) => {
  const credentials = process.env.VITEST_WVD_PATH;
  const executablePath = process.env.VITEST_CHROMIUM_BINARY;
  if (!credentials || !executablePath) {
    skip('Set VITEST_WVD_PATH and VITEST_CHROMIUM_BINARY');
    return;
  }
  const profile = await mkdtemp(join(tmpdir(), 'okova-dashjs-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    executablePath,
    headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.locator('input[type=file]').setInputFiles(credentials);
    await expect
      .poll(() =>
        worker.evaluate(
          async () =>
            (await browser.storage.local.get('credentials-registry'))['credentials-registry'],
        ),
      )
      .toBeTruthy();
    await worker.evaluate(async () => {
      const raw = (await browser.storage.local.get('settings')).settings;
      await browser.storage.local.set({
        settings: JSON.stringify({
          ...JSON.parse(String(raw)),
          clientPlayback: true,
          spoofing: true,
          emeInterception: true,
        }),
      });
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.text().includes('not supported') || message.text().includes('startup failed'))
        errors.push(message.text());
    });
    await page.goto('https://reference.dashif.org/dash.js/latest/samples/drm/widevine.html');
    await page.locator('video').waitFor();
    await page.locator('video').evaluate((video: HTMLVideoElement) => {
      video.muted = true;
      void video.play().catch(() => {});
    });
    try {
      await page.waitForFunction(() => (document.querySelector('video')?.currentTime ?? 0) > 3, {
        timeout: 60000,
      });
    } finally {
      await mkdir('output/playwright/dashjs', { recursive: true });
      await page.screenshot({ path: 'output/playwright/dashjs/helium.png', fullPage: true });
    }
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
