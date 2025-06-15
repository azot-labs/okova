import { writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { importClient } from '../../utils';

export const pack = async (
  input = process.cwd(),
  format?: string,
  output?: string,
) => {
  const client = await importClient(input);
  const ext = format || (output ? extname(output) : '');
  const data = await client.pack();
  const filename = `${client.getName()}`.replaceAll(' ', '-').toLowerCase();
  const outputPath = output || join(process.cwd(), `${filename}.${ext}`);
  await writeFile(outputPath, data);
  console.log(`Client packed: ${outputPath}`);
};
