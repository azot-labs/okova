import { getDownloadHeaders, type RequestHeader } from '@/utils/request-headers';
import { isManifestUrl } from '@/utils/manifest';
import type { KeyInfo } from '@/utils/storage';

// POSIX shell quoting: leave single quotes briefly to insert a literal apostrophe.
const quoteShellArgument = (value: string) => `'${value.replaceAll("'", "'\"'\"'")}'`;

export const buildDownloadCommand = (
  key: Pick<KeyInfo, 'mpd' | 'id' | 'value'>,
  manifestUrl = key.mpd,
  headers: RequestHeader[] = [],
) => {
  if (!isManifestUrl(manifestUrl)) return undefined;
  const headerArguments = getDownloadHeaders(headers)
    .map(({ name, value }) => ` -H ${quoteShellArgument(`${name}: ${value}`)}`)
    .join('');
  return `N_m3u8DL-RE ${quoteShellArgument(manifestUrl)} --key ${quoteShellArgument(`${key.id}:${key.value}`)}${headerArguments}`;
};
