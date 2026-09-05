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
