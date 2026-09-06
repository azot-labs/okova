import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  test: {
    // Offline checks never opt into private fixtures through a developer's environment.
    env: {
      VITEST_WVD_PATH: '',
      VITEST_PRD_PATH: '',
      VITEST_WIDEVINE_CLIENT_ID_PATH: '',
      VITEST_WIDEVINE_PRIVATE_KEY_PATH: '',
    },
    exclude: [...configDefaults.exclude, 'test/e2e/**', 'test/integration/**'],
  },
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      '@okova/lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
});
