import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'test/e2e/**'],
  },
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      '@okova/lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
});
