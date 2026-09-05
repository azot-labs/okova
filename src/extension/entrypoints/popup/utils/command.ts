import type { KeyInfo } from '@/utils/storage';

// POSIX shell quoting: leave single quotes briefly to insert a literal apostrophe.
const quoteShellArgument = (value: string) => `'${value.replaceAll("'", "'\"'\"'")}'`;

export const buildDownloadCommand = (key: Pick<KeyInfo, 'mpd' | 'id' | 'value'>) =>
  `N_m3u8DL-RE ${quoteShellArgument(key.mpd)} --key ${quoteShellArgument(`${key.id}:${key.value}`)}`;
