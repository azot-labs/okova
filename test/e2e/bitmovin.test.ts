import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';
import { z } from 'zod';

declare global {
  interface Window {
    okovaPlaybackProbe: { requestedKeySystems: string[]; attachedKeySystems: string[] };
  }
}

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

test.for([
  { drm: 'widevine', playback: false },
  { drm: 'widevine', playback: true },
  { drm: 'playready', playback: true },
])('captures Bitmovin $drm keys with playback=$playback', async ({ drm, playback }, { skip }) => {
  const clientPath =
    drm === 'playready' ? process.env.VITEST_PRD_PATH : process.env.VITEST_WIDEVINE_CLIENT_PATH;
  if (!clientPath || !existsSync(resolve(clientPath))) {
    skip('Set VITEST_WIDEVINE_CLIENT_PATH or VITEST_PRD_PATH to a local client file');
    return;
  }

  const extensionPath = resolve('.output/chrome-mv3');
  const profilePath = await mkdtemp(join(tmpdir(), 'okova-e2e-'));
  try {
    const context = await chromium.launchPersistentContext(profilePath, {
      channel: process.env.VITEST_CHROMIUM_BINARY ? undefined : 'chromium',
      executablePath: process.env.VITEST_CHROMIUM_BINARY,
      headless: true,
      // Disabling component updates also prevents native Widevine from registering.
      ignoreDefaultArgs: playback ? [] : ['--disable-component-update'],
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    try {
      context.setDefaultTimeout(20_000);
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const popupUrl = `chrome-extension://${new URL(worker.url()).hostname}/popup.html`;
      const pageErrors: string[] = [];
      context.on('page', (page) =>
        page.on('pageerror', (error) => {
          // Website analytics and cookie scripts are outside this extension/player check.
          if (
            page.url().startsWith('chrome-extension://') ||
            error.stack?.includes('chrome-extension://') ||
            error.stack?.includes('bitmovinplayer.js')
          ) {
            pageErrors.push(`${page.url()}: ${error.stack ?? error.message}`);
          }
        }),
      );
      const popup = await context.newPage();
      await popup.setViewportSize({ width: 500, height: 600 });
      await popup.goto(popupUrl);
      await popup.getByRole('link', { name: 'Clients', exact: true }).click();
      await popup.getByLabel('Import client').setInputFiles(resolve(clientPath));
      await expect
        .poll(() =>
          popup.getByText(drm === 'widevine' ? /^Widevine L\d$/ : /^PlayReady SL\d+$/).count(),
        )
        .toBe(1);
      await popup.getByText(drm === 'widevine' ? /^Widevine L\d$/ : /^PlayReady SL\d+$/).hover();
      await popup.locator('svg').filter({ hasText: 'Client Settings' }).click();
      await expect
        .poll(() =>
          popup
            .getByText(drm === 'widevine' ? 'Google Widevine' : 'Microsoft PlayReady', {
              exact: true,
            })
            .count(),
        )
        .toBe(1);
      await popup.goto(popupUrl);
      // Imports must finish persisting before navigating away.

      await expect
        .poll(() =>
          worker.evaluate(async () => {
            const raw: unknown = (await chrome.storage.local.get('client-registry'))[
              'client-registry'
            ];
            return (
              typeof raw === 'object' &&
              raw !== null &&
              'clients' in raw &&
              Array.isArray(raw.clients) &&
              raw.clients.length === 1
            );
          }),
        )
        .toBe(true);
      await popup.goto(popupUrl);
      await popup.getByRole('link', { name: 'Settings', exact: true }).click();
      const playbackRow = popup
        .locator('label')
        .filter({ hasText: 'Use the active client to play protected content' });
      const spoofingRow = popup
        .locator('label')
        .filter({ hasText: 'Use the active client to obtain content keys' });
      await expect.poll(() => spoofingRow.getByRole('checkbox').isChecked()).toBe(true);
      await expect.poll(() => playbackRow.getByRole('checkbox').isChecked()).toBe(true);
      expect(
        await popup.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
        'Settings must fit the popup width',
      ).toBe(true);
      const interceptionRow = popup
        .locator('label')
        .filter({ hasText: 'Logging EME events and calls' });
      await interceptionRow.locator('label').click();
      await expect.poll(() => spoofingRow.getByRole('checkbox').isDisabled()).toBe(true);
      await expect.poll(() => playbackRow.getByRole('checkbox').isDisabled()).toBe(true);
      await interceptionRow.locator('label').click();
      await expect.poll(() => spoofingRow.getByRole('checkbox').isDisabled()).toBe(false);
      await expect.poll(() => playbackRow.getByRole('checkbox').isDisabled()).toBe(true);
      await spoofingRow.locator('label').click();
      await expect.poll(() => playbackRow.getByRole('checkbox').isDisabled()).toBe(false);
      if (!playback) await playbackRow.locator('label').click();
      await expect
        .poll(() =>
          worker.evaluate(async () => {
            const raw: unknown = (await chrome.storage.local.get('settings')).settings;
            const settings: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return typeof settings === 'object' && settings !== null && 'clientPlayback' in settings
              ? settings.clientPlayback
              : undefined;
          }),
        )
        .toBe(playback);
      // Import persists the first active client without requiring a dashboard visit.
      await popup.goto(popupUrl);
      await expect.poll(() => popup.getByText('Active', { exact: true }).count()).toBe(1);
      await expect
        .poll(() =>
          worker.evaluate(async () => {
            const raw: unknown = (await chrome.storage.local.get('client-registry'))[
              'client-registry'
            ];
            return (
              typeof raw === 'object' &&
              raw !== null &&
              'activeClientId' in raw &&
              typeof raw.activeClientId === 'string'
            );
          }),
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
      if (playback) {
        await demo.addInitScript(() => {
          const probe: Window['okovaPlaybackProbe'] = {
            requestedKeySystems: [],
            attachedKeySystems: [],
          };
          window.okovaPlaybackProbe = probe;
          const systems = new WeakMap<MediaKeys, string>();
          const request = navigator.requestMediaKeySystemAccess.bind(navigator);
          navigator.requestMediaKeySystemAccess = async (keySystem, configurations) => {
            probe.requestedKeySystems.push(keySystem);
            // Deterministically emulate a browser with no Widevine, even if installed globally.
            if (
              keySystem === 'com.widevine.alpha' ||
              keySystem.startsWith('com.microsoft.playready')
            )
              throw new DOMException('Native DRM disabled by test', 'NotSupportedError');
            return request(keySystem, configurations);
          };
          const create = MediaKeySystemAccess.prototype.createMediaKeys;
          MediaKeySystemAccess.prototype.createMediaKeys = async function () {
            const keys = await create.call(this);
            systems.set(keys, this.keySystem);
            return keys;
          };
          const attach = HTMLMediaElement.prototype.setMediaKeys;
          HTMLMediaElement.prototype.setMediaKeys = async function (keys) {
            await attach.call(this, keys);
            if (keys) probe.attachedKeySystems.push(systems.get(keys) ?? 'unknown');
          };
        });
      }
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
          message: 'The Bitmovin demo must detect Widevine support through EME',
        })
        .toBe(drm);
      // Start muted playback so autoplay policy cannot block the test.
      await demo.locator('#player-container video').evaluate((video: HTMLVideoElement) => {
        video.muted = true;
        void video.play().catch(() => {});
      });

      await expect
        .poll(
          async () =>
            (await readKeys()).some(
              (key) =>
                key.drmSystem === (drm === 'widevine' ? 'W' : 'P') &&
                new URL(key.url).hostname === 'bitmovin.com' &&
                key.createdAt >= startedAt &&
                /^[0-9a-f]{32}$/i.test(key.id) &&
                /^[0-9a-f]{32}$/i.test(key.value),
            ),
          { timeout: 60_000, message: `Expected a newly captured ${drm} key from Bitmovin` },
        )
        .toBe(true);

      if (playback) {
        const video = demo.locator('#player-container video');
        const start = await video.evaluate((element: HTMLVideoElement) => {
          const quality = element.getVideoPlaybackQuality();
          return {
            time: element.currentTime,
            frames: quality.totalVideoFrames - quality.droppedVideoFrames,
          };
        });
        await expect
          .poll(
            () =>
              video.evaluate((element: HTMLVideoElement, initial) => {
                const quality = element.getVideoPlaybackQuality();
                return {
                  advanced: element.currentTime > initial.time + 3,
                  renderedFrames:
                    quality.totalVideoFrames - quality.droppedVideoFrames > initial.frames + 5,
                  error: element.error?.code ?? null,
                  paused: element.paused,
                };
              }, start),
            {
              timeout: 30_000,
              message: 'Native ClearKey must render frames and advance playback after key capture',
            },
          )
          .toMatchObject({
            advanced: true,
            renderedFrames: true,
            error: null,
            paused: false,
          });
        const probe = await demo.evaluate(() => window.okovaPlaybackProbe);
        expect(probe.requestedKeySystems).toContain('org.w3.clearkey');
        expect(probe.attachedKeySystems).toContain('org.w3.clearkey');
        expect(probe.attachedKeySystems).not.toContain('com.widevine.alpha');
      }

      expect(pageErrors, 'Popup and player should have no uncaught JavaScript errors').toEqual([]);

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
