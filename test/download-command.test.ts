import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';
import {
  buildDownloadCommand,
  buildCaptureDownloadCommand,
} from '../src/extension/entrypoints/popup/utils/command';

test.each([
  { id: '0123456789abcdef', value: 'abcdef0123456789' },
  { id: '0123456789abcdef', value: 'abcdef0123456789', mpd: undefined },
])('does not build a command without a manifest URL: %j', (key) => {
  expect(buildDownloadCommand(key)).toBeUndefined();
});

test
  .skipIf(process.platform === 'win32')
  .each([
    'https://example.com/manifest.mpd',
    'https://example.com/',
    'https://example.com/playback?token=abc&format=hls',
    'https://example.com/$0manifest.mpd?first=1&second=2',
    'https://example.com/a b/"quoted"/it\'s.mpd',
    'https://example.com/$(printf expanded)/`printf expanded`/manifest.mpd',
    'https://example.com/back\\slash;*?[x]\nmanifest.mpd',
    'https://example.com/master.m3u8?token=abc',
    'https://example.com/video.ism/Manifest',
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

test.each(['', 'javascript:alert(1)', 'data:text/plain,test', '/manifest.mpd'])(
  'rejects invalid downloader URLs: %s',
  (mpd) => {
    expect(buildDownloadCommand({ mpd, id: 'id', value: 'key' })).toBeUndefined();
  },
);

test('uses the selected manifest instead of the saved default', () => {
  expect(
    buildDownloadCommand(
      { mpd: 'https://example.com/old.mpd', id: 'id', value: 'key' },
      'https://example.com/new.m3u8',
    ),
  ).toBe("N_m3u8DL-RE 'https://example.com/new.m3u8' --key 'id:key'");
});

test.skipIf(process.platform === 'win32')(
  'quotes selected request headers as literal downloader arguments',
  () => {
    const key = { mpd: 'https://example.com/playback', id: 'id', value: 'key' };
    const headers = [
      { name: 'Authorization', value: "Bearer it's $HOME `whoami` $(whoami)" },
      { name: 'Cookie', value: 'session=one; other=two' },
    ];
    const command = buildDownloadCommand(key, key.mpd, headers);
    const output = execFileSync(
      'bash',
      [
        '--noprofile',
        '--norc',
        '-c',
        `function N_m3u8DL-RE() { printf '%s\\0' "$@"; }\n${command}`,
      ],
      { encoding: 'utf8' },
    );
    expect(output.split('\0')).toEqual([
      key.mpd,
      '--key',
      'id:key',
      '-H',
      `Authorization: ${headers[0]!.value}`,
      '-H',
      `Cookie: ${headers[1]!.value}`,
      '',
    ]);
    expect(buildDownloadCommand(key)).not.toContain('-H');
  },
);

test('builds one capture command with distinct keys and excludes status records', () => {
  const first = { id: 'a'.repeat(32), value: 'b'.repeat(32) };
  const second = { id: 'c'.repeat(32), value: 'd'.repeat(32) };
  const records = [
    first,
    second,
    { id: first.id.toUpperCase(), value: first.value.toUpperCase() },
    { id: 'e'.repeat(32), value: 'usable' },
  ];
  const command = buildCaptureDownloadCommand(records, 'https://example.test/movie.mpd');
  expect(command).toBe(
    `N_m3u8DL-RE 'https://example.test/movie.mpd' --key '${first.id}:${first.value}' --key '${second.id}:${second.value}'`,
  );
});

test('supports manifest-only captures and refuses captures without a manifest', () => {
  expect(buildCaptureDownloadCommand([], 'https://example.test/master.m3u8')).toBe(
    "N_m3u8DL-RE 'https://example.test/master.m3u8'",
  );
  expect(buildCaptureDownloadCommand([], undefined)).toBeUndefined();
  expect(buildCaptureDownloadCommand([], 'javascript:alert(1)')).toBeUndefined();
});

test('HTTP commands omit sensitive headers while preserving ordinary headers', () => {
  const headers = [
    { name: 'Cookie', value: 'session=secret' },
    { name: 'Authorization', value: 'Bearer secret' },
    { name: 'Referer', value: 'https://example.test/' },
  ];
  const command = buildCaptureDownloadCommand([], 'http://example.test/stream.mpd', headers);
  expect(command).not.toContain('secret');
  expect(command).toContain('Referer: https://example.test/');
  expect(buildCaptureDownloadCommand([], 'https://example.test/stream.mpd', headers)).toContain(
    'Bearer secret',
  );
});
