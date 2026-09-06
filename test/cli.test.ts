import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { parseWvd } from '../src/lib/widevine/wvd';
import { setupCliTests, directory, input, run, wvd } from './helpers/cli';

setupCliTests();

test.each([
  ['--help'],
  ['--version'],
  ['serve', '--help'],
  ['license', '--help'],
  ['client', '--help'],
  ['client', 'pack', '--help'],
  ['client', 'unpack', '--help'],
  ['client', 'info', '--help'],
])('prints help/version without executing %j', (...args) => {
  const result = run(args);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout.trim()).not.toBe('');
  expect(result.stderr).toBe('');
});

test.each([
  ['client', 'pack', '--format'],
  ['client', 'pack', '--format', 'okova'],
  ['client', 'info', '--format', 'wvd'],
  ['license', '--port', '4000'],
  ['serve', '--port', '4000oops'],
  ['--debug'],
  ['--unknown'],
  ['pssh'],
  ['test'],
  ['unknown'],
  ['client', 'unknown'],
  ['client', 'info', 'a', 'b'],
  ['license'],
  ['client', 'info', 'missing.wvd'],
  ['serve', '--config', 'invalid-config.json'],
  ['serve', '--config', 'missing-config.json'],
  ['serve', '--config', 'input.wvd'],
])('rejects invalid or unimplemented invocation %j', (...args) => {
  const result = run(args);
  expect(result.status, result.stdout).toBe(1);
  expect(result.stderr.trim()).not.toBe('');
  expect(result.stderr).not.toContain('UnhandledPromiseRejection');
});

test.each([[], ['--format', 'wvd'], ['-f', 'wvd']])(
  'packs with the correct default extension %j',
  async (...flags) => {
    const cwd = await mkdtemp(join(directory, 'pack-'));
    const result = run(['client', 'pack', input, ...flags], cwd);
    expect(result.status, result.stderr).toBe(0);
    expect(await readdir(cwd)).toEqual(['test_device.wvd']);
    expect(parseWvd(new Uint8Array(await readFile(join(cwd, 'test_device.wvd'))))).toEqual(
      parseWvd(wvd),
    );
  },
);

test('packs raw credentials, honors output paths, and refuses overwrites or format mismatches', async () => {
  const cwd = await mkdtemp(join(directory, 'raw-'));
  const raw = join(cwd, 'raw');
  const unpack = run(['client', 'unpack', input, raw], cwd);
  expect(unpack.status, unpack.stderr).toBe(0);
  const output = join(cwd, 'nested', 'export.wvd');
  const pack = run(['client', 'pack', raw, output, '--format', 'wvd'], cwd);
  expect(pack.status, pack.stderr).toBe(0);
  expect(parseWvd(new Uint8Array(await readFile(output)))).toEqual(parseWvd(wvd));
  expect(run(['client', 'pack', raw, output], cwd).status).toBe(1);
  expect(parseWvd(new Uint8Array(await readFile(output)))).toEqual(parseWvd(wvd));
  expect(run(['client', 'pack', input, '--format', 'prd'], cwd).status).toBe(1);
  expect(run(['client', 'pack', input, join(cwd, 'wrong.prd')], cwd).status).toBe(1);
  const info = run(['client', 'info', input]);
  expect(info.status, info.stderr).toBe(0);
  expect(info.stdout).toContain('company_name: Test');
});
