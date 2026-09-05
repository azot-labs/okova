import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      '@okova/lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
});
