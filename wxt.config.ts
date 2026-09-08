import { createHash } from 'node:crypto';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadEnv } from 'vite';
import { defineConfig } from 'wxt';
import arraybuffer from 'vite-plugin-arraybuffer';

const devEnv = loadEnv('development', process.cwd(), 'WXT_');

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: './src/extension',
  hooks: {
    'config:resolved': async (wxt) => {
      if (wxt.config.command !== 'serve' || wxt.config.browser === 'firefox') return;
      // Chromium hashes the unpacked extension path, using UTF-16 on Windows.
      const isWindows = process.platform === 'win32';
      const outputPath = resolve(wxt.config.outDir).replace(/^[a-z]:/, (drive) =>
        isWindows ? drive.toUpperCase() : drive,
      );
      const extensionId = createHash('sha256')
        .update(outputPath, isWindows ? 'utf16le' : 'utf8')
        .digest('hex')
        .slice(0, 32)
        .replace(/[0-9a-f]/g, (digit) => String.fromCharCode(97 + parseInt(digit, 16)));
      const webExt = wxt.config.webExt.config;
      // chrome-launcher opens its logs before Chromium can create a fresh profile.
      if (webExt.chromiumProfile) await mkdir(webExt.chromiumProfile, { recursive: true });
      webExt.chromiumPref = {
        ...webExt.chromiumPref,
        'extensions.pinned_extensions': [extensionId],
      };
    },
    'build:done': async (wxt) => {
      if (wxt.config.mode !== 'production') return;
      // Bound both the isolated bridge and the combined MAIN startup scripts.
      const budgetBytes = 32 * 1024;
      for (const paths of [
        ['content-scripts/content.js'],
        ['content-scripts/bootstrap.js', 'eme-bootstrap.js', 'network.js'],
      ]) {
        const sizes = await Promise.all(
          paths.map(async (path) => (await stat(resolve(wxt.config.outDir, path))).size),
        );
        const size = sizes.reduce((sum, size) => sum + size, 0);
        if (size > budgetBytes) {
          throw new Error(`${paths.join(' + ')} is ${size} bytes; budget is ${budgetBytes} bytes`);
        }
      }
    },
  },
  manifest: {
    name: 'Okova',
    permissions: ['scripting', 'storage', 'tabs', 'activeTab', 'clipboardWrite'],
    host_permissions: ['https://*/*', 'http://*/*'],
    minimum_chrome_version: '111',
    browser_specific_settings: { gecko: { strict_min_version: '128.0' } },
  },
  webExt: {
    startUrls: ['https://bitmovin.com/demos/drm'],
    // Let web-ext apply development preferences to the profile Helium actually uses.
    chromiumProfile: resolve('.wxt/chrome-data'),
    keepProfileChanges: true,
    // Hide startup flag banners while retaining web-ext's AutomationControlled override.
    chromiumArgs: ['--test-type'],
    disabled: devEnv.WXT_BROWSER_AUTOSTART === 'false',
    binaries: {
      ...(devEnv.WXT_CHROMIUM_BINARY && { chrome: devEnv.WXT_CHROMIUM_BINARY }),
      ...(devEnv.WXT_FIREFOX_BINARY && { firefox: devEnv.WXT_FIREFOX_BINARY }),
    },
  },
  imports: {
    presets: [
      // Adds SolidJS reactive primitives to WXT's global auto-imports
      {
        package: 'solid-js',
        imports: ['createSignal', 'createEffect', 'createMemo', 'onMount', 'onCleanup'],
      },
    ],
  },
  modules: ['@wxt-dev/module-solid'],
  vite: () => ({
    plugins: [arraybuffer()],
    resolve: {
      alias: {
        '@okova/lib': resolve(dirname('.'), './src/lib'),
      },
    },
  }),
});
