import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { WidevineClientCredentials } from '../lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../lib/playready/client-credentials';

// Follow file symlinks, but ignore dangling links and links to directories.
export const listFiles = async (directory: string) => {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile()) {
      files.push(entry.name);
    } else if (entry.isSymbolicLink()) {
      try {
        if ((await stat(join(directory, entry.name))).isFile()) files.push(entry.name);
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          ['ENOENT', 'ENOTDIR', 'ELOOP'].includes(String(error.code))
        )
          continue;
        throw error;
      }
    }
  }
  return files;
};

export const importClientCredentials = async (input: string, output?: string) => {
  const inputExtension = extname(input).toLowerCase();
  const outputExtension = output ? extname(output).toLowerCase() : undefined;
  const inputStat = await stat(input);
  const isDir = inputStat.isDirectory();

  if (isDir) {
    const entries = await listFiles(input);
    const candidates: (() => Promise<WidevineClientCredentials | PlayReadyClientCredentials>)[] =
      [];
    const addRaw = (
      firstNames: string[],
      secondNames: string[],
      load: (
        first: Buffer,
        second: Buffer,
      ) => Promise<WidevineClientCredentials | PlayReadyClientCredentials>,
    ) => {
      const first = entries.filter((entry) => firstNames.includes(entry.toLowerCase()));
      const second = entries.filter((entry) => secondNames.includes(entry.toLowerCase()));
      if (!first.length || !second.length) return;
      if (first.length > 1 || second.length > 1 || first[0] === second[0]) {
        throw new Error(`Ambiguous raw credential files in ${input}`);
      }
      candidates.push(async () =>
        load(await readFile(join(input, first[0]!)), await readFile(join(input, second[0]!))),
      );
    };
    if (outputExtension !== '.prd') {
      for (const file of entries.filter((entry) => extname(entry).toLowerCase() === '.wvd')) {
        candidates.push(async () =>
          WidevineClientCredentials.from({ wvd: await readFile(join(input, file)) }),
        );
      }
      addRaw(
        ['device_client_id_blob', 'client_id_blob', 'client_id', 'client_id.bin'],
        ['device_private_key', 'private_key', 'private_key.pem'],
        (id, key) => WidevineClientCredentials.from({ id, key }),
      );
    }
    if (outputExtension !== '.wvd') {
      for (const file of entries.filter((entry) => extname(entry).toLowerCase() === '.prd')) {
        candidates.push(async () =>
          PlayReadyClientCredentials.from({ prd: await readFile(join(input, file)) }),
        );
      }
      addRaw(
        ['bgroupcert.dat', 'bgroupcert'],
        ['zgpriv.dat', 'zgpriv'],
        (groupCertificate, groupKey) =>
          PlayReadyClientCredentials.from({ groupCertificate, groupKey }),
      );
    }
    if (candidates.length > 1) {
      throw new Error(
        `Ambiguous credential files in ${input}. Specify a packed file or a directory containing one credential set.`,
      );
    }
    const load = candidates[0];
    if (!load) throw new Error(`Unable to find credential files in ${input}`);
    return load();
  } else if (inputExtension === '.wvd') {
    const wvd = await readFile(input);
    return await WidevineClientCredentials.from({ wvd });
  } else if (inputExtension === '.prd') {
    const prd = await readFile(input);
    return await PlayReadyClientCredentials.from({ prd });
  } else {
    throw new Error(`Unable to find credential files in ${input}`);
  }
};

export const col = (str: string, offset = 2, width = 30) =>
  `${' '.repeat(offset)}${str.padEnd(width)}`;
