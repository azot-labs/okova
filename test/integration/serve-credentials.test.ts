import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { afterEach, beforeEach, expect, test } from 'vitest';
import sessionApi from '../../src/cli/commands/serve/api/session';
import { credentialCache, config, sessions } from '../../src/cli/commands/serve/state';
import { loadWidevineCredentialData } from '../utils';

beforeEach(({ skip }) => {
  if (!process.env.VITEST_WVD_PATH) skip('Set VITEST_WVD_PATH to enable this fixture suite');
});

const originalConfig = structuredClone(config);
let directory: string;
let credentialsPath: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'okova-devices-'));
  credentialsPath = join(directory, 'credentials.wvd');
  await writeFile(credentialsPath, await loadWidevineCredentialData());
  config.credentials = [relative(process.cwd(), credentialsPath)];
  config.users = {};
  config.public = true;
});

afterEach(async () => {
  await sessions.clear();
  credentialCache.clear();
  Object.assign(config, originalConfig);
  if (directory) await rm(directory, { recursive: true, force: true });
});

const open = (credentials?: string, secret?: string) =>
  sessionApi.request('/', {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'x-secret-key': secret } : {}) },
    body: JSON.stringify({ credentials }),
  });

test('default, name, filename and exact paths share one device cache entry', async () => {
  for (const identifier of [
    undefined,
    'credentials',
    'credentials.wvd',
    config.credentials[0],
    credentialsPath,
  ]) {
    const response = await open(identifier);
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty('id');
  }
  expect([...credentialCache.keys()]).toEqual([resolve(credentialsPath)]);
});

test('default and filename requests authorize against the resolved device', async () => {
  config.users = { secret: { name: 'test', credentials: ['credentials'] } };
  expect((await open(undefined, 'secret')).status).toBe(200);
  expect((await open('credentials.wvd', 'secret')).status).toBe(200);
  expect((await open('credentials', 'unknown')).status).toBe(403);
});

test('rejects substrings, empty identifiers and unknown credentials', async () => {
  for (const identifier of ['cli', 'wvd', '', 'missing']) {
    expect((await open(identifier)).status).toBe(400);
  }
  expect(credentialCache.size).toBe(0);
});

test('overlapping names cannot select or authorize the wrong device', async () => {
  const otherPath = join(directory, 'credentials-extra.wvd');
  await writeFile(otherPath, await loadWidevineCredentialData());
  config.credentials.unshift(otherPath);
  config.users = { secret: { name: 'test', credentials: ['credentials'] } };
  expect((await open('credentials', 'secret')).status).toBe(200);
  expect([...credentialCache.keys()]).toEqual([credentialsPath]);
  expect((await open(undefined, 'secret')).status).toBe(403);
});

test('ambiguous aliases fail while exact paths and the default remain usable', async () => {
  const otherPath = join(directory, 'credentials.prd');
  config.credentials.push(otherPath);
  expect((await open('credentials')).status).toBe(400);
  expect((await open('credentials.wvd')).status).toBe(200);
  expect((await open(credentialsPath)).status).toBe(200);
  expect((await open()).status).toBe(200);
  config.users = { secret: { name: 'test', credentials: ['credentials'] } };
  expect((await open(credentialsPath, 'secret')).status).toBe(403);
  config.users.secret.credentials = [credentialsPath];
  expect((await open('credentials.wvd', 'secret')).status).toBe(200);
});

test('no configured credentials returns a credential error', async () => {
  config.credentials = [];
  expect((await open()).status).toBe(400);
});

const openForSystem = (body: object, secret?: string) =>
  sessionApi.request('/', {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'x-secret-key': secret } : {}) },
    body: JSON.stringify(body),
  });

test.each([
  { keySystem: 'com.microsoft.playready', credentials: 'credentials.wvd' },
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
    credentials: credentialsPath,
    keySystem: 'com.widevine.alpha',
  });
});

test('DRM-aware default selection searches only authorized devices', async () => {
  const other = join(directory, 'other.wvd');
  config.credentials.unshift(other);
  config.users = { secret: { name: 'test', credentials: ['credentials.wvd'] } };
  const response = await openForSystem({ keySystem: 'com.widevine.alpha' }, 'secret');
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ credentials: credentialsPath });
  expect(credentialCache.has(other)).toBe(false);
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
  config.credentials.push(prdPath);
  const response = await openForSystem({ keySystem });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    credentials: resolve(prdPath),
    keySystem: 'com.microsoft.playready.recommendation',
  });
  expect(
    (await openForSystem({ keySystem: 'com.widevine.alpha', credentials: prdPath })).status,
  ).toBe(400);
});

test.each(['missing', 'invalid magic', 'truncated WVD', 'truncated PRD'])(
  'DRM-aware selection skips an authorized %s candidate',
  async (failure) => {
    const unusable = join(directory, 'unusable.device');
    if (failure !== 'missing') {
      const data = failure === 'invalid magic' ? 'invalid' : failure.slice(-3);
      await writeFile(unusable, data);
    }
    config.credentials.unshift(unusable);
    config.users = { secret: { name: 'test', credentials: [unusable, credentialsPath] } };
    const response = await openForSystem({ keySystem: 'com.widevine.alpha' }, 'secret');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ credentials: credentialsPath });
    expect(credentialCache.has(unusable)).toBe(false);

    const explicit = await openForSystem(
      { keySystem: 'com.widevine.alpha', credentials: unusable },
      'secret',
    );
    const expectedStatus = failure === 'invalid magic' ? 400 : 500;
    expect(explicit.status).toBe(expectedStatus);
    expect((await open(undefined, 'secret')).status).toBe(expectedStatus);
  },
);

test('unusable candidates do not permit falling back to an unauthorized device', async () => {
  const missing = join(directory, 'missing.wvd');
  config.credentials.unshift(missing);
  config.users = { secret: { name: 'test', credentials: [missing] } };
  expect((await openForSystem({ keySystem: 'com.widevine.alpha' }, 'secret')).status).toBe(400);
  expect(credentialCache.size).toBe(0);
  expect(sessions.size).toBe(0);
});
