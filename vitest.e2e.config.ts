import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/e2e/**/*.test.ts'],
    env: loadEnv('test', process.cwd(), 'VITEST_'),
    testTimeout: 150_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
