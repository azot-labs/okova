import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { importClient } from '../../utils';

export const unpack = async (input = process.cwd(), output?: string) => {
  const client = await importClient(input);
  if (!('unpack' in client)) return;
  const unpacked = await client.unpack();
  const outputs: string[] = [];
  for (const [filename, data] of Object.entries(unpacked)) {
    const outputPath = join(output || process.cwd(), filename);
    await writeFile(outputPath, data);
    outputs.push(outputPath);
  }
  console.log(`Client unpacked: ${outputs.join(', ')}`);
};
