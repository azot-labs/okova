import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  plugins: [WxtVitest()],
  resolve: {
    alias: { '@okova/lib': fileURLToPath(new URL('./src/lib', import.meta.url)) },
  },
  test: {
    include: ['test/integration/**/*.test.ts'],
    env: loadEnv('test', process.cwd(), 'VITEST_'),
    testTimeout: 60_000,
    hookTimeout: 30_000,
  },
});
