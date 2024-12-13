import { writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { importClient } from '../../utils';

export const pack = async (
  input = process.cwd(),
  format?: string,
  output?: string,
) => {
  const client = await importClient(input);
  const ext = format || (output ? extname(output) : 'azot');
  const data = await client.pack(ext as 'wvd' | 'azot' | undefined);
  const filename =
    `${client.info.get('company_name')}-${client.info.get('model_name')}`
      .replaceAll(' ', '-')
      .toLowerCase();
  const outputPath = output || join(process.cwd(), `${filename}.${ext}`);
  await writeFile(outputPath, data);
  console.log(`Client packed: ${outputPath}`);
};
