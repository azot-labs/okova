import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { WidevineDeviceCredentials } from '../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../lib/playready/device-credentials';

export const importClient = async (input: string, output?: string) => {
  const inputStat = await stat(input);
  const isDir = inputStat.isDirectory();

  const outputInfo = output ? await stat(output).catch(() => null) : null;
  const importForUnpack =
    !outputInfo || outputInfo?.isDirectory() || input.endsWith('.wvd') || input.endsWith('.prd');
  if (isDir) {
    const entries = isDir ? await readdir(input) : [];

    const find = (query: string) => entries.find((entry) => entry.includes(query));
    const endsWith = (query: string) => entries.find((entry) => entry.endsWith(query));

    const widevineIdFile = find('client_id');
    const widevineKeyFile = find('private_key');
    const wvdFile = endsWith('.wvd');

    const isWidevine =
      (!!(widevineIdFile && widevineKeyFile) || !!wvdFile) && !output?.endsWith('.prd');

    const playreadyCertificateFile = find('bgroupcert');
    const playreadyKeyFile = find('zgpriv');
    const prdFile = endsWith('.prd');

    const isPlayReady =
      (!!(playreadyCertificateFile && playreadyKeyFile) || !!prdFile) && !output?.endsWith('.wvd');

    if (isWidevine) {
      if (importForUnpack && wvdFile) {
        const wvd = await readFile(join(input, wvdFile));
        return await WidevineDeviceCredentials.from({ wvd });
      } else {
        const id = await readFile(join(input, widevineIdFile!));
        const key = await readFile(join(input, widevineKeyFile!));
        return WidevineDeviceCredentials.from({ id, key });
      }
    } else if (isPlayReady) {
      if (importForUnpack && prdFile) {
        const prd = await readFile(join(input, prdFile));
        return await PlayReadyDeviceCredentials.from({ prd });
      } else {
        const certificate = await readFile(join(input, playreadyCertificateFile!));
        const key = await readFile(join(input, playreadyKeyFile!));
        return PlayReadyDeviceCredentials.from({
          groupCertificate: certificate,
          groupKey: key,
        });
      }
    } else {
      console.log(`Unable to find client files in ${input}`);
      process.exit(1);
    }
  } else if (input.endsWith('.wvd')) {
    const wvd = await readFile(input);
    return await WidevineDeviceCredentials.from({ wvd });
  } else if (input.endsWith('.prd')) {
    const prd = await readFile(input);
    return await PlayReadyDeviceCredentials.from({ prd });
  } else {
    console.log(`Unable to find client files in ${input}`);
    process.exit(1);
  }
};

export const col = (str: string, offset = 2, width = 30) =>
  `${' '.repeat(offset)}${str.padEnd(width)}`;
