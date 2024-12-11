import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/lib/main.ts'],
  outDir: 'dist/lib',
  bundle: true,
  format: ['cjs', 'esm'],
  shims: true,
  dts: true,
  clean: true,
});
