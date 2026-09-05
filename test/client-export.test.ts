import { afterEach, expect, test, vi } from 'vitest';
import {
  link,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportFiles } from '../src/cli/commands/client/export-files';

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>();
  return { ...fs, link: vi.fn(fs.link) };
});

const directories: string[] = [];
const temporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'okova-export-test-'));
  directories.push(directory);
  return directory;
};
const files = {
  device_client_id_blob: new Uint8Array([1, 2, 3]),
  device_private_key: new Uint8Array([4, 5, 6]),
};

afterEach(async () => {
  vi.mocked(link).mockClear();
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

test('creates nested output directories and publishes complete files without staging leftovers', async () => {
  const directory = join(await temporaryDirectory(), 'nested', 'client');
  await exportFiles(directory, files);
  expect((await readdir(directory)).sort()).toEqual(Object.keys(files).sort());
  for (const [filename, data] of Object.entries(files)) {
    expect(new Uint8Array(await readFile(join(directory, filename)))).toEqual(data);
  }
});

test.each(Object.keys(files))(
  'refuses existing %s before publishing any file',
  async (filename) => {
    const directory = await temporaryDirectory();
    await writeFile(join(directory, filename), 'sentinel');
    await expect(exportFiles(directory, files)).rejects.toThrow('Refusing to overwrite');
    expect(await readFile(join(directory, filename), 'utf8')).toBe('sentinel');
    expect(await readdir(directory)).toEqual([filename]);
    expect(link).not.toHaveBeenCalled();
  },
);

test('refuses dangling symlinks', async () => {
  const directory = await temporaryDirectory();
  await symlink(join(directory, 'missing'), join(directory, 'device_private_key'));
  await expect(exportFiles(directory, files)).rejects.toThrow('Refusing to overwrite');
  expect(await readdir(directory)).toEqual(['device_private_key']);
});

test('rolls back the first output if the second publication fails', async () => {
  const directory = await temporaryDirectory();
  const fs = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  vi.mocked(link).mockImplementationOnce(fs.link).mockRejectedValueOnce(new Error('Disk failure'));
  await expect(exportFiles(directory, files)).rejects.toThrow('Disk failure');
  expect(await readdir(directory)).toEqual([]);
});

test('preserves a destination created after preflight and rolls back earlier outputs', async () => {
  const directory = await temporaryDirectory();
  const fs = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  vi.mocked(link)
    .mockImplementationOnce(fs.link)
    .mockImplementationOnce(async (source, destination) => {
      await writeFile(destination, 'concurrent export');
      await fs.link(source, destination);
    });
  await expect(exportFiles(directory, files)).rejects.toMatchObject({ code: 'EEXIST' });
  expect(await readdir(directory)).toEqual(['device_private_key']);
  expect(await readFile(join(directory, 'device_private_key'), 'utf8')).toBe('concurrent export');
});

test.each(['link', 'exclusive create'])(
  'preserves an atomically replaced %s output when a later publication fails',
  async (method) => {
    const directory = await temporaryDirectory();
    const fs = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
    if (method === 'link') {
      vi.mocked(link).mockImplementationOnce(fs.link);
    } else {
      vi.mocked(link).mockRejectedValueOnce(
        Object.assign(new Error('Hard links unavailable'), { code: 'ENOTSUP' }),
      );
    }
    vi.mocked(link).mockImplementationOnce(async () => {
      const replacement = join(directory, 'replacement');
      await writeFile(replacement, 'another writer');
      await rename(replacement, join(directory, 'device_client_id_blob'));
      throw new Error('Disk failure');
    });
    await expect(exportFiles(directory, files)).rejects.toThrow('Disk failure');
    expect(await readdir(directory)).toEqual(['device_client_id_blob']);
    expect(await readFile(join(directory, 'device_client_id_blob'), 'utf8')).toBe('another writer');
  },
);

test('preserves the publication error when another writer already removed an output', async () => {
  const directory = await temporaryDirectory();
  const fs = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  vi.mocked(link)
    .mockImplementationOnce(fs.link)
    .mockImplementationOnce(async () => {
      await unlink(join(directory, 'device_client_id_blob'));
      throw new Error('Disk failure');
    });
  await expect(exportFiles(directory, files)).rejects.toThrow('Disk failure');
  expect(await readdir(directory)).toEqual([]);
});

test.each(['EPERM', 'ENOTSUP', 'EOPNOTSUPP', 'ENOSYS', 'EXDEV'])(
  'exports using exclusive creation when links fail with %s',
  async (code) => {
    const directory = await temporaryDirectory();
    const error = Object.assign(new Error('Hard links unavailable'), { code });
    vi.mocked(link).mockRejectedValueOnce(error).mockRejectedValueOnce(error);
    await exportFiles(directory, files);
    expect((await readdir(directory)).sort()).toEqual(Object.keys(files).sort());
    for (const [filename, data] of Object.entries(files)) {
      expect(new Uint8Array(await readFile(join(directory, filename)))).toEqual(data);
    }
  },
);

test('exclusive creation preserves a concurrent output and rolls back a previous fallback output', async () => {
  const directory = await temporaryDirectory();
  const error = Object.assign(new Error('Hard links unavailable'), { code: 'ENOTSUP' });
  vi.mocked(link)
    .mockRejectedValueOnce(error)
    .mockImplementationOnce(async (_source, destination) => {
      await writeFile(destination, 'concurrent export');
      throw error;
    });
  await expect(exportFiles(directory, files)).rejects.toMatchObject({ code: 'EEXIST' });
  expect(await readdir(directory)).toEqual(['device_private_key']);
  expect(await readFile(join(directory, 'device_private_key'), 'utf8')).toBe('concurrent export');
});
