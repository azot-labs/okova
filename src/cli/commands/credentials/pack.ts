import { basename, dirname, extname, join } from 'node:path';
import { importClientCredentials } from '../../utils';
import { WidevineClientCredentials } from '../../../lib/widevine/client-credentials';
import { exportFiles } from './export-files';

export const pack = async (input = process.cwd(), format?: 'wvd' | 'prd', output?: string) => {
  const credentials = await importClientCredentials(
    input,
    format ? `credentials.${format}` : output,
  );
  const ext = credentials instanceof WidevineClientCredentials ? 'wvd' : 'prd';
  if (format && format !== ext) {
    throw new Error(`Cannot pack ${ext} credentials as ${format}`);
  }
  const outputExtension = output ? extname(output).toLowerCase() : '';
  if (['.wvd', '.prd'].includes(outputExtension) && outputExtension !== `.${ext}`) {
    throw new Error(`Output extension must match credential format: .${ext}`);
  }
  const data = await credentials.pack();
  const filename =
    credentials
      .getName()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-') || 'credentials';
  const outputPath = output || join(process.cwd(), `${filename}.${ext}`);
  await exportFiles(dirname(outputPath), { [basename(outputPath)]: data });
  console.log(`Credentials packed: ${outputPath}`);
};
