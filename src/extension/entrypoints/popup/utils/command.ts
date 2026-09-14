import { getDownloadHeaders, isSensitiveHeader, type RequestHeader } from '@/utils/request-headers';
import { isManifestUrl } from '@/utils/manifest';
import type { KeyInfo } from '@/utils/storage';

// POSIX shell quoting: leave single quotes briefly to insert a literal apostrophe.
const quoteShellArgument = (value: string) => `'${value.replaceAll("'", "'\"'\"'")}'`;

const buildCommand = (
  manifestUrl: string | undefined,
  pairs: string[],
  headers: RequestHeader[],
) => {
  if (!isManifestUrl(manifestUrl)) return undefined;
  const keyArguments = pairs.map((pair) => ` --key ${quoteShellArgument(pair)}`).join('');
  const headerArguments = getDownloadHeaders(headers)
    .filter(
      (header) => new URL(manifestUrl).protocol === 'https:' || !isSensitiveHeader(header.name),
    )
    .map(({ name, value }) => ` -H ${quoteShellArgument(`${name}: ${value}`)}`)
    .join('');
  return `N_m3u8DL-RE ${quoteShellArgument(manifestUrl)}${keyArguments}${headerArguments}`;
};

export const buildDownloadCommand = (
  key: Pick<KeyInfo, 'mpd' | 'id' | 'value'>,
  manifestUrl = key.mpd,
  headers: RequestHeader[] = [],
) => buildCommand(manifestUrl, [`${key.id}:${key.value}`], headers);

export const buildCaptureDownloadCommand = (
  records: Pick<KeyInfo, 'id' | 'value'>[],
  manifestUrl: string | undefined,
  headers: RequestHeader[] = [],
) => {
  const pairs = records
    .filter((record) => /^[a-f0-9]{32}$/i.test(record.id) && /^[a-f0-9]{32}$/i.test(record.value))
    .map((record) => `${record.id.toLowerCase()}:${record.value.toLowerCase()}`);
  return buildCommand(manifestUrl, [...new Set(pairs)], headers);
};
