import { once } from 'node:events';
import { request } from 'node:http';
import { resolve } from 'node:path';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import sessionApi from '../src/cli/commands/serve/api/session';
import { requestBoundary } from '../src/cli/commands/serve/request-boundary';
import { credentialCache, config, sessions } from '../src/cli/commands/serve/state';
import { Widevine } from '../src/lib/widevine/engine';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';

const originalConfig = structuredClone(config);
const app = new Hono().use(requestBoundary).route('/sessions', sessionApi);
const credentials = new WidevineClientCredentials(
  ClientIdentification.create({
    token: SignedDrmCertificate.encode(
      SignedDrmCertificate.create({
        drmCertificate: DrmCertificate.encode(DrmCertificate.create({ systemId: 1 })).finish(),
      }),
    ).finish(),
  }),
);

beforeEach(() => {
  config.public = true;
  config.credentials = ['test.wvd'];
  credentialCache.set(resolve('test.wvd'), credentials);
});

afterEach(async () => {
  await sessions.clear();
  credentialCache.clear();
  Object.assign(config, structuredClone(originalConfig));
  vi.restoreAllMocks();
});

const post = (headers: Record<string, string> = {}, body = '{}', path = '/sessions') =>
  app.request(`http://localhost${path}`, {
    method: 'POST',
    headers: { host: 'localhost', 'content-type': 'application/json', ...headers },
    body,
  });

test.each(['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data', ''])(
  'rejects session creation with content type %j before creating a session',
  async (type) => {
    const create = vi.spyOn(Widevine.prototype, 'createSession');
    expect((await post({ 'content-type': type })).status).toBe(415);
    expect(create).not.toHaveBeenCalled();
    expect(sessions.size).toBe(0);
  },
);

test('public JSON access is explicit and unknown keys never fall back to anonymous', async () => {
  config.public = false;
  expect((await post()).status).toBe(403);
  config.users = { secret: { name: 'test', credentials: ['test.wvd'] } };
  expect((await post({ 'x-secret-key': 'secret' })).status).toBe(200);
  config.public = true;
  expect((await post()).status).toBe(200);
  for (const secret of ['unknown', 'toString', '__proto__']) {
    expect((await post({ 'x-secret-key': secret })).status).toBe(403);
    expect(
      (
        await app.request('http://localhost/sessions/missing/keys', {
          headers: { host: 'localhost', 'x-secret-key': secret },
        })
      ).status,
    ).toBe(403);
  }
});

test('an explicit empty allowlist rejects cross-origin requests and untrusted hosts', async () => {
  config.allowedOrigins = [];
  expect(
    (await post({ origin: 'https://evil.example', 'content-type': 'text/plain' })).status,
  ).toBe(403);
  expect((await post({ origin: 'null' })).status).toBe(403);
  expect((await post({ host: 'evil.example' })).status).toBe(403);
  expect(
    (
      await app.request('http://evil.example/sessions', {
        method: 'POST',
        headers: {
          host: 'evil.example',
          origin: 'http://evil.example',
          'content-type': 'application/json',
        },
        body: '{}',
      })
    ).status,
  ).toBe(403);
  expect(sessions.size).toBe(0);
  expect((await post({ origin: 'http://localhost' })).status).toBe(200);
});

test.each([
  { isPublic: false, isRestricted: false },
  { isPublic: true, isRestricted: false },
  { isPublic: false, isRestricted: true },
  { isPublic: true, isRestricted: true },
])('browser access preserves authentication with %j', async ({ isPublic, isRestricted }) => {
  config.public = isPublic;
  config.users = { secret: { name: 'test', credentials: ['test.wvd'] } };
  if (isRestricted) config.allowedOrigins = ['https://dashboard.example'];
  const origin = 'https://dashboard.example';
  const preflight = await app.request('http://localhost/sessions', {
    method: 'OPTIONS',
    headers: {
      host: 'localhost',
      origin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type,x-secret-key',
    },
  });
  expect(preflight.status).toBe(204);
  const allowedOrigin = isRestricted ? origin : '*';
  expect(preflight.headers.get('access-control-allow-origin')).toBe(allowedOrigin);
  expect(sessions.size).toBe(0);
  const anonymous = await post({ origin });
  expect(anonymous.status).toBe(isPublic ? 200 : 403);
  const authenticated = await post({ origin, 'x-secret-key': 'secret' });
  expect(authenticated.status).toBe(200);
  expect(authenticated.headers.get('access-control-allow-origin')).toBe(allowedOrigin);
  expect((await post({ origin: 'https://evil.example', 'x-secret-key': 'secret' })).status).toBe(
    isRestricted ? 403 : 200,
  );
});

test('unrestricted origins include null while JSON content types are still required', async () => {
  const response = await post({ origin: 'null' });
  expect(response.status).toBe(200);
  expect(response.headers.get('access-control-allow-origin')).toBe('*');
  expect((await post({ origin: 'https://example.com', 'content-type': 'text/plain' })).status).toBe(
    415,
  );
  expect(sessions.size).toBe(1);
});

test('limits declared and actual body bytes before session creation', async () => {
  config.maxRequestBodyBytes = 2;
  expect((await post({}, '{}')).status).toBe(200);
  expect((await post({}, '{} ')).status).toBe(413);
  expect((await post({ 'content-length': '3' }, '{}')).status).toBe(413);
  expect((await post({ 'content-length': '1' }, '{} ')).status).toBe(413);
  expect((await post({ 'content-encoding': 'gzip' })).status).toBe(415);
  expect(sessions.size).toBe(1);
});

test.each([
  { suffix: '', status: 200 },
  { suffix: ' ', status: 413 },
])(
  'handles chunked bodies through the Node HTTP adapter: %j',
  async ({ suffix, status: expectedStatus }) => {
    config.maxRequestBodyBytes = 2;
    const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
    try {
      if (!server.listening) await once(server, 'listening');
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Missing TCP address');
      const status = await new Promise<number | undefined>((resolve, reject) => {
        const req = request(
          {
            hostname: '127.0.0.1',
            port: address.port,
            path: '/sessions',
            method: 'POST',
            headers: { 'content-type': 'application/json' },
          },
          (res) => {
            res.resume();
            res.on('end', () => resolve(res.statusCode));
          },
        );
        req.on('error', reject);
        req.write('{}');
        req.end(suffix);
      });
      expect(status).toBe(expectedStatus);
      expect(sessions.size).toBe(expectedStatus === 200 ? 1 : 0);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  },
);

test.each(['', '!', 'AQ', 'AQ=', 'AR==', 'AQ==\n', 'AQ==garbage', 'AA-_', 'AA==='])(
  'rejects invalid base64 %j before device operations',
  async (value) => {
    const opened = await post();
    const { id } = await opened.json();
    const session = sessions.get(`:${id}`);
    if (!session) throw new Error('Missing session');
    const generate = vi.spyOn(session, 'generateRequest');
    const update = vi.spyOn(session, 'update');
    const certificate = vi.spyOn(session.engine, 'setServerCertificate');
    expect(
      (await post({}, JSON.stringify({ initData: value }), `/sessions/${id}/generate-request`))
        .status,
    ).toBe(400);
    expect(
      (
        await post(
          {},
          JSON.stringify({ initData: 'AQ==', serverCertificate: value }),
          `/sessions/${id}/generate-request`,
        )
      ).status,
    ).toBe(400);
    expect(
      (await post({}, JSON.stringify({ response: value }), `/sessions/${id}/update`)).status,
    ).toBe(400);
    expect(generate).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(certificate).not.toHaveBeenCalled();
  },
);

test('explicit hosts replace defaults and forwarded headers cannot bypass the boundary', async () => {
  config.host = '0.0.0.0';
  config.allowedHosts = ['api.example'];
  const headers = { host: 'api.example:4000', 'content-type': 'application/json' };
  expect(
    (
      await app.request('http://api.example:4000/sessions', {
        method: 'POST',
        headers,
        body: '{}',
      })
    ).status,
  ).toBe(200);
  expect((await post()).status).toBe(403);
  expect(
    (
      await app.request('http://evil.example:4000/sessions', {
        method: 'POST',
        headers: {
          ...headers,
          host: 'evil.example:4000',
          'x-forwarded-host': 'api.example:4000',
          forwarded: 'host=api.example:4000',
        },
        body: '{}',
      })
    ).status,
  ).toBe(403);
});

test.each(['::2', 'fe80::1', '2001:DB8:0:0:0:0:0:1', '::ffff:192.0.2.1'])(
  'accepts the configured IPv6 bind address %s',
  async (host) => {
    config.host = host;
    const url = new URL(`http://[${host}]:4000/sessions`);
    expect(
      (
        await app.request(url.href, {
          method: 'POST',
          headers: { host: url.host, 'content-type': 'application/json' },
          body: '{}',
        })
      ).status,
    ).toBe(200);
  },
);

test.each(['close', 'delete'])(
  '%s completes without waiting for an unused body and releases its request slot',
  async (operation) => {
    const opened = await post();
    const { id } = await opened.json();
    config.sessionLimits.maxConcurrentRequests = 1;
    const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
    let upload: ReturnType<typeof request> | undefined;
    try {
      if (!server.listening) await once(server, 'listening');
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Missing TCP address');
      const status = await new Promise<number | undefined>((resolve, reject) => {
        upload = request(
          {
            hostname: '127.0.0.1',
            port: address.port,
            path: `/sessions/${id}${operation === 'close' ? '/close' : ''}`,
            method: operation === 'close' ? 'POST' : 'DELETE',
            headers: { 'content-type': 'application/json', 'transfer-encoding': 'chunked' },
          },
          (response) => {
            response.resume();
            response.on('end', () => resolve(response.statusCode));
          },
        );
        upload.on('error', reject);
        upload.setTimeout(1000, () => upload?.destroy(new Error('Handler waited for unused body')));
        upload.write('{');
      });
      expect(status).toBe(200);
      expect(sessions.size).toBe(0);
      expect((await post()).status).toBe(200);
    } finally {
      upload?.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  },
);

test.each([
  { configured: 'CDM.Example.COM', hostname: 'cdm.example.com' },
  { configured: 'LOCALHOST', hostname: '127.0.0.1' },
])('normalizes the configured DNS host $configured', async ({ configured, hostname }) => {
  config.host = configured;
  const response = await app.request(`http://${hostname}:4000/sessions`, {
    method: 'POST',
    headers: { host: `${hostname}:4000`, 'content-type': 'application/json' },
    body: '{}',
  });
  expect(response.status).toBe(200);
  expect(
    (
      await app.request('http://untrusted.example:4000/sessions', {
        method: 'POST',
        headers: { host: 'untrusted.example:4000', 'content-type': 'application/json' },
        body: '{}',
      })
    ).status,
  ).toBe(403);
});
