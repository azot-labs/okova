import { dirname, resolve } from 'node:path';
import { loadEnv } from 'vite';
import { defineConfig } from 'wxt';
import arraybuffer from 'vite-plugin-arraybuffer';

const devEnv = loadEnv('development', process.cwd(), 'WXT_');

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: './src/extension',
  manifest: {
    name: 'Okova',
    permissions: ['storage', 'tabs', 'activeTab', 'clipboardWrite'],
    host_permissions: ['https://*/*'],
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
