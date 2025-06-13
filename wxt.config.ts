import { dirname, resolve } from 'node:path';
import { defineConfig } from 'wxt';
import arraybuffer from 'vite-plugin-arraybuffer';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: './src/extension',
  manifest: {
    name: 'Orlan',
    permissions: ['storage', 'tabs', 'activeTab', 'clipboardWrite'],
    host_permissions: ['https://*/*'],
    web_accessible_resources: [
      {
        resources: ['eme.js', 'network.js', 'manifest.js'],
        matches: ['<all_urls>'],
      },
    ],
  },
  webExt: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    disabled: true,
  },
  modules: ['@wxt-dev/module-solid'],
  vite: () => ({
    plugins: [arraybuffer()],
    resolve: {
      alias: {
        '@orlan/lib': resolve(dirname('.'), './src/lib'),
      },
    },
  }),
});
