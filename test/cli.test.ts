import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { buildWvd, parseWvd } from '../src/lib/widevine/wvd';
import { setupCliTests, directory, input, run, wvd } from './helpers/cli';
import {
  PSSH_SYSTEM_IDS,
  createPsshBox,
  setPsshKeyIds,
  serializePsshBox,
  psshBoxToBase64,
  parsePsshBoxes,
  getPsshKeyIds,
} from '../src/lib/pssh';
import { ClientIdentification, WidevinePsshData } from '../src/lib/widevine/proto';
import { Pssh } from '../src/lib/playready/pssh';
import { WrmHeader } from '../src/lib/playready/wrmheader';

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
  ['pssh', '--help'],
  ['pssh', 'inspect', '--help'],
  ['pssh', 'kids', '--help'],
  ['pssh', 'convert', '--help'],
])('prints help/version without executing %j', (...args) => {
  const result = run(args);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout.trim()).not.toBe('');
  expect(result.stderr).toBe('');
});

const KID = '00112233445566778899aabbccddeeff';
const widevinePssh = setPsshKeyIds(createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine }), [KID]);
const encodedPssh = psshBoxToBase64(widevinePssh);

test('PSSH inspection preserves box order and distinguishes empty, unsupported, and invalid KIDs', () => {
  const empty = createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine });
  const unknown = createPsshBox({ systemId: '00000000000000000000000000000000' });
  const boxKids = createPsshBox({ ...unknown, version: 1, keyIds: [KID] });
  const bytes = Buffer.concat([widevinePssh, empty, unknown, boxKids].map(serializePsshBox));
  const result = run(['pssh', 'inspect', '-', '--json'], directory, bytes.toString('base64'));
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual([
    expect.objectContaining({
      index: 0,
      system: 'widevine',
      version: 0,
      flags: 0,
      dataSize: 18,
      boxKeyIds: [],
      keyIds: { status: 'available', values: [KID] },
    }),
    expect.objectContaining({ index: 1, keyIds: { status: 'available', values: [] } }),
    expect.objectContaining({
      index: 2,
      system: 'unknown',
      keyIds: { status: 'unsupported', error: expect.any(String) },
    }),
    expect.objectContaining({
      index: 3,
      boxKeyIds: [KID],
      keyIds: { status: 'available', values: [KID] },
    }),
  ]);
  const readable = run(['pssh', 'inspect', encodedPssh]);
  expect(readable.status, readable.stderr).toBe(0);
  expect(readable.stdout).toContain('Box 0: widevine');
  expect(readable.stdout).toContain(`KIDs: ${KID}`);
  const failedKids = run(['pssh', 'kids', '-'], directory, bytes.toString('base64'));
  expect(failedKids.status).toBe(1);
  expect(failedKids.stdout).toBe('');
  expect(failedKids.stderr).toContain('Box 2');
  const selected = run(
    ['pssh', 'kids', '-', '--box', '3', '--json'],
    directory,
    bytes.toString('base64'),
  );
  expect(selected.status, selected.stderr).toBe(0);
  expect(JSON.parse(selected.stdout)).toEqual([KID]);
  expect(run(['pssh', 'kids', psshBoxToBase64(empty)]).stdout).toBe('');

  const invalid = psshBoxToBase64(
    createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine, data: new Uint8Array([0x12, 0x10, 1]) }),
  );
  const failedInspect = run(['pssh', 'inspect', invalid, '--json']);
  expect(failedInspect.status).toBe(1);
  expect(JSON.parse(failedInspect.stdout)).toEqual([
    expect.objectContaining({ keyIds: { status: 'invalid', error: expect.any(String) } }),
  ]);
});

test('PSSH commands accept pasted base64 and base64 stdin with whitespace', () => {
  const pasted = run(['pssh', 'kids', encodedPssh]);
  const piped = run(['pssh', 'kids', '-'], directory, `\n${encodedPssh}\n`);
  for (const result of [pasted, piped]) {
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toBe(`${KID}\n`);
    expect(result.stderr).toBe('');
  }
});

test.each([0x63656e63, 0x63626373])(
  'PSSH CLI converts scheme %i both ways with warnings separate from base64',
  (protectionScheme) => {
    const source = setPsshKeyIds(
      createPsshBox({
        systemId: PSSH_SYSTEM_IDS.widevine,
        version: 1,
        flags: 7,
        data: WidevinePsshData.encode(
          WidevinePsshData.create({ protectionScheme, provider: 'discard-me' }),
        ).finish(),
      }),
      [KID],
    );
    const bytes = Buffer.concat([serializePsshBox(widevinePssh), serializePsshBox(source)]);
    const result = run(
      [
        'pssh',
        'convert',
        '-',
        '--box',
        '1',
        '--target',
        'playready',
        '--la-url',
        'https://example.com/license?a=1&b=2',
      ],
      directory,
      bytes.toString('base64'),
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toContain('discards other DRM metadata');
    const [converted] = parsePsshBoxes(result.stdout.trim());
    expect(converted.systemId).toBe(PSSH_SYSTEM_IDS.playready);
    expect(converted.version).toBe(1);
    expect(converted.flags).toBe(7);
    expect(getPsshKeyIds(converted)).toEqual([KID]);
    const header = new WrmHeader(new Pssh(serializePsshBox(converted)).wrmHeaders[0]);
    expect(header.laUrl).toBe('https://example.com/license?a=1&b=2');
    const restored = run([
      'pssh',
      'convert',
      result.stdout.trim(),
      '--target',
      'widevine',
      '--json',
    ]);
    expect(restored.status, restored.stderr).toBe(0);
    const output = JSON.parse(restored.stdout);
    expect(output.warnings).toEqual([expect.stringContaining('discards other DRM metadata')]);
    const [box] = parsePsshBoxes(output.pssh);
    expect(box.systemId).toBe(PSSH_SYSTEM_IDS.widevine);
    expect(getPsshKeyIds(box)).toEqual([KID]);
    expect(WidevinePsshData.decode(box.data).protectionScheme).toBe(protectionScheme);
    expect(WidevinePsshData.decode(box.data).provider).toBe('');
  },
);

test.each([
  ['inspect'],
  ['unknown'],
  ['inspect', '%%%'],
  ['inspect', ''],
  ['inspect', encodedPssh.slice(0, -8)],
  ['inspect', encodedPssh, 'extra'],
  ['inspect', encodedPssh, '--target', 'widevine'],
  ['inspect', encodedPssh, '--box', '-1'],
  ['inspect', encodedPssh, '--box', '1.5'],
  ['inspect', encodedPssh, '--box', '1'],
  ['convert', encodedPssh],
  ['convert', encodedPssh, '--target', 'other'],
  ['convert', encodedPssh, '--to', 'playready'],
  ['convert', encodedPssh, '--target', 'widevine'],
  ['convert', encodedPssh, '--target', 'widevine', '--la-url', 'https://example.com'],
  ['convert', encodedPssh, '--target', 'playready', '--la-url', 'invalid'],
  [
    'convert',
    psshBoxToBase64(createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine })),
    '--target',
    'playready',
  ],
  [
    'convert',
    Buffer.concat([serializePsshBox(widevinePssh), serializePsshBox(widevinePssh)]).toString(
      'base64',
    ),
    '--target',
    'playready',
  ],
])('PSSH rejects invalid invocation %j', (...args) => {
  const result = run(['pssh', ...args]);
  expect(result.status, result.stdout).toBe(1);
  expect(result.stdout).toBe('');
  expect(result.stderr.trim()).not.toBe('');
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

test.each(['../../escaped', '..\\..\\escaped', '/tmp/escaped', 'C:\\temp\\escaped'])(
  'keeps generated filenames inside the working directory for %s',
  async (name) => {
    const cwd = await mkdtemp(join(directory, 'filename-'));
    const parsed = parseWvd(wvd);
    const clientId = ClientIdentification.decode(parsed.clientId);
    clientId.clientInfo = [
      { name: 'company_name', value: name },
      { name: 'model_name', value: 'Device' },
    ];
    const source = join(directory, 'hostile.wvd');
    await writeFile(
      source,
      buildWvd({ ...parsed, clientId: ClientIdentification.encode(clientId).finish() }),
    );
    const result = run(['client', 'pack', source], cwd);
    expect(result.status, result.stderr).toBe(0);
    const files = await readdir(cwd);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^[a-z0-9_-]+\.wvd$/);
    expect(parseWvd(new Uint8Array(await readFile(join(cwd, files[0])))).clientId).toEqual(
      ClientIdentification.encode(clientId).finish(),
    );
  },
);
