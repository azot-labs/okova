import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/lib/main.ts'],
  outDir: 'dist/lib',
  format: ['cjs', 'esm'],
  shims: true,
  dts: true,
  clean: true,
  checks: {
    legacyCjs: false,
  },
  deps: {
    onlyBundle: false,
  },
  outExtensions: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.js',
    dts: format === 'cjs' ? '.d.cts' : '.d.ts',
  }),
});
