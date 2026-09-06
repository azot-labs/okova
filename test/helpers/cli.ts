import { execFileSync, spawnSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, afterAll } from 'vitest';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../../src/lib/widevine/proto';
import { buildWvd } from '../../src/lib/widevine/wvd';

export let directory: string;
let executable: string;
export let input: string;
export let wvd: Uint8Array;

export const setupCliTests = () => {
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
            drmCertificate: DrmCertificate.encode(
              DrmCertificate.create({ systemId: 123 }),
            ).finish(),
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
    await writeFile(
      join(directory, 'invalid-config.json'),
      JSON.stringify({ sessionLimits: false }),
    );
  }, 60_000);

  afterAll(async () => {
    if (directory) await rm(directory, { recursive: true, force: true });
  });
};

export const run = (args: string[], cwd = directory) =>
  spawnSync(process.execPath, [executable, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 10_000,
  });
