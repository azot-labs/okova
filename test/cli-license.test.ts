import { afterEach, expect, test, vi } from 'vitest';
import { license } from '../src/cli/commands/license/license';
import { importClientCredentials } from '../src/cli/utils';
import { fetchDecryptionKeys, Widevine } from '../src/lib';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';
import { ClientIdentification } from '../src/lib/widevine/proto';

vi.mock('../src/cli/utils', async (original) => ({
  ...(await original<typeof import('../src/cli/utils')>()),
  importClientCredentials: vi.fn(),
}));
vi.mock('../src/lib', async (original) => ({
  ...(await original<typeof import('../src/lib')>()),
  fetchDecryptionKeys: vi.fn(async () => new Map<string, string>()),
}));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

test.each([
  ['Authorization'],
  [': value'],
  ['bad name: value'],
  ['X: a\x01b'],
  ['X: a\r\nb'],
  ['X: a\0b'],
  ['X: a', 'x: b'],
])('rejects invalid headers before importing credentials: %j', async (...headers) => {
  await expect(license({ url: 'https://example.test', pssh: 'AQ==', headers })).rejects.toThrow(
    /header/i,
  );
  expect(importClientCredentials).not.toHaveBeenCalled();
});

test('normalizes valid headers and shares the certificate deadline with acquisition', async () => {
  vi.mocked(importClientCredentials).mockResolvedValue(
    new WidevineClientCredentials(ClientIdentification.create({})),
  );
  vi.spyOn(Widevine.prototype, 'setServerCertificate').mockResolvedValue(true);
  const fetch = vi.fn(async () => new Response(new Uint8Array([1])));
  vi.stubGlobal('fetch', fetch);
  await license({
    url: 'https://example.test',
    pssh: 'AQ==',
    encrypt: true,
    headers: [' X-Test : a:b ', 'X-Empty:'],
  });
  const options = vi.mocked(fetchDecryptionKeys).mock.calls[0][0];
  expect(options.headers).toEqual({ 'x-test': 'a:b', 'x-empty': '' });
  expect(fetch).toHaveBeenCalledWith(
    'https://example.test',
    expect.objectContaining({ signal: options.signal }),
  );
  expect(options.signal).toBeInstanceOf(AbortSignal);
});

test.each(['headers', 'body'])('aborts a stalled certificate response %s', async (stage) => {
  vi.mocked(importClientCredentials).mockResolvedValue(
    new WidevineClientCredentials(ClientIdentification.create({})),
  );
  const controller = new AbortController();
  vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
  const started = Promise.withResolvers<void>();
  const stalled = () =>
    new Promise<never>((_, reject) => {
      controller.signal.addEventListener('abort', () => reject(controller.signal.reason), {
        once: true,
      });
      started.resolve();
    });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => (stage === 'headers' ? stalled() : { ok: true, arrayBuffer: stalled })),
  );
  const pending = license({ url: 'https://example.test', pssh: 'AQ==', encrypt: true });
  const rejected = expect(pending).rejects.toThrow('deadline');
  await started.promise;
  controller.abort(new DOMException('deadline', 'TimeoutError'));
  await rejected;
  expect(AbortSignal.timeout).toHaveBeenCalledWith(30_000);
  expect(fetchDecryptionKeys).not.toHaveBeenCalled();
});
