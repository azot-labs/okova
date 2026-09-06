import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const directory = await mkdtemp(join(tmpdir(), 'okova-package-'));
try {
  const archive = join(directory, 'okova.tgz');
  execFileSync('pnpm', ['pack', '--out', archive], { stdio: 'pipe' });
  const installed = join(directory, 'node_modules', 'okova');
  await mkdir(installed, { recursive: true });
  execFileSync('tar', ['-xzf', archive, '--strip-components=1', '-C', installed]);
  const manifest = JSON.parse(await readFile(join(installed, 'package.json'), 'utf8'));
  assert.equal(manifest.name, 'okova');
  // Resolve only declared runtime dependencies from the frozen workspace install.
  for (const name of Object.keys(manifest.dependencies)) {
    const target = join(directory, 'node_modules', name);
    await mkdir(dirname(target), { recursive: true });
    await symlink(resolve('node_modules', name), target, 'dir');
  }
  const checks = `
    const assert = (await import('node:assert/strict')).default;
    assert.equal(typeof lib.Widevine, 'function');
    assert.equal(typeof lib.PlayReady, 'function');
    assert.equal(typeof lib.Remote, 'function');
    const box = lib.createPsshBox({ systemId: lib.PSSH_SYSTEM_IDS.widevine });
    const [parsed] = lib.parsePsshBoxes(lib.psshBoxToBase64(box));
    assert.equal(parsed.systemId, box.systemId);
    await assert.rejects(lib.requestMediaKeySystemAccess('', []), TypeError);
  `;
  for (const mode of ['esm', 'cjs']) {
    const load =
      mode === 'esm'
        ? "const lib = await import('okova');"
        : "const { createRequire } = await import('node:module'); const lib = createRequire(import.meta.url)('okova');";
    execFileSync(process.execPath, ['--input-type=module', '-e', load + checks], {
      cwd: directory,
      stdio: 'inherit',
    });
    console.log(`Packaged ${mode.toUpperCase()} consumer passed`);
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
