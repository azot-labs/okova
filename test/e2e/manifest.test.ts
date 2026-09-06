import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

// Empty, structurally valid PSSH boxes. No provision or license service is needed.
const pssh = (systemId: string) => {
  const box = Buffer.alloc(32);
  box.writeUInt32BE(32);
  box.write('pssh', 4);
  Buffer.from(systemId, 'hex').copy(box, 12);
  return box.toString('base64');
};
const widevine = pssh('edef8ba979d64acea3c827dcd51d21ed');
const playready = pssh('9a04f07998404286ab92e65be0885f95');
const manifestUrl = 'https://okova.test/manifest.mpd';

test('built content bridge associates DASH and reads playback configuration through the worker', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-manifest-'));
  const extension = resolve('.output/chrome-mv3');
  try {
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      headless: true,
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      await worker.evaluate(async () => {
        await browser.storage.local.set({
          settings: JSON.stringify({
            spoofing: false,
            clientPlayback: false,
            emeInterception: false,
            requestInterception: true,
            theme: 'auto',
          }),
          'client-registry': {
            clients: [
              {
                id: 'synthetic',
                info: {
                  type: 'remote',
                  config: {
                    protocol: 'okova',
                    keySystem: 'com.widevine.alpha',
                    baseUrl: 'https://unused.test',
                  },
                },
              },
            ],
            activeClientId: 'synthetic',
          },
        });
      });
      await context.route('https://okova.test/**', async (route) => {
        if (route.request().url() === manifestUrl) {
          await route.fulfill({
            contentType: 'application/dash+xml',
            body: `
            <d:MPD xmlns:d="urn:mpeg:dash:schema:mpd:2011" xmlns:p="urn:mpeg:cenc:2013">
              <d:Period><d:AdaptationSet>
                <d:ContentProtection schemeIdUri="urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"><p:pssh>${widevine}</p:pssh></d:ContentProtection>
                <d:ContentProtection schemeIdUri="urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95"><p:pssh>\n${playready.slice(0, 16)}\n${playready.slice(16)}\n</p:pssh></d:ContentProtection>
              </d:AdaptationSet></d:Period>
            </d:MPD>`,
          });
        } else {
          await route.fulfill({
            contentType: 'text/html',
            body: '<!doctype html><title>Okova manifest check</title>',
          });
        }
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const readinessMs: number[] = [];
      for (let index = 0; index < 5; index++) {
        const ready = page.waitForEvent('console', {
          predicate: (message) => message.text() === '[okova] Response interception added',
        });
        await page.goto(`https://okova.test/page-${index}`);
        await ready;
        // Resource timing covers loading the content script's dependent page script.
        readinessMs.push(
          await page.evaluate(() => {
            const entry = performance
              .getEntriesByType('resource')
              .find((item) => item.name.endsWith('/manifest.js'));
            return entry ? entry.startTime + entry.duration : performance.now();
          }),
        );
        await page.evaluate(async (url) => {
          window.postMessage(null, '*');
          window.postMessage({ method: 'response', params: null }, '*');
          await fetch(url);
        }, manifestUrl);
        await expect.poll(() => page.evaluate(() => window.MPD_LIST.size)).toBe(2);
        expect(
          await page.evaluate(
            (keys) => keys.map((key) => window.MPD_LIST.get(key)),
            [widevine, playready],
          ),
        ).toEqual([manifestUrl, manifestUrl]);
      }
      const activeSystem = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const requestId = 'browser-config-check';
            const onResponse = (event: Event) => {
              if (!(event instanceof CustomEvent) || typeof event.detail !== 'string') return;
              const response = JSON.parse(event.detail);
              if (response.requestId !== requestId) return;
              window.removeEventListener('drm-message-response', onResponse);
              resolve(response.body);
            };
            window.addEventListener('drm-message-response', onResponse);
            window.postMessage(
              { type: 'drm-message', requestId, log: { action: 'playback-config' } },
              '*',
            );
          }),
      );
      expect(activeSystem).toBe('com.widevine.alpha');
      expect(errors).toEqual([]);
      const artifacts = resolve('output/playwright/manifest');
      await mkdir(artifacts, { recursive: true });
      await writeFile(
        join(artifacts, 'timing.json'),
        JSON.stringify({ manifestLoadedMs: readinessMs }, null, 2),
      );
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});
