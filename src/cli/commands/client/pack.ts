import { basename, dirname, extname, join } from 'node:path';
import { importClient } from '../../utils';
import { WidevineDeviceCredentials } from '../../../lib/widevine/device-credentials';
import { exportFiles } from './export-files';

export const pack = async (input = process.cwd(), format?: 'wvd' | 'prd', output?: string) => {
  const client = await importClient(input, format ? `client.${format}` : output);
  const ext = client instanceof WidevineDeviceCredentials ? 'wvd' : 'prd';
  if (format && format !== ext) {
    throw new Error(`Cannot pack ${ext} credentials as ${format}`);
  }
  const outputExtension = output ? extname(output).toLowerCase() : '';
  if (['.wvd', '.prd'].includes(outputExtension) && outputExtension !== `.${ext}`) {
    throw new Error(`Output extension must match credential format: .${ext}`);
  }
  const data = await client.pack();
  const filename = `${client.getName()}`.replaceAll(' ', '-').toLowerCase();
  const outputPath = output || join(process.cwd(), `${filename}.${ext}`);
  await exportFiles(dirname(outputPath), { [basename(outputPath)]: data });
  console.log(`Client packed: ${outputPath}`);
};
