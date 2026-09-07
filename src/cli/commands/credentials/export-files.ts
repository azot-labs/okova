import { link, lstat, mkdir, mkdtemp, open, rm, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Stage complete files beside their destinations, then publish without replacing existing paths.
export const exportFiles = async (directory: string, files: Record<string, Uint8Array>) => {
  await mkdir(directory, { recursive: true });
  const filenames = Object.keys(files);
  for (const filename of filenames) {
    const destination = join(directory, filename);
    const existing = await lstat(destination).catch((error: unknown) => {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
      throw error;
    });
    if (existing) throw new Error(`Refusing to overwrite existing path: ${destination}`);
  }

  const stagingDirectory = await mkdtemp(join(directory, '.okova-export-'));
  const published: { destination: string; dev: bigint; ino: bigint }[] = [];
  try {
    for (const [filename, data] of Object.entries(files)) {
      await writeFile(join(stagingDirectory, filename), data, { flag: 'wx', mode: 0o600 });
    }
    for (const filename of filenames) {
      const destination = join(directory, filename);
      const stagedPath = join(stagingDirectory, filename);
      const staged = await lstat(stagedPath, { bigint: true });
      // Unlike rename, link fails if a destination appeared after preflight.
      try {
        await link(stagedPath, destination);
        published.push({ destination, dev: staged.dev, ino: staged.ino });
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !('code' in error) ||
          !['EPERM', 'ENOTSUP', 'EOPNOTSUPP', 'ENOSYS', 'EXDEV'].includes(String(error.code))
        ) {
          throw error;
        }
        // Filesystems without hard links still support exclusive creation.
        const output = await open(destination, 'wx', 0o600);
        try {
          const created = await output.stat({ bigint: true });
          published.push({ destination, dev: created.dev, ino: created.ino });
          await output.writeFile(files[filename]);
        } finally {
          await output.close();
        }
      }
    }
  } catch (error) {
    const rollback = await Promise.allSettled(
      published.map(async ({ destination, dev, ino }) => {
        try {
          const current = await lstat(destination, { bigint: true });
          // Leave paths now owned by another writer alone.
          // This is best-effort: filesystem APIs cannot atomically compare and unlink an inode.
          if (current.dev === dev && current.ino === ino) {
            await unlink(destination);
          }
        } catch (error) {
          if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return;
          throw error;
        }
      }),
    );
    const failures = rollback.filter((result) => result.status === 'rejected');
    if (failures.length) {
      throw new AggregateError(
        [error, ...failures.map((result) => result.reason)],
        'Export failed and some newly created files could not be removed',
      );
    }
    throw error;
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
};
