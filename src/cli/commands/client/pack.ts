import { basename, dirname, extname, join } from 'node:path';
import { importClient } from '../../utils';
import { exportFiles } from './export-files';

export const pack = async (input = process.cwd(), format?: string, output?: string) => {
  const client = await importClient(input, output);
  const ext = format || (output ? extname(output) : '');
  const data = await client.pack();
  const filename = `${client.getName()}`.replaceAll(' ', '-').toLowerCase();
  const outputPath = output || join(process.cwd(), `${filename}.${ext}`);
  await exportFiles(dirname(outputPath), { [basename(outputPath)]: data });
  console.log(`Client packed: ${outputPath}`);
  // Convert to Base64: `base64 -i /Users/.../client.wvd | tr -d '\n' | pbcopy`
};
