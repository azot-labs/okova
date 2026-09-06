import { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { setupCliTests, directory, run, wvd } from '../helpers/cli';

setupCliTests();

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
