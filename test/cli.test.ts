import { execFileSync, spawnSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, test } from 'vitest';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';
import { buildWvd, parseWvd } from '../src/lib/widevine/wvd';

let directory: string;
let executable: string;
let input: string;
let wvd: Uint8Array;

beforeAll(async () => {
  directory = await mkdtemp(join(process.cwd(), 'node_modules/.okova-cli-test-'));
  const output = join(directory, 'build');
  execFileSync(
    process.execPath,
    [
      fileURLToPath(import.meta.resolve('tsdown/run')),
      '--config',
      'tsdown.cli.config.ts',
      '--out-dir',
      output,
    ],
    { timeout: 60_000, stdio: 'pipe' },
  );
  executable = join(output, 'main.cjs');
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const clientId = ClientIdentification.encode(
    ClientIdentification.create({
      token: SignedDrmCertificate.encode(
        SignedDrmCertificate.create({
          drmCertificate: DrmCertificate.encode(DrmCertificate.create({ systemId: 123 })).finish(),
        }),
      ).finish(),
      clientInfo: [
        { name: 'company_name', value: 'Test' },
        { name: 'model_name', value: 'Device' },
      ],
    }),
  ).finish();
  wvd = buildWvd({
    deviceType: 2,
    securityLevel: 3,
    clientId,
    privateKey: privateKey.export({ type: 'pkcs1', format: 'der' }),
  });
  input = join(directory, 'input.wvd');
  await writeFile(input, wvd);
  await writeFile(join(directory, 'invalid-config.json'), JSON.stringify({ sessionLimits: false }));
}, 60_000);

afterAll(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

const run = (args: string[], cwd = directory) =>
  spawnSync(process.execPath, [executable, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 10_000,
  });

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

test.skipIf(!process.env.VITEST_PRD_PATH)(
  'prints PRD metadata and packs with a .prd default filename',
  async () => {
    const prdPath = process.env.VITEST_PRD_PATH;
    if (!prdPath) throw new Error('VITEST_PRD_PATH is required');
    const cwd = await mkdtemp(join(directory, 'prd-'));
    const info = run(['client', 'info', prdPath], cwd);
    expect(info.status, info.stderr).toBe(0);
    expect(info.stdout).toContain('DRM: PlayReady');
    expect(info.stdout).toMatch(/Security level: \d+/);
    expect(info.stdout).toMatch(/PRD version: [23]/);
    const result = run(['client', 'pack', prdPath, '--format', 'prd'], cwd);
    expect(result.status, result.stderr).toBe(0);
    const files = await readdir(cwd);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/\.prd$/);
    expect(await readFile(join(cwd, files[0]))).toEqual(await readFile(prdPath));
    // A directory containing both device types must honor the requested pack format.
    const mixed = join(cwd, 'mixed');
    await mkdir(mixed);
    await writeFile(join(mixed, 'client.wvd'), wvd);
    await writeFile(join(mixed, 'client.prd'), await readFile(prdPath));
    const output = join(cwd, 'selected.prd');
    expect(run(['client', 'pack', mixed, output, '-f', 'prd'], cwd).status).toBe(0);
    expect(await readFile(output)).toEqual(await readFile(prdPath));
  },
);
