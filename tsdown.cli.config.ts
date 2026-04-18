import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/cli/main.ts'],
  outDir: 'dist/cli',
  format: ['cjs'],
  shims: true,
  dts: false,
  clean: true,
  checks: {
    legacyCjs: false,
  },
  outExtensions: () => ({
    js: '.cjs',
  }),
  deps: {
    neverBundle: [
      '@fastify/autoload',
      '@fastify/helmet',
      '@fastify/rate-limit',
      '@fastify/sensible',
      '@fastify/type-provider-typebox',
      '@sinclair/typebox',
      'fastify',
    ],
  },
});
