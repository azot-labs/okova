import { join } from 'node:path';
import { importClient } from '../../utils';
import { exportFiles } from './export-files';

export const unpack = async (input = process.cwd(), output?: string) => {
  const client = await importClient(input, output);
  if (!('unpack' in client)) return;
  const unpacked = await client.unpack();
  const directory = output || process.cwd();
  await exportFiles(directory, unpacked);
  const outputs = Object.keys(unpacked).map((filename) => join(directory, filename));
  console.log(`Client unpacked: ${outputs.join(', ')}`);
};
