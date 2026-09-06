import { generateKeyPairSync } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium, type Page } from 'playwright';
import { expect, test } from 'vitest';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../../src/lib/widevine/proto';
import { buildWvd, WVD_DEVICE_TYPES } from '../../src/lib/widevine/wvd';
import type { KeyInfo } from '../../src/extension/utils/storage';

declare const chrome: typeof import('wxt/browser').browser;

// Generated credentials exercise client screens without using a real device identity.
const createClientFile = () => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'der' },
    publicKeyEncoding: { type: 'spki', format: 'der' },
  });
  const certificate = DrmCertificate.encode(DrmCertificate.create({ systemId: 123 })).finish();
  const token = SignedDrmCertificate.encode(
    SignedDrmCertificate.create({ drmCertificate: certificate }),
  ).finish();
  const clientId = ClientIdentification.encode(
    ClientIdentification.create({
      token,
      clientInfo: [
        { name: 'company_name', value: 'Unknown' },
        { name: 'model_name', value: 'Android SDK Built For X86' },
      ],
    }),
  ).finish();
  return Buffer.from(
    buildWvd({
      deviceType: WVD_DEVICE_TYPES.android,
      securityLevel: 3,
      privateKey,
      clientId,
    }),
  );
};

const measureLayout = (popup: Page) =>
  popup.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) throw new Error('Popup root is missing');
    const rightEdge = Math.min(
      document.documentElement.clientWidth,
      root.getBoundingClientRect().left + root.clientWidth,
    );
    const clipped = [...document.querySelectorAll<HTMLElement>('main, .rounded-lg, code, textarea')]
      .filter((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.width > 0 && (bounds.left < 0 || bounds.right > rightEdge + 0.5);
      })
      .map((element) => element.tagName);
    const cards = [...document.querySelectorAll<HTMLElement>('main .rounded-lg')]
      .map((element) => element.getBoundingClientRect())
      .filter((bounds) => bounds.width > 0);
    return {
      width: innerWidth,
      height: innerHeight,
      contentWidth: root.clientWidth,
      edgeSpacing: {
        left: Math.min(...cards.map((bounds) => bounds.left)),
        right: innerWidth - Math.max(...cards.map((bounds) => bounds.right)),
      },
      horizontalOverflow:
        root.scrollWidth > root.clientWidth || document.documentElement.scrollWidth > innerWidth,
      scrollable: root.scrollHeight > root.clientHeight,
      clipped,
    };
  });

test.for(['light', 'dark'])(
  'native popup keeps its width and content visible in %s theme',
  async (theme) => {
    const profile = await mkdtemp(join(tmpdir(), 'okova-popup-layout-'));
    const extension = resolve('.output/chrome-mv3');
    const screenshots = resolve('output/playwright/popup-layout', theme);
    await mkdir(screenshots, { recursive: true });
    try {
      const context = await chromium.launchPersistentContext(profile, {
        channel: 'chromium',
        headless: false,
        viewport: null,
        args: [
          '--remote-debugging-port=0',
          `--disable-extensions-except=${extension}`,
          `--load-extension=${extension}`,
        ],
      });
      try {
        const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
        await worker.evaluate(
          (theme) =>
            chrome.storage.local.set({
              settings: JSON.stringify({
                emeInterception: true,
                spoofing: false,
                clientPlayback: false,
                requestInterception: false,
                theme,
              }),
            }),
          theme,
        );
        await context.route('https://popup-layout.test/**', (route) =>
          route.fulfill({
            contentType: 'text/html',
            body: '<title>Popup layout fixture</title>',
          }),
        );
        const website = context.pages()[0] ?? (await context.newPage());
        await website.goto('https://popup-layout.test/demo');
        await worker.evaluate(() => chrome.action.openPopup());

        // A second CDP connection discovers the native toolbar popup, whose viewport
        // Chrome sizes itself. Opening popup.html in a fixed-size tab misses this bug.
        const port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
        const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
        const popup = browser
          .contexts()
          .flatMap((context) => context.pages())
          .find((page) => page.url().endsWith('/popup.html'));
        if (!popup) throw new Error('Native extension popup did not open');
        popup.setDefaultTimeout(10_000);
        const errors: string[] = [];
        popup.on('pageerror', (error) => errors.push(error.message));

        const capture = async (name: string, scrollable: boolean) => {
          try {
            await expect
              .poll(() => measureLayout(popup))
              .toMatchObject({
                width: 500,
                contentWidth: 484,
                edgeSpacing: { left: 16, right: 16 },
                horizontalOverflow: false,
                clipped: [],
                scrollable,
              });
          } catch (error) {
            await popup.screenshot({ path: join(screenshots, `${name}-failed.png`) });
            throw error;
          }
          const layout = await measureLayout(popup);
          expect(layout.height).toBeGreaterThanOrEqual(500);
          expect(layout.height).toBeLessThanOrEqual(600);
          await popup.screenshot({ path: join(screenshots, `${name}.png`) });
        };
        const back = () => popup.locator('main:visible > div').first().getByRole('link').click();

        await popup.getByText('Keys will appear here', { exact: true }).waitFor();
        await capture('01-dashboard-empty', false);
        for (let index = 0; index < 3; index++) {
          await popup.getByRole('link', { name: 'Settings', exact: true }).click();
          await capture(`02-settings-${index}`, true);
          await popup.getByRole('button', { name: 'GitHub', exact: true }).scrollIntoViewIfNeeded();
          await capture(`03-settings-bottom-${index}`, true);
          await back();
          await capture(`04-dashboard-return-${index}`, false);
        }

        await popup.getByRole('link', { name: 'Clients', exact: true }).click();
        await capture('05-clients-empty', false);
        await popup.getByLabel('Import client').setInputFiles({
          name: 'layout-fixture.wvd',
          mimeType: 'application/octet-stream',
          buffer: createClientFile(),
        });
        await popup.getByText('Widevine L3', { exact: true }).waitFor();
        await capture('06-clients', false);
        await popup.getByText('Widevine L3', { exact: true }).hover();
        await popup.locator('svg').filter({ hasText: 'Client Settings' }).click();
        await popup.getByText('Google Widevine', { exact: true }).waitFor();
        await capture('07-client-settings', false);
        await popup.locator('main:visible > div').first().locator('svg').click();
        await back();
        await popup.getByText('Active', { exact: true }).waitFor();
        await capture('08-dashboard-client', false);

        const keys: KeyInfo[] = Array.from({ length: 20 }, (_, index) => ({
          id: index.toString(16).padStart(32, 'a'),
          value: 'b'.repeat(32),
          url: 'https://popup-layout.test/demo',
          pssh: 'A'.repeat(180),
          createdAt: Date.now(),
        }));
        await worker.evaluate(
          (keys) =>
            chrome.storage.local.set({
              'recent-keys-by-domain': JSON.stringify({ 'popup-layout.test': keys.slice(0, 5) }),
              'all-keys': JSON.stringify(keys),
            }),
          keys,
        );
        await expect.poll(() => popup.locator('code').count()).toBe(5);
        await capture('09-dashboard-keys', false);
        await popup.getByRole('link', { name: 'Keys', exact: true }).click();
        await expect.poll(() => popup.locator('code').count()).toBe(20);
        await capture('10-keys', true);
        await popup.locator('code').last().scrollIntoViewIfNeeded();
        await capture('11-keys-bottom', true);
        await popup.locator('code').last().click();
        await popup.getByText('Key Settings', { exact: true }).waitFor();
        await capture('12-key-settings', false);
        await popup.getByText('Copy command', { exact: true }).scrollIntoViewIfNeeded();
        await capture('13-key-settings-bottom', false);
        await popup.locator('main:visible > div').first().locator('svg').click();
        await back();
        await capture('14-dashboard-final', false);
        expect(errors).toEqual([]);
        await popup.close();
        for (let index = 0; index < 2; index++) {
          await worker.evaluate(() => chrome.action.openPopup());
          const reopenedBrowser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
          const reopened = reopenedBrowser
            .contexts()
            .flatMap((context) => context.pages())
            .find((page) => page.url().endsWith('/popup.html'));
          if (!reopened) throw new Error('Native extension popup did not reopen');
          await expect.poll(() => reopened.locator('code').count()).toBe(5);
          await expect
            .poll(() => measureLayout(reopened))
            .toMatchObject({
              width: 500,
              contentWidth: 484,
              edgeSpacing: { left: 16, right: 16 },
              horizontalOverflow: false,
              clipped: [],
              scrollable: false,
            });
          await reopened.screenshot({ path: join(screenshots, `15-reopened-${index}.png`) });
          await reopened.close();
        }
      } finally {
        await context.close();
      }
    } finally {
      await rm(profile, { recursive: true, force: true });
    }
  },
);
