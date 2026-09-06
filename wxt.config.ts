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
      // Every matching frame pays this cost. Keep device parsing out of the bridge.
      const budgetBytes = 20 * 1024;
      const { size } = await stat(resolve(wxt.config.outDir, 'content-scripts/content.js'));
      if (size > budgetBytes) {
        throw new Error(`Content script is ${size} bytes; budget is ${budgetBytes} bytes`);
      }
    },
  },
  manifest: {
    name: 'Okova',
    permissions: ['storage', 'tabs', 'activeTab', 'clipboardWrite'],
    host_permissions: ['https://*/*', 'http://*/*'],
    web_accessible_resources: [
      {
        resources: ['eme.js', 'eme-playback.js', 'network.js', 'manifest.js'],
        matches: ['<all_urls>'],
      },
    ],
  },
  webExt: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    disabled: devEnv.WXT_BROWSER_AUTOSTART === 'false',
    binaries: devEnv.WXT_CHROMIUM_BINARY ? { chrome: devEnv.WXT_CHROMIUM_BINARY } : undefined,
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
