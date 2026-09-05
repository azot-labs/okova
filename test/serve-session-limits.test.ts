import { getEventListeners, once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { resolve } from 'node:path';
import { serve } from '@hono/node-server';
import { afterEach, assert, beforeEach, expect, test, vi } from 'vitest';
import sessionApi from '../src/cli/commands/serve/api/session';
import { clients, config, sessions } from '../src/cli/commands/serve/state';
import { SessionRegistry, sessionLimitsSchema } from '../src/cli/commands/serve/session-registry';
import { Session } from '../src/lib/api';
import { Widevine } from '../src/lib/widevine/engine';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';

const originalConfig = structuredClone(config);
const credentials = new WidevineDeviceCredentials(
  ClientIdentification.create({
    token: SignedDrmCertificate.encode(
      SignedDrmCertificate.create({
        drmCertificate: DrmCertificate.encode(DrmCertificate.create({ systemId: 1 })).finish(),
      }),
    ).finish(),
  }),
);

beforeEach(() => {
  config.clients = ['test.wvd'];
  config.users = {};
  config.forcePrivacyMode = false;
  config.sessionLimits = sessionLimitsSchema.parse({ maxSessions: 2, idleTimeoutMs: 1000 });
  clients.set(resolve('test.wvd'), credentials);
});

afterEach(async () => {
  await sessions.clear();
  clients.clear();
  Object.assign(config, structuredClone(originalConfig));
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const open = (client?: string) =>
  sessionApi.request('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client }),
  });

const registeredSession = () => {
  const engine = new Widevine({ deviceCredentials: credentials });
  const session = new Session('temporary', engine);
  sessions.set(`:${session.sessionId}`, session);
  return { session, engine, path: `/${session.sessionId}` };
};

test('simultaneous opens respect capacity before creating engines and close releases a slot', async () => {
  const create = vi.spyOn(Widevine.prototype, 'createSession');
  const responses = await Promise.all(Array.from({ length: 10 }, () => open()));
  expect(responses.filter((response) => response.status === 200)).toHaveLength(2);
  expect(responses.filter((response) => response.status === 503)).toHaveLength(8);
  expect(create).toHaveBeenCalledTimes(2);
  expect(sessions.size).toBe(2);
  const session = sessions.values().next().value;
  assert(session);
  expect((await sessionApi.request(`/${session.sessionId}/close`, { method: 'POST' })).status).toBe(
    200,
  );
  expect((await open()).status).toBe(200);
});

test('failed creation releases its reservation', async () => {
  for (let index = 0; index < 3; index++) expect((await open('missing')).status).toBe(400);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(Widevine.prototype, 'createSession').mockImplementationOnce(() => {
    throw new Error('Failed to create native session');
  });
  expect((await open()).status).toBe(500);
  expect((await open()).status).toBe(200);
  expect((await open()).status).toBe(200);
});

test('capacity counts pending creation across owners and devices', async () => {
  const registry = new SessionRegistry(() => config.sessionLimits);
  const releaseFirst = registry.reserve();
  const releaseSecond = registry.reserve();
  expect(releaseFirst).toBeTypeOf('function');
  expect(releaseSecond).toBeTypeOf('function');
  expect(registry.reserve()).toBeUndefined();
  releaseFirst?.();
  releaseFirst?.();
  const releaseThird = registry.reserve();
  expect(releaseThird).toBeTypeOf('function');
  expect(registry.reserve()).toBeUndefined();
  releaseSecond?.();
  releaseThird?.();
});

test('requests refresh idle expiry, which closes the native session and pending key wait', async () => {
  vi.useFakeTimers();
  const { session, engine, path } = registeredSession();
  await vi.advanceTimersByTimeAsync(900);
  const pending = sessionApi.request(`${path}/keys`);
  await vi.advanceTimersByTimeAsync(900);
  expect(sessions.size).toBe(1);
  await vi.advanceTimersByTimeAsync(100);
  expect((await pending).status).toBe(400);
  expect(sessions.size).toBe(0);
  expect(engine.sessions.size).toBe(0);
  expect(getEventListeners(session, 'keystatuseschange')).toHaveLength(0);
  await expect(session.update(new Uint8Array())).rejects.toThrow('Session closed');
  expect((await open()).status).toBe(200);
});

test('key wait deadline removes listeners and releases concurrent request capacity', async () => {
  vi.useFakeTimers();
  config.sessionLimits.maxConcurrentRequests = 1;
  config.sessionLimits.keyWaitTimeoutMs = 100;
  const { session, path } = registeredSession();
  const pending = sessionApi.request(`${path}/keys`);
  await vi.advanceTimersByTimeAsync(0);
  expect(getEventListeners(session, 'keystatuseschange')).toHaveLength(1);
  expect((await open()).status).toBe(503);
  await vi.advanceTimersByTimeAsync(100);
  const response = await pending;
  expect(response.status).toBe(504);
  expect(await response.json()).toEqual({ error: 'Timed out waiting for keys' });
  expect(getEventListeners(session, 'keystatuseschange')).toHaveLength(0);
  expect((await open()).status).toBe(200);
});

test.each([false, true])(
  'aborted key requests clean up, already aborted: %s',
  async (alreadyAborted) => {
    const { session, path } = registeredSession();
    const controller = new AbortController();
    const listening = Promise.withResolvers<void>();
    const addListener = session.addEventListener.bind(session);
    vi.spyOn(session, 'addEventListener').mockImplementation((...args) => {
      addListener(...args);
      if (args[0] === 'keystatuseschange') listening.resolve();
    });
    if (alreadyAborted) controller.abort();
    const pending = sessionApi.request(`${path}/keys`, { signal: controller.signal });
    if (!alreadyAborted) {
      await listening.promise;
      controller.abort();
    }
    expect((await pending).status).toBe(408);
    expect(getEventListeners(session, 'keystatuseschange')).toHaveLength(0);
    expect(sessions.size).toBe(1);
  },
);

test('a real client disconnect cancels its key wait', async () => {
  const { session, path } = registeredSession();
  const listening = Promise.withResolvers<void>();
  const finished = Promise.withResolvers<void>();
  const addListener = session.addEventListener.bind(session);
  vi.spyOn(session, 'addEventListener').mockImplementation((...args) => {
    addListener(...args);
    if (args[0] === 'keystatuseschange') listening.resolve();
  });
  const server = serve({
    hostname: '127.0.0.1',
    port: 0,
    fetch: async (request) => {
      try {
        return await sessionApi.fetch(request);
      } finally {
        finished.resolve();
      }
    },
  });
  let request: ReturnType<typeof httpRequest> | undefined;
  try {
    if (!server.listening) await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Expected TCP address');
    request = httpRequest(`http://127.0.0.1:${address.port}${path}/keys`);
    request.on('error', () => {});
    request.end();
    await listening.promise;
    request.destroy();
    await finished.promise;
    expect(getEventListeners(session, 'keystatuseschange')).toHaveLength(0);
    expect(sessions.size).toBe(1);
  } finally {
    request?.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('clearing the registry closes every engine and key waiter', async () => {
  const first = registeredSession();
  const second = registeredSession();
  const waiting = expect(first.session.waitForKeyStatusesChange()).rejects.toThrow(
    'Session closed',
  );
  await sessions.clear();
  await waiting;
  expect(sessions.size).toBe(0);
  expect(first.engine.sessions.size).toBe(0);
  expect(second.engine.sessions.size).toBe(0);
});

test.each([0, -1, 1.5, Infinity, '64', null])('rejects invalid limits: %s', (value) => {
  for (const field of Object.keys(config.sessionLimits)) {
    expect(sessionLimitsSchema.safeParse({ [field]: value }).success).toBe(false);
  }
});
