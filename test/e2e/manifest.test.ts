import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
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
      // Let first-install initialization finish before replacing the default settings.
      await expect
        .poll(() =>
          worker.evaluate(async () => (await browser.storage.local.get('settings')).settings),
        )
        .toBeTruthy();
      await worker.evaluate(async () => {
        await browser.storage.local.set({
          settings: JSON.stringify({
            spoofing: false,
            clientPlayback: false,
            emeInterception: false,
            requestInterception: true,
            theme: 'auto',
          }),
          'credentials-registry': {
            credentials: [
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
            activeCredentialsId: 'synthetic',
          },
        });
      });
      await expect
        .poll(() =>
          worker.evaluate(
            async () =>
              (
                await browser.scripting.getRegisteredContentScripts({ ids: ['okova-interception'] })
              )[0]?.js,
          ),
        )
        .toEqual(['network.js']);
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
      for (let index = 0; index < 5; index++) {
        await page.goto(`https://okova.test/page-${index}`);
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
    } finally {
      await context.close();
    }
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
});

test('captures HLS/MSS choices through real EME and builds commands in the popup', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-manifest-workflow-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 500, height: 600 },
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  const server = createServer();
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await expect
      .poll(() =>
        worker.evaluate(async () => (await browser.storage.local.get('settings')).settings),
      )
      .toBeTruthy();
    await worker.evaluate(async () => {
      await browser.storage.local.set({
        settings: JSON.stringify({
          spoofing: false,
          emeInterception: true,
          requestInterception: true,
          theme: 'light',
        }),
      });
    });
    await expect
      .poll(() =>
        worker.evaluate(
          async () =>
            (
              await browser.scripting.getRegisteredContentScripts({ ids: ['okova-interception'] })
            )[0]?.js,
        ),
      )
      .toEqual(['eme-bootstrap.js', 'network.js']);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server address');
    const origin = `http://127.0.0.1:${address.port}`;
    const master = `${origin}/master.m3u8?token=one`;
    const media = `${origin}/media.m3u8?token=two`;
    const mss = `${origin}/video.ism/Manifest`;
    const mediaRequest = `${origin}/request/media.m3u8`;
    const mssRequest = `${origin}/request/video.ism/Manifest`;
    server.on('request', (request, response) => {
      const url = new URL(request.url!, origin).href;
      if (url === mediaRequest || url === mssRequest) {
        response.writeHead(302, { location: url === mediaRequest ? media : mss });
        response.end();
      } else if (url === master) {
        response.setHeader('content-type', 'application/vnd.apple.mpegurl');
        response.end('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1280000\nrequest/media.m3u8');
      } else if (url === media) {
        response.setHeader('content-type', 'text/plain');
        response.end('#EXTM3U\n#EXTINF:4,\nsegment.ts');
      } else if (url === mss) {
        response.setHeader('content-type', 'application/vnd.ms-sstr+xml');
        response.end('<SmoothStreamingMedia MajorVersion="2" MinorVersion="1"/>');
      } else {
        response.setHeader('content-type', 'text/html');
        response.end('<!doctype html><title>Manifest workflow</title>');
      }
    });
    const page = await context.newPage();
    await page.goto(`${origin}/watch`);
    await page.evaluate(
      async ([master, media, mss]) => {
        await fetch(master!);
        await fetch(media!);
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', mss!);
          xhr.responseType = 'arraybuffer';
          xhr.onload = () => resolve();
          xhr.onerror = () => reject(new Error('MSS request failed'));
          xhr.send();
        });
      },
      [master, mediaRequest, mssRequest],
    );
    await expect.poll(() => page.evaluate(() => window.MANIFEST_LIST.size)).toBe(3);
    expect(
      await page.evaluate(
        ([media, mss]) =>
          [media, mss].map((url) => {
            const manifest = window.MANIFEST_LIST.get(url!);
            return manifest && typeof manifest === 'object' && 'requestUrls' in manifest
              ? manifest.requestUrls
              : undefined;
          }),
        [media, mss],
      ),
    ).toEqual([[mediaRequest], [mssRequest]]);
    await page.evaluate(() => window.MANIFEST_LIST.set('page-owned', {}));
    await page.evaluate(async () => {
      const access = await navigator.requestMediaKeySystemAccess('org.w3.clearkey', [
        {
          initDataTypes: ['keyids'],
          videoCapabilities: [{ contentType: 'video/webm; codecs="vp8"' }],
        },
      ]);
      const keys = await access.createMediaKeys();
      const session = keys.createSession();
      const message = new Promise<void>((resolve) =>
        session.addEventListener('message', () => resolve(), { once: true }),
      );
      await session.generateRequest(
        'keyids',
        new TextEncoder().encode(JSON.stringify({ kids: ['AAECAwQFBgcICQoLDA0ODw'] })),
      );
      await message;
      await session.update(
        new TextEncoder().encode(
          JSON.stringify({
            keys: [{ kty: 'oct', kid: 'AAECAwQFBgcICQoLDA0ODw', k: 'tQ0bJVWb6b0KPL6KtZIy_A' }],
          }),
        ),
      );
    });
    await expect
      .poll(() =>
        worker.evaluate(async () => {
          const stored = (await browser.storage.local.get('all-keys'))['all-keys'];
          return typeof stored === 'string'
            ? JSON.parse(stored).filter(
                (key: { value: string }) => key.value === 'b50d1b25559be9bd0a3cbe8ab59232fc',
              ).length
            : 0;
        }),
      )
      .toBe(1);
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
    await popup.getByRole('link', { name: 'Captures', exact: true }).click();
    await popup.locator('[data-history-row]').first().click();
    const choices = popup.locator('button[aria-pressed]');
    const command = popup.getByRole('textbox', { name: 'Download command' });
    const copy = popup.getByRole('button', { name: 'Copy command', exact: true });
    await expect
      .poll(() => choices.allTextContents())
      .toEqual([
        `HLS master · Seen on page${master}`,
        `HLS media · Seen on page${media}`,
        `MSS · Seen on page${mss}`,
      ]);
    expect(await copy.isDisabled()).toBe(true);
    expect(await command.inputValue()).toBe('');
    for (const url of [master, media, mss]) {
      const choice = choices.filter({ hasText: url });
      await choice.click();
      expect(await choice.getAttribute('aria-pressed')).toBe('true');
      expect(await popup.locator('button[aria-pressed="true"]').count()).toBe(1);
      expect(await command.inputValue()).toBe(
        `N_m3u8DL-RE '${url}' --key '000102030405060708090a0b0c0d0e0f:b50d1b25559be9bd0a3cbe8ab59232fc'`,
      );
      expect(await copy.isEnabled()).toBe(true);
    }
    await command.fill('edited command');
    await choices.filter({ hasText: master }).click();
    expect(await command.inputValue()).toContain(master);
    await mkdir(resolve('output/playwright/manifest'), { recursive: true });
    await copy.scrollIntoViewIfNeeded();
    await popup.screenshot({ path: resolve('output/playwright/manifest/selected.png') });
    const input = popup.getByRole('textbox', { name: 'Manifest URL', exact: true });
    await input.fill('javascript:alert(1)');
    expect(await copy.isDisabled()).toBe(true);
    expect(await command.inputValue()).toBe('');
    expect(await popup.locator('button[aria-pressed="true"]').count()).toBe(0);
    await input.fill('https://okova.test/manual.m3u8');
    expect(await command.inputValue()).toContain('https://okova.test/manual.m3u8');
    await input.fill('');
    await popup.screenshot({ path: resolve('output/playwright/manifest/missing.png') });
  } finally {
    await context.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(profile, { recursive: true, force: true });
  }
});
