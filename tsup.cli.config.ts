import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/main.ts'],
  outDir: 'dist/cli',
  bundle: true,
  format: ['cjs'],
  shims: true,
  dts: false,
  clean: true,
  external: [
    '@fastify/autoload',
    '@fastify/helmet',
    '@fastify/rate-limit',
    '@fastify/sensible',
    '@fastify/type-provider-typebox',
    '@sinclair/typebox',
    'fastify',
  ],
});
