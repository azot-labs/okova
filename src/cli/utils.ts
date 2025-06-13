import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { WidevineClient } from '../lib/widevine/client';
import { PlayReadyClient } from '../lib/playready/client';

export const importClient = async (input: string) => {
  const inputStat = await stat(input);
  const isDir = inputStat.isDirectory();
  if (isDir) {
    const entries = isDir ? await readdir(input) : [];
    const idFilename = entries.find((entry) => entry.includes('client_id'));
    const keyFilename = entries.find((entry) => entry.includes('private_key'));
    const packedFilename = entries.find((entry) => entry.endsWith('wvd'));
    const isUnpacked = !!(idFilename && keyFilename);
    const isPacked = !!packedFilename;
    if (isUnpacked) {
      const idPath = join(input, idFilename);
      const keyPath = join(input, keyFilename);
      const id = await readFile(idPath);
      const key = await readFile(keyPath);
      return WidevineClient.from({ id, key });
    } else if (isPacked) {
      const packedPath = join(input, packedFilename);
      const packed = await readFile(packedPath);
      return await WidevineClient.from({ wvd: packed });
    } else {
      console.log(`Unable to find client files in ${input}`);
      process.exit(1);
    }
  } else if (input.endsWith('.wvd')) {
    const wvd = await readFile(input);
    return WidevineClient.from({ wvd });
  } else if (input.endsWith('.prd')) {
    const prd = await readFile(input);
    return PlayReadyClient.from({ prd });
  } else {
    console.log(`Unable to find client files in ${input}`);
    process.exit(1);
  }
};

export const col = (str: string, offset = 2, width = 30) =>
  `${' '.repeat(offset)}${str.padEnd(width)}`;
