import { join } from 'node:path';
import { importClientCredentials } from '../../utils';
import { exportFiles } from './export-files';

export const unpack = async (input = process.cwd(), output?: string) => {
  const credentials = await importClientCredentials(input, output);
  if (!('unpack' in credentials)) return;
  const unpacked = await credentials.unpack();
  const directory = output || process.cwd();
  await exportFiles(directory, unpacked);
  const outputs = Object.keys(unpacked).map((filename) => join(directory, filename));
  console.log(`Credentials unpacked: ${outputs.join(', ')}`);
};
