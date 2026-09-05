import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as nodeServer from '@hono/node-server';
import { expect, test, vi } from 'vitest';
import { serve } from '../src/cli/commands/serve/serve';
import { config } from '../src/cli/commands/serve/state';

vi.mock('@hono/node-server', async (importOriginal) => {
  const original = await importOriginal<typeof import('@hono/node-server')>();
  return { ...original, serve: vi.fn(original.serve) };
});

test.each([true, false])('binds using CLI overrides when supplied: %s', async (hasOverrides) => {
  const directory = await mkdtemp(join(tmpdir(), 'okova-serve-'));
  const configPath = join(directory, 'config.json');
  const originalConfig = structuredClone(config);
  const originalListeners = {
    SIGINT: process.listeners('SIGINT'),
    SIGTERM: process.listeners('SIGTERM'),
  };
  const startServer = vi.mocked(nodeServer.serve);
  startServer.mockClear();
  await writeFile(
    configPath,
    JSON.stringify({
      host: hasOverrides ? '192.0.2.1' : '127.0.0.1',
      port: hasOverrides ? 1 : 0,
      clients: ['clients/client.wvd'],
      users: {},
    }),
  );

  try {
    await serve({
      config: configPath,
      ...(hasOverrides ? { host: '127.0.0.1', port: 0 } : {}),
    });
    const server = startServer.mock.results[0]?.value;
    expect(server).toBeDefined();
    if (!server) return;
    if (!server.listening) await once(server, 'listening');
    const address = server.address();
    expect(address).toMatchObject({ address: '127.0.0.1' });
    expect(address && typeof address !== 'string' && address.port).toBeGreaterThan(0);
  } finally {
    const server = startServer.mock.results[0]?.value;
    if (server?.listening)
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => (error ? reject(error) : resolve()));
      });
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
      for (const listener of process.listeners(signal)) {
        if (!originalListeners[signal].includes(listener)) process.removeListener(signal, listener);
      }
    }
    Object.assign(config, originalConfig);
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  }
});
