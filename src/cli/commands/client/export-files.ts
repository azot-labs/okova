import { link, lstat, mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises';
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
  const published: string[] = [];
  try {
    for (const [filename, data] of Object.entries(files)) {
      await writeFile(join(stagingDirectory, filename), data, { flag: 'wx', mode: 0o600 });
    }
    for (const filename of filenames) {
      const destination = join(directory, filename);
      // Unlike rename, link fails if a destination appeared after preflight.
      await link(join(stagingDirectory, filename), destination);
      published.push(destination);
    }
  } catch (error) {
    const rollback = await Promise.allSettled(published.map((path) => unlink(path)));
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
