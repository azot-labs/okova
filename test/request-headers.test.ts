import { expect, test } from 'vitest';
import {
  createRequestHeaderCache,
  getDownloadHeaders,
} from '../src/extension/utils/request-headers';

const url = 'https://example.com/playback?format=hls';
const headers = [{ name: 'Cookie', value: 'session=private' }];
const observation = { requestId: 'one', tabId: 1, frameId: 2, url, headers };
const capture = { token: 'key', tabId: 1, frameId: 2, incognito: false };

test('correlates extensionless URLs by tab/frame and keeps redirect-hop credentials separate', () => {
  const cache = createRequestHeaderCache();
  cache.observe(observation);
  cache.observe({ ...observation, url: 'https://cdn.example.com/final', headers: [] });
  cache.observe({
    ...observation,
    requestId: 'other-tab',
    tabId: 3,
    headers: [{ name: 'Cookie', value: 'wrong tab' }],
  });
  cache.observe({
    ...observation,
    requestId: 'other-frame',
    frameId: 4,
    headers: [{ name: 'Cookie', value: 'wrong frame' }],
  });
  cache.capture(capture, [url, 'https://cdn.example.com/final']);
  expect(cache.read('key', url, false)).toEqual(headers);
  expect(cache.read('key', 'https://cdn.example.com/final', false)).toEqual([]);
  expect(cache.read('key', url, true)).toEqual([]);
  expect(cache.read('key', 'https://unrelated.example.com/', false)).toEqual([]);
});

test('supplements missing headers from page code only for one matching request', () => {
  const cache = createRequestHeaderCache(() => 1000);
  cache.observe(observation);
  const page = {
    url,
    headers: [
      { name: 'Authorization', value: 'Bearer token' },
      { name: 'Cookie', value: 'do not overwrite' },
    ],
    startedAt: 999,
    completedAt: 1000,
  };
  cache.observePage(page, 1, 2);
  cache.capture(capture, [url]);
  expect(cache.read('key', url, false)).toEqual([...headers, page.headers[0]]);
  cache.observe({ ...observation, requestId: 'concurrent' });
  cache.observePage(page, 1, 2);
  cache.capture(capture, [url]);
  expect(cache.read('key', url, false)).toEqual(headers);
});

test('expires observations and captures and clears frame/tab ownership', () => {
  let now = 1000;
  const cache = createRequestHeaderCache(() => now);
  cache.observe(observation);
  cache.capture(capture, [url]);
  cache.clear(1, 3);
  expect(cache.read('key', url, false)).toEqual(headers);
  cache.clear(1, 2);
  expect(cache.read('key', url, false)).toEqual([]);
  cache.observe(observation);
  cache.capture(capture, [url]);
  now += 300_000;
  expect(cache.read('key', url, false)).toEqual([]);
  cache.capture(capture, [url]);
  expect(cache.read('key', url, false)).toEqual([]);
});

test('bounds temporary observations and rejects malformed or oversized headers', () => {
  const cache = createRequestHeaderCache();
  cache.observe(observation);
  for (let index = 0; index < 256; index++)
    cache.observe({ ...observation, requestId: String(index), url: `${url}&n=${index}` });
  cache.capture(capture, [url]);
  expect(cache.read('key', url, false)).toEqual([]);
  expect(getDownloadHeaders([{ name: 'X-Test', value: 'a\r\nInjected: true' }])).toEqual([]);
  expect(getDownloadHeaders([{ name: 'X-Test', value: 'a'.repeat(16 * 1024 + 1) }])).toEqual([]);
  expect(
    getDownloadHeaders([
      { name: 'Range', value: 'bytes=0-2' },
      { name: 'Accept-Encoding', value: 'gzip' },
      { name: 'Sec-Fetch-Site', value: 'same-origin' },
      ...headers,
    ]),
  ).toEqual(headers);
});

test('discards failed requests and never supplements redirect-hop headers from page code', () => {
  const cache = createRequestHeaderCache(() => 1000);
  cache.observe(observation);
  cache.redirect('one');
  cache.observe({ ...observation, url: `${url}&redirected=true`, headers: [] });
  cache.observePage(
    { url: `${url}&redirected=true`, headers, startedAt: 999, completedAt: 1000 },
    1,
    2,
  );
  cache.capture(capture, [`${url}&redirected=true`]);
  expect(cache.read('key', `${url}&redirected=true`, false)).toEqual([]);
  cache.fail('one');
  cache.capture(capture, [url]);
  expect(cache.read('key', url, false)).toEqual([]);
});

test('retains supported headers alongside binary and malformed browser entries', () => {
  expect(
    getDownloadHeaders([
      { name: 'X-Binary', binaryValue: [255] },
      { name: 'X-Broken', value: 'bad\r\nvalue' },
      ...headers,
      { name: 'Authorization', value: 'Bearer token' },
    ]),
  ).toEqual([...headers, { name: 'Authorization', value: 'Bearer token' }]);
});

test('captures independent snapshots and does not expose mutable cache entries', () => {
  const cache = createRequestHeaderCache(() => 1000);
  cache.observe(observation);
  cache.capture(capture, [url]);
  cache.observePage(
    {
      url,
      headers: [{ name: 'Authorization', value: 'Bearer later' }],
      startedAt: 999,
      completedAt: 1000,
    },
    1,
    2,
  );
  expect(cache.read('key', url, false)).toEqual(headers);
  const result = cache.read('key', url, false);
  if (result[0]) result[0].value = 'mutated';
  result.push({ name: 'X-Extra', value: 'mutated' });
  expect(cache.read('key', url, false)).toEqual(headers);
});

test('document identity prevents capturing or supplementing another document request', () => {
  const cache = createRequestHeaderCache(() => 1000);
  cache.observe({ ...observation, documentId: 'old' });
  cache.observePage(
    {
      url,
      headers: [{ name: 'X-Other', value: 'wrong document' }],
      startedAt: 999,
      completedAt: 1000,
    },
    1,
    2,
    'new',
  );
  cache.capture({ ...capture, documentId: 'old' }, [url]);
  expect(cache.read('key', url, false)).toEqual(headers);
  cache.capture({ ...capture, documentId: 'new' }, [url]);
  expect(cache.read('key', url, false)).toEqual([]);
});
