import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

const inline = `
  // Simulate a site racing the extension's storage read and runtime injection.
  window.addEventListener('message', (event) => {
    if (event.source !== window || !['drm-startup', 'drm-message'].includes(event.data?.type)) return;
    const action = event.data.action ?? event.data.log?.action;
    if (!['startup-settings', 'load-eme'].includes(action)) return;
    window.dispatchEvent(new CustomEvent('drm-message-response', { detail: JSON.stringify({
      requestId: event.data.requestId ?? event.data.token,
      body: action === 'startup-settings'
        ? { emeInterception: false, requestInterception: true, spoofing: false, clientPlayback: false }
        : false,
    }) }));
  });
  const cachedCreateKeys = MediaKeySystemAccess.prototype.createMediaKeys;
  const cachedCreateSession = MediaKeys.prototype.createSession;
  const cachedGenerate = MediaKeySession.prototype.generateRequest;
  const cachedAccess = navigator.requestMediaKeySystemAccess.bind(navigator);
  window.startup = { manifestBeforeInline: window.MPD_LIST instanceof Map };
  cachedAccess('org.w3.clearkey', [{ initDataTypes: ['keyids'], videoCapabilities: [{ contentType: 'video/webm; codecs="vp8"' }] }])
    .then(async (access) => {
      const keys = await cachedCreateKeys.call(access);
      const session = cachedCreateSession.call(keys);
      await cachedGenerate.call(session, 'keyids', new TextEncoder().encode(JSON.stringify({ kids: ['AAAAAAAAAAAAAAAAAAAAAA'] })));
      window.startup.patchedBeforeAccess = typeof session._initData === 'string';
      await session.close();
    })
    .catch(error => { window.startup.error = error.message; });
`;

test('document-start bootstrap handles CSP, Trusted Types, frames, and settings after reload', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'okova-startup-'));
  const extension = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    await expect
      .poll(() =>
        worker.evaluate(async () => (await browser.storage.local.get('settings')).settings),
      )
      .toBeTruthy();
    await expect
      .poll(() => worker.evaluate(() => browser.scripting.getRegisteredContentScripts()))
      .not.toEqual([]);
    const initial = await worker.evaluate(async () =>
      JSON.parse(String((await browser.storage.local.get('settings')).settings)),
    );
    expect(initial.emeInterception).toBe(true);
    const errors: string[] = [];
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await context.route('http://localhost/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        headers: {
          'Content-Security-Policy':
            "default-src 'none'; script-src 'nonce-okova'; frame-src 'self'; require-trusted-types-for 'script'; trusted-types 'none'",
        },
        body: route.request().url().endsWith('/plain')
          ? '<!doctype html><title>No DRM</title>'
          : `<!doctype html><script nonce="okova">${inline}</script>${route.request().url().endsWith('/frame') ? '' : `<iframe src="/frame"></iframe><iframe srcdoc="&lt;script nonce='okova'&gt;${inline.replaceAll('"', '&quot;')}&lt;/script&gt;"></iframe>`}`,
      }),
    );
    await context.route('http://okova.test/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>Plain HTTP</title>',
      }),
    );
    await page.goto('http://okova.test/plain');
    expect(await page.evaluate(() => window.isSecureContext)).toBe(false);
    expect(await page.evaluate(() => typeof window.__okovaEmeInstaller)).toBe('undefined');
    await page.goto('http://localhost/plain');
    await expect.poll(() => page.evaluate(() => window.MPD_LIST instanceof Map)).toBe(true);
    expect(await page.evaluate(() => typeof window.__okovaEmeInstaller)).toBe('undefined');
    expect(
      await page.evaluate(() => ({
        fetch: fetch.toString().includes('[native code]'),
        xhr: XMLHttpRequest.toString().includes('[native code]'),
      })),
    ).toEqual({ fetch: true, xhr: true });
    for (const enabled of [true, false, true]) {
      await worker.evaluate(async (enabled) => {
        const stored = await browser.storage.local.get('settings');
        await browser.storage.local.set({
          settings: JSON.stringify({
            ...JSON.parse(String(stored.settings)),
            emeInterception: enabled,
          }),
        });
      }, enabled);
      await expect
        .poll(() =>
          worker.evaluate(async () =>
            (await browser.scripting.getRegisteredContentScripts()).some((script) =>
              script.js?.includes('eme-bootstrap.js'),
            ),
          ),
        )
        .toBe(enabled);
      await page.goto('http://localhost/startup');
      await expect.poll(() => page.frames().length).toBe(3);
      for (const frame of page.frames()) {
        await expect
          .poll(() => frame.evaluate(() => Reflect.get(window, 'startup')))
          .toEqual({ manifestBeforeInline: true, patchedBeforeAccess: enabled });
        expect(await frame.evaluate(() => typeof window.__okovaEmeInstaller)).toBe(
          enabled ? 'function' : 'undefined',
        );
      }
      // Changes are applied on the next load; existing pages keep their installed hooks.
      const before = await page.evaluate(() =>
        MediaKeySession.prototype.generateRequest.toString(),
      );
      await worker.evaluate(async (enabled) => {
        const stored = await browser.storage.local.get('settings');
        await browser.storage.local.set({
          settings: JSON.stringify({
            ...JSON.parse(String(stored.settings)),
            emeInterception: !enabled,
          }),
        });
      }, enabled);
      expect(await page.evaluate(() => MediaKeySession.prototype.generateRequest.toString())).toBe(
        before,
      );
    }
    await context.route('http://localhost/playback', (route) =>
      route.fulfill({
        contentType: 'text/html',
        headers: {
          'Content-Security-Policy':
            "default-src 'none'; script-src 'nonce-okova'; require-trusted-types-for 'script'; trusted-types 'none'",
        },
        body: `<!doctype html><script nonce="okova">
        const cached = {
          access: navigator.requestMediaKeySystemAccess.bind(navigator),
          keys: MediaKeySystemAccess.prototype.createMediaKeys,
          session: MediaKeys.prototype.createSession,
          certificate: MediaKeys.prototype.setServerCertificate,
          generate: MediaKeySession.prototype.generateRequest,
          update: MediaKeySession.prototype.update,
        };
        (async () => {
          const access = await cached.access('com.widevine.alpha', [{ initDataTypes: ['cenc'], videoCapabilities: [{ contentType: 'video/webm; codecs="vp8"' }] }]);
          const keys = await cached.keys.call(access);
          const certificate = await cached.certificate.call(keys, new Uint8Array([1]));
          // Page overrides that delegate to cached methods must not recurse.
          keys.createSession = () => cached.session.call(keys);
          const session = keys.createSession();
          let generateError, updateError;
          try { await cached.generate.call(session, 'webm', new Uint8Array([1])); }
          catch (error) { generateError = error.message; }
          try { await cached.update.call(session, new Uint8Array([1])); }
          catch (error) { updateError = error.message; }
          window.playback = { certificate, adapted: Object.hasOwn(session, 'generateRequest'), generateError, updateError };
        })().catch(error => { window.playback = { error: error.message }; });
      </script>`,
      }),
    );
    await worker.evaluate(async () => {
      await browser.storage.local.set({
        settings: JSON.stringify({
          emeInterception: true,
          spoofing: true,
          clientPlayback: true,
          requestInterception: false,
          theme: 'auto',
        }),
        'client-registry': {
          clients: [
            {
              id: 'test',
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
          activeClientId: 'test',
        },
      });
    });
    await page.goto('http://localhost/playback');
    await expect
      .poll(() => page.evaluate(() => Reflect.get(window, 'playback')))
      .toEqual({
        certificate: true,
        adapted: true,
        generateError: 'Playback requires cenc initialization data',
        updateError: 'Session is not active',
      });
    // A failed browser injection must let the player's cached EME call use native playback.
    await worker.evaluate(() => {
      browser.scripting.executeScript = async () => {
        throw new Error('Test injection failure');
      };
    });
    await worker.evaluate(async () => {
      const stored = await browser.storage.local.get('settings');
      await browser.storage.local.set({
        settings: JSON.stringify({ ...JSON.parse(String(stored.settings)), emeInterception: true }),
      });
    });
    await page.goto('http://localhost/failure');
    for (const frame of page.frames()) {
      await expect
        .poll(() => frame.evaluate(() => Reflect.get(window, 'startup')), { timeout: 5_000 })
        .toEqual({ manifestBeforeInline: true, patchedBeforeAccess: false });
    }
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
