import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import { z } from 'zod';

declare const chrome: typeof import('wxt/browser').browser;

const storedKeys = z.array(
  z.object({
    id: z.string(),
    value: z.string(),
    url: z.string(),
    drmSystem: z.string().optional(),
    createdAt: z.number(),
  }),
);

test('retrieves new Widevine keys from the Bitmovin DRM demo with Spoofing enabled', async ({
  skip,
}) => {
  const clientPath = process.env.VITEST_WIDEVINE_CLIENT_PATH;
  if (!clientPath || !existsSync(resolve(clientPath))) {
    skip('VITEST_WIDEVINE_CLIENT_PATH is unset or the .wvd file does not exist');
    return;
  }

  const extensionPath = resolve('.output/chrome-mv3');
  const profilePath = await mkdtemp(join(tmpdir(), 'okova-e2e-'));
  try {
    const context = await chromium.launchPersistentContext(profilePath, {
      channel: 'chromium',
      headless: true,
      // Disabling component updates also prevents native Widevine from registering.
      ignoreDefaultArgs: ['--disable-component-update'],
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    try {
      context.setDefaultTimeout(20_000);
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const popupUrl = `chrome-extension://${new URL(worker.url()).hostname}/popup.html`;
      const popup = await context.newPage();
      await popup.goto(popupUrl);
      await popup.getByRole('link', { name: 'Settings', exact: true }).click();
      const spoofingRow = popup.locator('label').filter({ hasText: 'Spoofing' });
      const spoofing = spoofingRow.getByRole('checkbox');
      await spoofingRow.locator('label').click();
      await expect.poll(() => spoofing.isChecked()).toBe(true);
      await popup.goto(popupUrl);
      await popup.getByRole('link', { name: 'Settings', exact: true }).click();
      await expect.poll(() => spoofing.isChecked()).toBe(true);

      await popup.goto(popupUrl);
      await popup.getByRole('link', { name: 'Clients', exact: true }).click();
      await popup.getByLabel('Import client').setInputFiles(resolve(clientPath));
      await expect.poll(() => popup.getByText(/^Widevine L\d$/).count()).toBe(1);
      // The UI updates before the imported client has finished writing to storage.
      await expect
        .poll(() =>
          worker.evaluate(async () => {
            const raw: unknown = (await chrome.storage.local.get('clients')).clients;
            const clients: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return Array.isArray(clients) && clients.length === 1;
          }),
        )
        .toBe(true);
      // Returning to the dashboard persists the sole imported client as active.
      await popup.goto(popupUrl);
      await expect.poll(() => popup.getByText('Active', { exact: true }).count()).toBe(1);
      await expect
        .poll(() =>
          worker.evaluate(async () =>
            Boolean((await chrome.storage.local.get('active-client'))['active-client']),
          ),
        )
        .toBe(true);

      const readKeys = async () => {
        const raw: unknown = await worker.evaluate(async () => {
          const storage = await chrome.storage.local.get('all-keys');
          return storage['all-keys'];
        });
        return storedKeys.parse(typeof raw === 'string' ? JSON.parse(raw) : (raw ?? []));
      };
      expect((await readKeys()).length).toBe(0);
      const startedAt = Date.now();
      const demo = await context.newPage();
      // Bitmovin challenges the default HeadlessChrome user agent with HTTP 403.
      const session = await context.newCDPSession(demo);
      await session.send('Emulation.setUserAgentOverride', {
        userAgent: await demo.evaluate(() =>
          navigator.userAgent.replace('HeadlessChrome/', 'Chrome/'),
        ),
      });
      const response = await demo.goto('https://bitmovin.com/demos/drm', {
        waitUntil: 'domcontentloaded',
      });
      expect(
        response?.status(),
        'Bitmovin must serve the DRM demo. HTTP 403 can indicate a Cloudflare verification page.',
      ).toBe(200);
      await demo.locator('#available-drm-systems').waitFor();
      await expect
        .poll(() => demo.locator('#available-drm-systems').inputValue(), {
          timeout: 30_000,
          message: 'The Bitmovin demo must detect native Widevine support in the test browser',
        })
        .toBe('widevine');
      // Native playback may reject the substituted license after Okova has captured its keys.
      await demo.locator('#player-container video').evaluate((video: HTMLVideoElement) => {
        video.muted = true;
        void video.play().catch(() => {});
      });

      await expect
        .poll(
          async () =>
            (await readKeys()).some(
              (key) =>
                key.drmSystem === 'W' &&
                new URL(key.url).hostname === 'bitmovin.com' &&
                key.createdAt >= startedAt &&
                /^[0-9a-f]{32}$/i.test(key.id) &&
                /^[0-9a-f]{32}$/i.test(key.value),
            ),
          { timeout: 60_000, message: 'Expected a newly captured Widevine key from Bitmovin' },
        )
        .toBe(true);

      // All Keys avoids changing the active website tab used by dashboard filtering.
      await popup.getByRole('link', { name: 'Keys', exact: true }).click();
      await expect
        .poll(() =>
          popup
            .locator('code')
            .filter({ hasText: /^[0-9a-f]{32}:[0-9a-f]{32}$/i })
            .count(),
        )
        .toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  } finally {
    await rm(profilePath, { recursive: true, force: true });
  }
});
