import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as nodeServer from '@hono/node-server';
import { assert, expect, test, vi } from 'vitest';
import { serve } from '../src/cli/commands/serve/serve';
import { clients, config, sessions } from '../src/cli/commands/serve/state';
import { Session } from '../src/lib/api';
import { Widevine } from '../src/lib/widevine/engine';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';

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
      sessionLimits: { maxSessions: 3 },
      users: {},
    }),
  );

  try {
    await serve({
      config: configPath,
      ...(hasOverrides ? { host: '127.0.0.1', port: 0 } : {}),
    });
    expect(config.sessionLimits).toMatchObject({ maxSessions: 3, keyWaitTimeoutMs: 30_000 });
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

test.each([false, true])(
  'shutdown closes sessions from pending device loads, disconnected: %s',
  async (disconnect) => {
    const directory = await mkdtemp(join(tmpdir(), 'okova-shutdown-'));
    const configPath = join(directory, 'config.json');
    const clientPath = join(directory, 'client.wvd');
    const originalConfig = structuredClone(config);
    const originalListeners = {
      SIGINT: process.listeners('SIGINT'),
      SIGTERM: process.listeners('SIGTERM'),
    };
    const credentials = new WidevineDeviceCredentials(
      ClientIdentification.create({
        token: SignedDrmCertificate.encode(
          SignedDrmCertificate.create({
            drmCertificate: DrmCertificate.encode(DrmCertificate.create({ systemId: 1 })).finish(),
          }),
        ).finish(),
      }),
    );
    const parsing = Promise.withResolvers<void>();
    const resumeParsing = Promise.withResolvers<void>();
    const exited = Promise.withResolvers<void>();
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      exited.resolve();
      return undefined as never;
    });
    vi.spyOn(WidevineDeviceCredentials, 'from').mockImplementation(async () => {
      parsing.resolve();
      await resumeParsing.promise;
      return credentials;
    });
    const createSession = vi.spyOn(Widevine.prototype, 'createSession');
    const startServer = vi.mocked(nodeServer.serve);
    startServer.mockClear();
    const controller = new AbortController();
    let pendingResponse: Promise<number | undefined> | undefined;

    try {
      await writeFile(clientPath, 'WVD');
      await writeFile(
        configPath,
        JSON.stringify({
          host: '127.0.0.1',
          port: 0,
          clients: [clientPath],
          users: {},
        }),
      );
      await serve({ config: configPath });
      const server = startServer.mock.results[0]?.value;
      assert(server);
      if (!server.listening) await once(server, 'listening');
      const address = server.address();
      assert(address && typeof address !== 'string');

      const existing = new Session('temporary', new Widevine({ deviceCredentials: credentials }));
      sessions.set(`:${existing.sessionId}`, existing);
      const keyWait = expect(existing.waitForKeyStatusesChange()).rejects.toThrow('Session closed');
      createSession.mockClear();
      pendingResponse = fetch(`http://127.0.0.1:${address.port}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Connection: 'close' },
        body: '{}',
        signal: controller.signal,
      }).then(
        async (response) => {
          await response.json();
          return response.status;
        },
        (error: unknown) => {
          if (!controller.signal.aborted) throw error;
          return undefined;
        },
      );
      await parsing.promise;
      const shutdown = process
        .listeners('SIGTERM')
        .find((listener) => !originalListeners.SIGTERM.includes(listener));
      assert(shutdown);
      const disconnected = once(server, 'close');
      if (disconnect) controller.abort();
      shutdown('SIGTERM');
      await keyWait;
      if (disconnect) await disconnected;
      expect(exit).not.toHaveBeenCalled();

      resumeParsing.resolve();
      expect(await pendingResponse).toBe(disconnect ? undefined : 200);
      await exited.promise;
      expect(exit).toHaveBeenCalledExactlyOnceWith(0);
      expect(createSession).toHaveBeenCalledOnce();
      const native = createSession.mock.results[0]?.value;
      assert(native);
      await expect(native.update(new Uint8Array())).rejects.toThrow('Session closed');
      expect(sessions.size).toBe(0);
    } finally {
      resumeParsing.resolve();
      controller.abort();
      await pendingResponse;
      const server = startServer.mock.results[0]?.value;
      if (server?.listening) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
      await sessions.clear();
      clients.clear();
      Object.assign(config, originalConfig);
      for (const signal of ['SIGINT', 'SIGTERM'] as const) {
        for (const listener of process.listeners(signal)) {
          if (!originalListeners[signal].includes(listener))
            process.removeListener(signal, listener);
        }
      }
      vi.restoreAllMocks();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
