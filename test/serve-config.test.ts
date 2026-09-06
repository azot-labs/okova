import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { config, loadConfig } from '../src/cli/commands/serve/state';

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

const setup = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'okova-config-'));
  directories.push(directory);
  return join(directory, 'config.json');
};

test('only a missing implicit configuration uses defaults', async () => {
  const path = await setup();
  await expect(loadConfig(path)).rejects.toThrow('Cannot read server config');
  const originalDirectory = process.cwd();
  try {
    process.chdir(directories[0]!);
    await loadConfig();
    expect(config.port).toBe(4000);
    expect(config.clients).toEqual([]);
    await writeFile('okova.config.json', '{');
    await expect(loadConfig()).rejects.toThrow('Invalid server config');
  } finally {
    process.chdir(originalDirectory);
  }
});

test.each(['{', 'null', '[]', '{"port":"4000"}', '{"clients":false}'])(
  'rejects malformed or invalid config %s without changing current settings',
  async (text) => {
    const path = await setup();
    const before = structuredClone(config);
    await writeFile(path, text);
    await expect(loadConfig(path)).rejects.toThrow('Invalid server config');
    expect(config).toEqual(before);
  },
);

test('loading a new config resets omitted settings to defaults', async () => {
  const path = await setup();
  await writeFile(path, JSON.stringify({ port: 1234, clients: ['test.wvd'] }));
  await loadConfig(path);
  expect(config.port).toBe(1234);
  await writeFile(path, '{}');
  await loadConfig(path);
  expect(config.port).toBe(4000);
  expect(config.clients).toEqual([]);
});

test.each([
  { porrt: 8080 },
  { users: { secret: { name: 'test', clients: [], clietns: ['test.wvd'] } } },
  { sessionLimits: { maxSession: 1 } },
])('rejects unknown configuration fields in %j', async (data) => {
  const path = await setup();
  const before = structuredClone(config);
  await writeFile(path, JSON.stringify(data));
  await expect(loadConfig(path)).rejects.toThrow('Unrecognized key');
  expect(config).toEqual(before);
});
