import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as nodeServer from '@hono/node-server';
import { assert, expect, test, vi } from 'vitest';
import { serve } from '../src/cli/commands/serve/serve';
import { credentialCache, config, sessions } from '../src/cli/commands/serve/state';
import { Session } from '../src/lib/api';
import { Widevine } from '../src/lib/widevine/engine';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';
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
      credentials: ['credentials/credentials.wvd'],
      sessionLimits: { maxSessions: 3 },
      users: {},
      public: true,
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
    const credentialsPath = join(directory, 'credentials.wvd');
    const originalConfig = structuredClone(config);
    const originalListeners = {
      SIGINT: process.listeners('SIGINT'),
      SIGTERM: process.listeners('SIGTERM'),
    };
    const credentials = new WidevineClientCredentials(
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
    vi.spyOn(WidevineClientCredentials, 'from').mockImplementation(async () => {
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
      await writeFile(credentialsPath, 'WVD');
      await writeFile(
        configPath,
        JSON.stringify({
          host: '127.0.0.1',
          port: 0,
          credentials: [credentialsPath],
          users: {},
          public: true,
        }),
      );
      await serve({ config: configPath });
      const server = startServer.mock.results[0]?.value;
      assert(server);
      if (!server.listening) await once(server, 'listening');
      const address = server.address();
      assert(address && typeof address !== 'string');

      const existing = new Session('temporary', new Widevine({ clientCredentials: credentials }));
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
      credentialCache.clear();
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

test.each([{}, { host: '0.0.0.0', public: true }, { host: '::', public: true }])(
  'rejects unsafe startup before opening a socket: %j',
  async (settings) => {
    const directory = await mkdtemp(join(tmpdir(), 'okova-startup-'));
    const path = join(directory, 'config.json');
    const originalConfig = structuredClone(config);
    const startServer = vi.mocked(nodeServer.serve);
    startServer.mockClear();
    try {
      await writeFile(path, JSON.stringify(settings));
      await expect(serve({ config: path })).rejects.toThrow();
      expect(startServer).not.toHaveBeenCalled();
    } finally {
      Object.assign(config, originalConfig);
      await rm(directory, { recursive: true, force: true });
    }
  },
);

test.each(['discovered', 'configured', 'explicit', 'existing grant'])(
  'starts with multiple credentials and reports automatic selection: %s',
  async (mode) => {
    const directory = await mkdtemp(join(tmpdir(), 'okova-selection-'));
    const configPath = join(directory, 'config.json');
    const first = join(directory, 'a.prd');
    const last = join(directory, 'z.wvd');
    const originalConfig = structuredClone(config);
    const originalListeners = {
      SIGINT: process.listeners('SIGINT'),
      SIGTERM: process.listeners('SIGTERM'),
    };
    const startServer = vi.mocked(nodeServer.serve);
    startServer.mockClear();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(process, 'cwd').mockReturnValue(directory);
    try {
      await writeFile(last, 'WVD');
      await writeFile(first, 'PRD');
      await writeFile(
        configPath,
        JSON.stringify({
          port: 0,
          credentials: mode === 'discovered' ? [] : [last, first],
          users:
            mode === 'existing grant'
              ? { 'private-secret': { name: 'test', credentials: [first] } }
              : {},
        }),
      );
      await serve({
        config: configPath,
        secret: 'private-secret',
        ...(mode === 'explicit' ? { credentials: first } : {}),
      });
      const server = startServer.mock.results[0]?.value;
      assert(server);
      if (!server.listening) await once(server, 'listening');
      expect(server.address()).toMatchObject({ address: '127.0.0.1' });
      const selected = mode === 'configured' ? last : first;
      expect(config.users['private-secret']?.credentials).toEqual([selected]);
      const output = warning.mock.calls.flat().join('\n');
      expect(output).not.toContain('private-secret');
      if (mode === 'explicit') {
        expect(warning).not.toHaveBeenCalled();
      } else {
        expect(output).toContain(mode === 'discovered' ? first : last);
        expect(output).toContain(mode === 'discovered' ? 'PlayReady' : 'Widevine');
        expect(output).toContain('--credentials');
        if (mode === 'existing grant') {
          expect(output).not.toContain('Granted');
        } else {
          expect(output).toContain(`Granted --secret access to ${selected}`);
        }
      }
      if (mode === 'discovered') {
        expect(config.credentials).toEqual(['a.prd']);
        expect(output).toContain('Multiple credential files');
      }
    } finally {
      const server = startServer.mock.results[0]?.value;
      if (server?.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error?: Error) => (error ? reject(error) : resolve()));
        });
      }
      for (const signal of ['SIGINT', 'SIGTERM'] as const) {
        for (const listener of process.listeners(signal)) {
          if (!originalListeners[signal].includes(listener))
            process.removeListener(signal, listener);
        }
      }
      Object.assign(config, originalConfig);
      vi.restoreAllMocks();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
