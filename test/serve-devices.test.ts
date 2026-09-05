import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { afterEach, beforeEach, expect, test } from 'vitest';
import sessionApi from '../src/cli/commands/serve/api/session';
import { clients, config, sessions } from '../src/cli/commands/serve/state';
import { loadWidevineClientData } from './utils';

const originalConfig = structuredClone(config);
let directory: string;
let clientPath: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'okova-devices-'));
  clientPath = join(directory, 'client.wvd');
  await writeFile(clientPath, await loadWidevineClientData());
  config.clients = [relative(process.cwd(), clientPath)];
  config.users = {};
});

afterEach(async () => {
  await sessions.clear();
  clients.clear();
  Object.assign(config, originalConfig);
  await rm(directory, { recursive: true, force: true });
});

const open = (client?: string, secret?: string) =>
  sessionApi.request('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'x-secret-key': secret } : {}) },
    body: JSON.stringify({ client }),
  });

test('default, name, filename and exact paths share one device cache entry', async () => {
  for (const identifier of [undefined, 'client', 'client.wvd', config.clients[0], clientPath]) {
    const response = await open(identifier);
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty('id');
  }
  expect([...clients.keys()]).toEqual([resolve(clientPath)]);
});

test('default and filename requests authorize against the resolved device', async () => {
  config.users = { secret: { name: 'test', clients: ['client'] } };
  expect((await open(undefined, 'secret')).status).toBe(200);
  expect((await open('client.wvd', 'secret')).status).toBe(200);
  expect((await open('client', 'unknown')).status).toBe(403);
});

test('rejects substrings, empty identifiers and unknown clients', async () => {
  for (const identifier of ['cli', 'wvd', '', 'missing']) {
    expect((await open(identifier)).status).toBe(400);
  }
  expect(clients.size).toBe(0);
});

test('overlapping names cannot select or authorize the wrong device', async () => {
  const otherPath = join(directory, 'client-extra.wvd');
  await writeFile(otherPath, await loadWidevineClientData());
  config.clients.unshift(otherPath);
  config.users = { secret: { name: 'test', clients: ['client'] } };
  expect((await open('client', 'secret')).status).toBe(200);
  expect([...clients.keys()]).toEqual([clientPath]);
  expect((await open(undefined, 'secret')).status).toBe(403);
});

test('ambiguous aliases fail while exact paths and the default remain usable', async () => {
  const otherPath = join(directory, 'client.prd');
  config.clients.push(otherPath);
  expect((await open('client')).status).toBe(400);
  expect((await open('client.wvd')).status).toBe(200);
  expect((await open(clientPath)).status).toBe(200);
  expect((await open()).status).toBe(200);
  config.users = { secret: { name: 'test', clients: ['client'] } };
  expect((await open(clientPath, 'secret')).status).toBe(403);
  config.users.secret.clients = [clientPath];
  expect((await open('client.wvd', 'secret')).status).toBe(200);
});

test('no configured device returns a client error', async () => {
  config.clients = [];
  expect((await open()).status).toBe(400);
});

const openForSystem = (body: object, secret?: string) =>
  sessionApi.request('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'x-secret-key': secret } : {}) },
    body: JSON.stringify(body),
  });

test.each([
  { keySystem: 'com.microsoft.playready', client: 'client.wvd' },
  { keySystem: 'com.widevine.alpha.extra' },
  { keySystem: 'com.microsoft.playready.invalid' },
  { keySystem: 'org.w3.clearkey' },
  { sessionType: 'banana' },
])('rejects invalid or incompatible session selection: %j', async (body) => {
  expect((await openForSystem(body)).status).toBe(400);
  expect(sessions.size).toBe(0);
});

test('returns the resolved device and canonical system', async () => {
  const response = await openForSystem({ keySystem: 'com.widevine.alpha' });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    id: expect.any(String),
    client: clientPath,
    keySystem: 'com.widevine.alpha',
  });
});

test('DRM-aware default selection searches only authorized devices', async () => {
  const other = join(directory, 'other.wvd');
  config.clients.unshift(other);
  config.users = { secret: { name: 'test', clients: ['client.wvd'] } };
  const response = await openForSystem({ keySystem: 'com.widevine.alpha' }, 'secret');
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ client: clientPath });
  expect(clients.has(other)).toBe(false);
});

const prdPath = process.env.VITEST_PRD_PATH;
test
  .skipIf(!prdPath)
  .each([
    'com.microsoft.playready',
    'com.microsoft.playready.recommendation',
    'com.microsoft.playready.recommendation.3000',
    'com.microsoft.playready.hardware',
  ])('selects a PlayReady device for alias %s after a Widevine default', async (keySystem) => {
  if (!prdPath) throw new Error('Set VITEST_PRD_PATH for mixed-device selection checks');
  config.clients.push(prdPath);
  const response = await openForSystem({ keySystem });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    client: resolve(prdPath),
    keySystem: 'com.microsoft.playready.recommendation',
  });
  expect((await openForSystem({ keySystem: 'com.widevine.alpha', client: prdPath })).status).toBe(
    400,
  );
});

test.each(['missing', 'invalid magic', 'truncated WVD', 'truncated PRD'])(
  'DRM-aware selection skips an authorized %s candidate',
  async (failure) => {
    const unusable = join(directory, 'unusable.device');
    if (failure !== 'missing') {
      const data = failure === 'invalid magic' ? 'invalid' : failure.slice(-3);
      await writeFile(unusable, data);
    }
    config.clients.unshift(unusable);
    config.users = { secret: { name: 'test', clients: [unusable, clientPath] } };
    const response = await openForSystem({ keySystem: 'com.widevine.alpha' }, 'secret');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ client: clientPath });
    expect(clients.has(unusable)).toBe(false);

    const explicit = await openForSystem(
      { keySystem: 'com.widevine.alpha', client: unusable },
      'secret',
    );
    const expectedStatus = failure === 'invalid magic' ? 400 : 500;
    expect(explicit.status).toBe(expectedStatus);
    expect((await open(undefined, 'secret')).status).toBe(expectedStatus);
  },
);

test('unusable candidates do not permit falling back to an unauthorized device', async () => {
  const missing = join(directory, 'missing.wvd');
  config.clients.unshift(missing);
  config.users = { secret: { name: 'test', clients: [missing] } };
  expect((await openForSystem({ keySystem: 'com.widevine.alpha' }, 'secret')).status).toBe(400);
  expect(clients.size).toBe(0);
  expect(sessions.size).toBe(0);
});
