import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';
import { buildDownloadCommand } from '../src/extension/entrypoints/popup/utils/command';

test
  .skipIf(process.platform === 'win32')
  .each([
    'https://example.com/manifest.mpd',
    'https://example.com/$0manifest.mpd?first=1&second=2',
    'https://example.com/a b/"quoted"/it\'s.mpd',
    'https://example.com/$(printf expanded)/`printf expanded`/manifest.mpd',
    'https://example.com/back\\slash;*?[x]\nmanifest.mpd',
    '',
  ])('preserves download arguments in Bash: %j', (mpd) => {
  const key = { mpd, id: '0123456789abcdef', value: 'abcdef0123456789' };
  const command = buildDownloadCommand(key);
  // Stand in for the downloader so the real shell parses the generated command.
  const output = execFileSync(
    'bash',
    ['--noprofile', '--norc', '-c', `function N_m3u8DL-RE() { printf '%s\\0' "$@"; }\n${command}`],
    { encoding: 'utf8' },
  );
  expect(output.split('\0')).toEqual([mpd, '--key', `${key.id}:${key.value}`, '']);
});
