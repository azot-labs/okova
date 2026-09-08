import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { WidevineClientCredentials } from '../lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../lib/playready/client-credentials';

export const importClientCredentials = async (input: string, output?: string) => {
  const inputStat = await stat(input);
  const isDir = inputStat.isDirectory();

  if (isDir) {
    const entries = (await readdir(input, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
    const candidates: (() => Promise<WidevineClientCredentials | PlayReadyClientCredentials>)[] =
      [];
    const addRaw = (
      firstQuery: string,
      secondQuery: string,
      load: (
        first: Buffer,
        second: Buffer,
      ) => Promise<WidevineClientCredentials | PlayReadyClientCredentials>,
    ) => {
      const first = entries.filter((entry) => entry.includes(firstQuery));
      const second = entries.filter((entry) => entry.includes(secondQuery));
      if (!first.length || !second.length) return;
      if (first.length > 1 || second.length > 1 || first[0] === second[0]) {
        throw new Error(`Ambiguous raw credential files in ${input}`);
      }
      candidates.push(async () =>
        load(await readFile(join(input, first[0]!)), await readFile(join(input, second[0]!))),
      );
    };
    if (!output?.endsWith('.prd')) {
      for (const file of entries.filter((entry) => entry.endsWith('.wvd'))) {
        candidates.push(async () =>
          WidevineClientCredentials.from({ wvd: await readFile(join(input, file)) }),
        );
      }
      addRaw('client_id', 'private_key', (id, key) => WidevineClientCredentials.from({ id, key }));
    }
    if (!output?.endsWith('.wvd')) {
      for (const file of entries.filter((entry) => entry.endsWith('.prd'))) {
        candidates.push(async () =>
          PlayReadyClientCredentials.from({ prd: await readFile(join(input, file)) }),
        );
      }
      addRaw('bgroupcert', 'zgpriv', (groupCertificate, groupKey) =>
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
  } else if (input.endsWith('.wvd')) {
    const wvd = await readFile(input);
    return await WidevineClientCredentials.from({ wvd });
  } else if (input.endsWith('.prd')) {
    const prd = await readFile(input);
    return await PlayReadyClientCredentials.from({ prd });
  } else {
    throw new Error(`Unable to find credential files in ${input}`);
  }
};

export const col = (str: string, offset = 2, width = 30) =>
  `${' '.repeat(offset)}${str.padEnd(width)}`;
