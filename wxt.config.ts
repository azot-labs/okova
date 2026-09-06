import { stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadEnv } from 'vite';
import { defineConfig } from 'wxt';
import arraybuffer from 'vite-plugin-arraybuffer';

const devEnv = loadEnv('development', process.cwd(), 'WXT_');

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: './src/extension',
  hooks: {
    'build:done': async (wxt) => {
      if (wxt.config.mode !== 'production') return;
      // Bound both the isolated bridge and the combined MAIN startup scripts.
      const budgetBytes = 20 * 1024;
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
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
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
