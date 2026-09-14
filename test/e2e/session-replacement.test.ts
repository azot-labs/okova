import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

const pssh = Buffer.alloc(52);
pssh.writeUInt32BE(52);
pssh.write('pssh', 4);
pssh[8] = 1;
Buffer.from('1077efecc0b24d02ace33c1e52e2fb4b', 'hex').copy(pssh, 12);
pssh.writeUInt32BE(1, 28);
Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex').copy(pssh, 32);

test.each(['pssh', 'default-kid'])(
  'repeated completed EME sessions linked by %s replace stored results and remain deletable as one capture',
  async (association) => {
    const profile = await mkdtemp(join(tmpdir(), 'okova-session-replacement-'));
    const extension = resolve('.output/chrome-mv3');
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      headless: true,
      viewport: { width: 500, height: 800 },
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
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
            clientPlayback: false,
            emeInterception: true,
            requestInterception: true,
            theme: 'dark',
          }),
        });
      });
      await context.route('https://replacement.test/**', (route) =>
        route.fulfill({
          contentType: route.request().url().endsWith('.mpd') ? 'binary/octet-stream' : 'text/html',
          body: route.request().url().endsWith('.mpd')
            ? `<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" xmlns:cenc="urn:mpeg:cenc:2013"><Period><AdaptationSet>${association === 'pssh' ? `<ContentProtection><cenc:pssh>${pssh.toString('base64')}</cenc:pssh></ContentProtection>` : '<ContentProtection cenc:default_KID="00010203-0405-0607-0809-0a0b0c0d0e0f"/>'}</AdaptationSet></Period></MPD>`
            : '<title>Session replacement</title>',
        }),
      );
      const source = await context.newPage();
      await source.goto('https://replacement.test/watch');
      await source.evaluate(async () => {
        await fetch('/movie.mpd');
      });
      await expect.poll(() => source.evaluate(() => window.MANIFEST_LIST.size)).toBe(1);
      const completeSession = () =>
        source.evaluate(
          async (initData) => {
            const access = await navigator.requestMediaKeySystemAccess('org.w3.clearkey', [
              {
                initDataTypes: ['cenc'],
                videoCapabilities: [{ contentType: 'video/webm; codecs="vp8"' }],
              },
            ]);
            const keys = await access.createMediaKeys();
            const session = keys.createSession();
            const message = new Promise<void>((resolve) =>
              session.addEventListener('message', () => resolve(), { once: true }),
            );
            await session.generateRequest('cenc', new Uint8Array(initData));
            await message;
            await session.update(
              new TextEncoder().encode(
                JSON.stringify({
                  keys: [
                    {
                      kty: 'oct',
                      kid: 'AAECAwQFBgcICQoLDA0ODw',
                      k: 'tQ0bJVWb6b0KPL6KtZIy_A',
                    },
                  ],
                }),
              ),
            );
            return session.sessionId;
          },
          [...pssh],
        );
      const readHistory = () =>
        worker.evaluate(async () => {
          const stored = (await browser.storage.local.get('all-keys'))['all-keys'];
          return typeof stored === 'string' ? JSON.parse(stored) : [];
        });
      await completeSession();
      await expect
        .poll(
          async () =>
            (await readHistory()).filter(
              (key: { value: string }) => key.value === 'b50d1b25559be9bd0a3cbe8ab59232fc',
            ).length,
        )
        .toBe(1);
      const firstId = (await readHistory())[0].captureId;
      await completeSession();
      await expect
        .poll(async () => {
          const records = await readHistory();
          return (
            records.length === 1 &&
            records[0].captureId !== firstId &&
            records[0].value === 'b50d1b25559be9bd0a3cbe8ab59232fc'
          );
        })
        .toBe(true);
      const tabId = await worker.evaluate(
        async () => (await browser.tabs.query({ url: 'https://replacement.test/watch' }))[0]!.id!,
      );
      await expect
        .poll(() =>
          worker.evaluate(async (tabId) => {
            const records = (await browser.storage.session.get(`capture-diagnostics:${tabId}`))[
              `capture-diagnostics:${tabId}`
            ];
            return Array.isArray(records) ? records.length : 0;
          }, tabId),
        )
        .toBe(1);
      const popup = await context.newPage();
      await worker.evaluate((id) => browser.tabs.update(id, { active: true }), tabId);
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await popup.getByRole('link', { name: 'Captures', exact: true }).click();
      await popup.getByRole('button', { name: 'Refresh', exact: true }).click();
      const capture = popup.locator('details[data-history-row]').filter({ hasText: 'movie.mpd' });
      await capture.locator(':scope > summary').click({ position: { x: 8, y: 8 } });
      await expect.poll(() => capture.locator('[data-key-record]').count()).toBe(1);
      await expect.poll(() => capture.locator('[data-capture-id]').count()).toBe(1);
      await mkdir('output/playwright/session-replacement', { recursive: true });
      await popup.screenshot({
        path: `output/playwright/session-replacement/${association}.png`,
        fullPage: true,
      });
      await capture.getByRole('checkbox').check();
      await popup.getByRole('button', { name: 'Delete Selected (1)', exact: true }).click();
      await popup
        .getByRole('dialog')
        .getByRole('button', { name: 'Delete 1 capture', exact: true })
        .click();
      await expect.poll(async () => (await readHistory()).length).toBe(0);
      await popup.goto(`chrome-extension://${new URL(worker.url()).hostname}/popup.html`);
      await popup.getByRole('link', { name: 'Captures', exact: true }).click();
      await expect.poll(() => popup.locator('[data-key-record]').count()).toBe(0);
    } finally {
      await context.close();
      await rm(profile, { recursive: true, force: true });
    }
  },
);
