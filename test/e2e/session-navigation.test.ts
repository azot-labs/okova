import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium, type BrowserContext } from 'playwright';
import { expect, test } from 'vitest';
import { z } from 'zod';

declare const chrome: typeof import('wxt/browser').browser;

const responseSchema = z.object({ body: z.string().nullish() });

test('preserves sessions until a reload or terminal navigation error', async () => {
  let hasStarted = false;
  let hasStalled = false;
  const release = Promise.withResolvers<void>();
  let closes = 0;
  const server = createServer(async (request, response) => {
    response.setHeader('content-type', 'application/json');
    if (request.url === '/stall') {
      hasStalled = true;
      return;
    }
    if (request.url === '/network-error') {
      request.socket.destroy();
      return;
    }
    if (request.url === '/sessions') {
      response.end(JSON.stringify({ id: 'navigation-session' }));
    } else if (request.url?.endsWith('/generate-request')) {
      hasStarted = true;
      await release.promise;
      response.end(JSON.stringify({ message: 'AQID', messageType: 'license-request' }));
    } else if (request.url?.endsWith('/close')) {
      closes++;
      response.end(JSON.stringify({ success: true }));
    } else {
      response.setHeader('content-type', 'text/html');
      response.end('<!doctype html><title>Session navigation</title>');
    }
  });
  let profile: string | undefined;
  let context: BrowserContext | undefined;
  try {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server port');
    const baseUrl = `http://127.0.0.1:${address.port}`;
    profile = await mkdtemp(join(tmpdir(), 'okova-navigation-'));
    const extension = resolve('.output/chrome-mv3');
    context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      headless: true,
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await expect
      .poll(() =>
        worker.evaluate(async () => (await chrome.storage.local.get('settings')).settings),
      )
      .toBeTruthy();
    await worker.evaluate(async (baseUrl) => {
      await chrome.storage.local.set({
        settings: JSON.stringify({
          spoofing: true,
          emeInterception: true,
          requestInterception: false,
          theme: 'auto',
        }),
        'credentials-registry': {
          credentials: [
            {
              id: 'test',
              info: {
                type: 'remote',
                config: {
                  protocol: 'okova',
                  keySystem: 'com.widevine.alpha',
                  baseUrl,
                },
              },
            },
          ],
          activeCredentialsId: 'test',
        },
      });
      chrome.webNavigation.onErrorOccurred.addListener(({ error }) => {
        void chrome.storage.session.set({ 'test-navigation-error': error });
      });
      chrome.tabs.onUpdated.addListener((_tabId, change) => {
        if (change.url) void chrome.storage.session.set({ 'test-navigation-url': change.url });
      });
    }, baseUrl);
    const page = await context.newPage();
    await page.goto(`${baseUrl}/video`);
    const send = (action: string) =>
      page.evaluate(
        (action) =>
          new Promise<string>((resolve) => {
            const requestId = crypto.randomUUID();
            window.addEventListener('drm-message-response', function listener(event) {
              if (!(event instanceof CustomEvent) || typeof event.detail !== 'string') return;
              if (JSON.parse(event.detail).requestId !== requestId) return;
              window.removeEventListener('drm-message-response', listener);
              resolve(event.detail);
            });
            window.postMessage(
              {
                type: 'drm-message',
                requestId,
                log: {
                  action,
                  sessionToken: 'navigation',
                  keySystem: 'com.widevine.alpha',
                  initData: 'cHNzaA==',
                  initDataType: 'cenc',
                },
              },
              '*',
            );
          }),
        action,
      );
    const generating = send('generateRequest');
    await expect.poll(() => hasStarted, { timeout: 10_000 }).toBe(true);
    for (const method of ['pushState', 'replaceState', 'hash'] as const) {
      const url = await page.evaluate((method) => {
        if (method === 'hash') location.hash = 'chapter';
        else history[method]({}, '', `/${method}`);
        return location.href;
      }, method);
      await expect
        .poll(() =>
          worker.evaluate(
            async () =>
              (await chrome.storage.session.get('test-navigation-url'))['test-navigation-url'],
          ),
        )
        .toBe(url);
      expect(closes).toBe(0);
    }
    release.resolve();
    await generating;
    expect(responseSchema.parse(JSON.parse(await send('license-request'))).body).toBe('AQID');
    expect(closes).toBe(0);
    const cancelled = page.goto(`${baseUrl}/stall`).catch(() => {});
    await expect.poll(() => hasStalled).toBe(true);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.stopLoading');
    await cancelled;
    await expect
      .poll(() =>
        worker.evaluate(
          async () =>
            (await chrome.storage.session.get('test-navigation-error'))['test-navigation-error'],
        ),
      )
      .toBe('net::ERR_ABORTED');
    expect(responseSchema.parse(JSON.parse(await send('license-request'))).body).toBe('AQID');
    expect(closes).toBe(0);
    await page.reload();
    await expect.poll(() => closes).toBe(1);
    expect(responseSchema.parse(JSON.parse(await send('license-request'))).body).toBeNull();
    await send('generateRequest');
    expect(responseSchema.parse(JSON.parse(await send('license-request'))).body).toBe('AQID');
    await expect(page.goto(`${baseUrl}/network-error`)).rejects.toThrow('net::ERR_EMPTY_RESPONSE');
    await expect.poll(() => closes).toBe(2);
  } finally {
    release.resolve();
    try {
      await context?.close();
    } finally {
      try {
        server.closeAllConnections();
        if (server.listening)
          await new Promise<void>((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          );
      } finally {
        if (profile) await rm(profile, { recursive: true, force: true });
      }
    }
  }
});
