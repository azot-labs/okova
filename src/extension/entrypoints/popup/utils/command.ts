import { isManifestUrl } from '@/utils/manifest';
import type { KeyInfo } from '@/utils/storage';

// POSIX shell quoting: leave single quotes briefly to insert a literal apostrophe.
const quoteShellArgument = (value: string) => `'${value.replaceAll("'", "'\"'\"'")}'`;

export const buildDownloadCommand = (
  key: Pick<KeyInfo, 'mpd' | 'id' | 'value'>,
  manifestUrl = key.mpd,
) => {
  if (!isManifestUrl(manifestUrl)) return undefined;
  return `N_m3u8DL-RE ${quoteShellArgument(manifestUrl)} --key ${quoteShellArgument(`${key.id}:${key.value}`)}`;
};
