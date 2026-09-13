import { buildDownloadCommand } from '../src/extension/entrypoints/popup/utils/command';
import { pageRequestHeadersSchema } from '../src/extension/utils/request-headers';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { installNetworkInterception } from '../src/extension/utils/network-interception';

const manifest = '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"/>';
const url = 'https://example.com/manifest.mpd';
const postMessage = vi.fn();
const nativeFetch = vi.fn<typeof fetch>();

// Node lacks XMLHttpRequest. Model its response getters and load events.
class NativeXHR extends EventTarget {
  responseType: XMLHttpRequestResponseType = '';
  response: unknown = manifest;
  responseXML: unknown = null;
  responseURL = url;
  headers = 'content-type: application/dash+xml\r\n';
  get responseText() {
    if (this.responseType !== '' && this.responseType !== 'text') {
      throw new Error('responseText is unavailable for this response type');
    }
    return this.response;
  }
  getAllResponseHeaders() {
    return this.headers;
  }
  overrideMimeType() {}
  setRequestHeader() {}
  open() {}
  send() {
    this.response = '';
  }
}

beforeEach(() => {
  vi.stubGlobal('window', globalThis);
  // Node's Request has no document base URL; browsers resolve relative fetch inputs here.
  vi.stubGlobal(
    'Request',
    class extends Request {
      constructor(resource: RequestInfo | URL, options?: RequestInit) {
        super(
          typeof resource === 'string' ? new URL(resource, globalThis.document?.baseURI) : resource,
          options,
        );
      }
    },
  );
  vi.stubGlobal('Worker', class {});
  vi.stubGlobal('XMLHttpRequest', NativeXHR);
  vi.stubGlobal('XMLSerializer', XMLSerializer);
  vi.stubGlobal('postMessage', postMessage);
  vi.stubGlobal('fetch', nativeFetch);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  installNetworkInterception();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

test.each(['', 'text', 'arraybuffer', 'blob', 'document'] satisfies XMLHttpRequestResponseType[])(
  'captures XHR manifests with responseType "%s"',
  async (responseType) => {
    const xhr = new XMLHttpRequest();
    Object.assign(xhr, {
      responseType,
      response:
        responseType === 'arraybuffer'
          ? new TextEncoder().encode(manifest).buffer
          : responseType === 'blob'
            ? new Blob([manifest])
            : manifest,
      responseXML:
        responseType === 'document'
          ? new DOMParser().parseFromString(manifest, 'application/xml')
          : null,
    });
    xhr.dispatchEvent(new Event('load'));
    await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'okova:network',
        method: 'response',
        params: { url, text: manifest, headers: { 'content-type': 'application/dash+xml' } },
      }),
      '*',
    );
  },
);

test('decodes array buffers after load dispatch and preserves the completed response', async () => {
  vi.useFakeTimers();
  const decode = vi.spyOn(TextDecoder.prototype, 'decode');
  const response = new TextEncoder().encode(manifest).buffer;
  const xhr = new XMLHttpRequest();
  Object.assign(xhr, { responseType: 'arraybuffer', response });
  const onLoad = vi.fn(() => {
    const decodeCount = decode.mock.calls.length;
    const messageCount = postMessage.mock.calls.length;
    // A page can reuse the XHR from its load handler.
    Object.assign(xhr, { response: null, responseURL: 'https://example.com/next' });
    return { decodeCount, messageCount };
  });
  xhr.addEventListener('load', onLoad);
  xhr.dispatchEvent(new Event('load'));
  expect(onLoad).toHaveBeenCalledOnce();
  expect(onLoad).toHaveReturnedWith({ decodeCount: 0, messageCount: 0 });
  await Promise.resolve();
  expect(decode).not.toHaveBeenCalled();
  await vi.runAllTimersAsync();
  expect(decode).toHaveBeenCalledExactlyOnceWith(response);
  expect(postMessage).toHaveBeenCalledWith(
    expect.objectContaining({ params: expect.objectContaining({ url, text: manifest }) }),
    '*',
  );
});

test.each([
  { sizeBytes: 1024 * 1024 - 1, shouldDecode: true },
  { sizeBytes: 1024 * 1024, shouldDecode: false },
  { sizeBytes: 1024 * 1024 + 1, shouldDecode: false },
])(
  'checks the actual array-buffer size of $sizeBytes bytes',
  async ({ sizeBytes, shouldDecode }) => {
    vi.useFakeTimers();
    const decode = vi.spyOn(TextDecoder.prototype, 'decode');
    for (const contentLength of ['', 'content-length: 1\r\n']) {
      decode.mockClear();
      postMessage.mockClear();
      const response = new Uint8Array(sizeBytes);
      response.set(new TextEncoder().encode(manifest));
      const xhr = new XMLHttpRequest();
      Object.assign(xhr, {
        responseType: 'arraybuffer',
        response: response.buffer,
        headers: `content-type: application/octet-stream\r\n${contentLength}`,
      });
      xhr.dispatchEvent(new Event('load'));
      await vi.runAllTimersAsync();
      expect(decode).toHaveBeenCalledTimes(shouldDecode ? 1 : 0);
      expect(postMessage).toHaveBeenCalledTimes(shouldDecode ? 1 : 0);
    }
  },
);

test('contains XHR body inspection failures while delivering load events', async () => {
  const error = new Error('Blob read failed');
  const blob = new Blob([manifest]);
  vi.spyOn(blob, 'text').mockRejectedValue(error);
  const xhr = new XMLHttpRequest();
  Object.assign(xhr, { responseType: 'blob', response: blob });
  const onLoad = vi.fn();
  xhr.addEventListener('load', onLoad);
  xhr.dispatchEvent(new Event('load'));
  expect(onLoad).toHaveBeenCalledOnce();
  await vi.waitFor(() => expect(console.warn).toHaveBeenCalledWith(expect.any(String), error));
  expect(postMessage).not.toHaveBeenCalled();
});

const makeResponse = () =>
  new Response(manifest, { headers: { 'content-type': 'application/dash+xml' } });

test('page fetch returns before inspection finishes', async () => {
  const response = makeResponse();
  const inspection = Promise.withResolvers<Uint8Array>();
  const clone = new Response(
    new ReadableStream({
      async start(controller) {
        controller.enqueue(await inspection.promise);
        controller.close();
      },
    }),
  );
  vi.spyOn(response, 'clone').mockReturnValue(clone);
  nativeFetch.mockResolvedValue(response);
  const options = { credentials: 'include' } satisfies RequestInit;
  expect(await fetch(url, options)).toBe(response);
  expect(nativeFetch).toHaveBeenCalledWith(
    expect.objectContaining({ url, credentials: 'include' }),
  );
  expect(postMessage).not.toHaveBeenCalled();
  expect(await response.text()).toBe(manifest);
  inspection.resolve(new TextEncoder().encode(manifest));
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledOnce());
});

test.each(['clone', 'body', 'message'])(
  'page fetch contains %s inspection failures',
  async (failure) => {
    const response = makeResponse();
    const error = new Error('Inspection failed');
    if (failure === 'clone') {
      vi.spyOn(response, 'clone').mockImplementation(() => {
        throw error;
      });
    } else if (failure === 'body') {
      const clone = new Response(
        new ReadableStream({
          start(controller) {
            controller.error(error);
          },
        }),
      );
      vi.spyOn(response, 'clone').mockReturnValue(clone);
    } else {
      postMessage.mockImplementation(() => {
        throw error;
      });
    }
    nativeFetch.mockResolvedValue(response);
    expect(await fetch(url)).toBe(response);
    expect(await response.text()).toBe(manifest);
    await vi.waitFor(() => expect(console.warn).toHaveBeenCalledWith(expect.any(String), error));
  },
);

test('page fetch preserves network failures', async () => {
  const error = new TypeError('Network failure');
  nativeFetch.mockRejectedValue(error);
  await expect(fetch(url)).rejects.toBe(error);
  expect(console.warn).not.toHaveBeenCalled();
});

test.each(['', '1'])(
  'bounds headerless or understated fetch bodies, Content-Length %j',
  async (contentLength) => {
    const body = manifest + ' '.repeat(2 * 1024 * 1024);
    const response = new Response(body, {
      headers: {
        'content-type': 'application/octet-stream',
        ...(contentLength ? { 'content-length': contentLength } : {}),
      },
    });
    const clone = response.clone();
    const reader = clone.body!.getReader();
    const cancel = vi.spyOn(reader, 'cancel');
    vi.spyOn(clone.body!, 'getReader').mockReturnValue(reader);
    vi.spyOn(response, 'clone').mockReturnValue(clone);
    nativeFetch.mockResolvedValue(response);
    expect(await fetch(url)).toBe(response);
    expect(await response.text()).toBe(body);
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledOnce());
    expect(postMessage).not.toHaveBeenCalled();
  },
);

test.each(['text', 'blob'] as const)(
  'rejects oversized XHR %s before posting or reading blobs',
  async (responseType) => {
    const body = manifest + 'é'.repeat(600_000);
    const blob = new Blob([body]);
    const read = vi.spyOn(blob, 'text');
    const xhr = new XMLHttpRequest();
    Object.assign(xhr, { responseType, response: responseType === 'blob' ? blob : body });
    xhr.dispatchEvent(new Event('load'));
    await Promise.resolve();
    expect(read).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
  },
);

test.each([
  [
    'https://example.com/live',
    'Application/Vnd.Apple.MpegURL; charset=utf-8',
    '#EXTM3U\n#EXTINF:4,\nsegment.ts',
  ],
  ['https://example.com/live', 'audio/x-mpegurl', '#EXTM3U\n#EXTINF:4,\nsegment.ts'],
  ['https://example.com/live', 'text/plain', '#EXTM3U\n#EXTINF:4,\nsegment.ts'],
  [
    'https://example.com/LIVE.M3U8?token=abc',
    'application/unknown',
    '#EXTM3U\n#EXTINF:4,\nsegment.ts',
  ],
  ['https://example.com/video.ism/Manifest', '', '<SmoothStreamingMedia/>'],
  ['https://example.com/live', 'application/vnd.ms-sstr+xml', '<SmoothStreamingMedia/>'],
])(
  'captures XHR stream manifests by MIME type or pathname: %s, %s',
  async (responseURL, type, body) => {
    const xhr = new XMLHttpRequest();
    Object.assign(xhr, { responseURL, headers: `content-type: ${type}\r\n`, response: body });
    xhr.dispatchEvent(new Event('load'));
    await vi.waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ url: responseURL, text: body }),
        }),
        '*',
      ),
    );
  },
);

test('does not forward a media segment with a manifest-looking URL', async () => {
  const xhr = new XMLHttpRequest();
  Object.assign(xhr, {
    responseURL: 'https://example.com/live.m3u8',
    response: 'binary segment data',
  });
  xhr.dispatchEvent(new Event('load'));
  await Promise.resolve();
  expect(postMessage).not.toHaveBeenCalled();
});

test.each([url, new URL(url), new Request(url), '/manifest.mpd'])(
  'preserves the original fetch URL across redirects: %#',
  async (resource) => {
    vi.stubGlobal('document', { baseURI: 'https://example.com/player' });
    const response = makeResponse();
    const finalUrl = 'https://cdn.example/redirected.mpd';
    vi.spyOn(response, 'url', 'get').mockReturnValue(finalUrl);
    const pending = Promise.withResolvers<Response>();
    nativeFetch.mockReturnValue(pending.promise);
    const fetching = fetch(resource);
    // Relative URLs must resolve before the page changes its base during the request.
    vi.stubGlobal('document', { baseURI: 'https://other.example/' });
    pending.resolve(response);
    expect(await fetching).toBe(response);
    await vi.waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({ url: finalUrl, requestUrl: url, text: manifest }),
        }),
        '*',
      ),
    );
  },
);

test('preserves the original XHR URL during redirects and reuse from load handlers', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('document', { baseURI: 'https://example.com/player' });
  const open = vi.spyOn(NativeXHR.prototype, 'open');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/manifest.mpd');
  expect(open).toHaveBeenCalledWith('GET', '/manifest.mpd', true, undefined, undefined);
  const finalUrl = 'https://cdn.example/redirected.mpd';
  Object.assign(xhr, {
    responseURL: finalUrl,
    responseType: 'arraybuffer',
    response: new TextEncoder().encode(manifest).buffer,
  });
  xhr.addEventListener('load', () => xhr.open('GET', '/next.mpd'));
  xhr.dispatchEvent(new Event('load'));
  await vi.runAllTimersAsync();
  expect(postMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      params: expect.objectContaining({ url: finalUrl, requestUrl: url, text: manifest }),
    }),
    '*',
  );
});

test('captures fetch Request headers with init overrides without changing the request', async () => {
  const response = new Response(manifest, { headers: { 'Content-Type': 'application/dash+xml' } });
  Object.defineProperty(response, 'url', { value: url });
  nativeFetch.mockResolvedValue(response);
  const resource = new Request(url, { headers: { Authorization: 'Bearer old' } });
  const options = { headers: new Headers({ Authorization: 'Bearer selected' }) };
  expect(await fetch(resource, options)).toBe(response);
  expect(nativeFetch).toHaveBeenCalledWith(
    expect.objectContaining({ url, headers: new Headers({ Authorization: 'Bearer selected' }) }),
  );
  await vi.waitFor(() =>
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'okova:request-headers',
        url,
        headers: [{ name: 'authorization', value: 'Bearer selected' }],
      }),
      '*',
    ),
  );
});

test('does not forward original fetch credentials after redirects', async () => {
  const response = new Response(manifest, { headers: { 'Content-Type': 'application/dash+xml' } });
  Object.defineProperties(response, { url: { value: url }, redirected: { value: true } });
  nativeFetch.mockResolvedValue(response);
  await fetch(url, { headers: { Authorization: 'Bearer original' } });
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
  expect(postMessage.mock.calls[0]?.[0].namespace).toBe('okova:network');
});

test('captures repeated XHR headers and resets them when the XHR is reused', async () => {
  const setRequestHeader = vi.spyOn(NativeXHR.prototype, 'setRequestHeader');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader('X-Token', 'first');
  xhr.setRequestHeader('X-Token', 'second');
  xhr.send();
  Object.assign(xhr, { response: manifest });
  xhr.dispatchEvent(new Event('load'));
  await vi.waitFor(() =>
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'okova:request-headers',
        headers: [{ name: 'x-token', value: 'first, second' }],
      }),
      '*',
    ),
  );
  expect(setRequestHeader).toHaveBeenCalledTimes(2);
  postMessage.mockClear();
  xhr.open('GET', url);
  xhr.send();
  Object.assign(xhr, { response: manifest });
  xhr.dispatchEvent(new Event('load'));
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(1));
  expect(postMessage.mock.calls[0]?.[0].namespace).toBe('okova:network');
});

test('evaluates getter-backed header records only once', async () => {
  let reads = 0;
  let received: string | null = null;
  const response = new Response(manifest, { headers: { 'Content-Type': 'application/dash+xml' } });
  nativeFetch.mockImplementation(async (resource, options) => {
    received = new Request(resource, options).headers.get('Authorization');
    return response;
  });
  await fetch(url, {
    headers: {
      get Authorization() {
        return `Bearer ${++reads}`;
      },
    },
  });
  expect(reads).toBe(1);
  expect(received).toBe('Bearer 1');
});

test('preserves one-shot header iterables for the native request', async () => {
  const iterator = (function* (): Generator<[string, string]> {
    yield ['Authorization', 'Bearer iterable'];
  })();
  const headers: [string, string][] = [];
  headers[Symbol.iterator] = () => iterator;
  let received: string | null = null;
  nativeFetch.mockImplementation(async (resource, options) => {
    received = new Request(resource, options).headers.get('Authorization');
    return new Response();
  });
  await fetch(url, { headers });
  expect(received).toBe('Bearer iterable');
});

test('normalization preserves POST bodies, credentials and abort signals', async () => {
  const controller = new AbortController();
  const original = new Request(url, {
    method: 'POST',
    body: 'license-request',
    credentials: 'include',
    signal: controller.signal,
  });
  nativeFetch.mockImplementation(async (resource, options) => {
    const request = new Request(resource, options);
    expect(request.method).toBe('POST');
    expect(request.credentials).toBe('include');
    expect(await request.text()).toBe('license-request');
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    return new Response();
  });
  await fetch(original);
  expect(original.bodyUsed).toBe(true);
  expect(postMessage).not.toHaveBeenCalled();
});

test.each([
  ['Cookie', 'ignored-cookie'],
  ['cOoKiE', 'ignored-cookie'],
  ['Origin', 'https://ignored.example'],
  ['Referer', 'https://ignored.example'],
  ['Sec-Custom', 'ignored'],
  ['Proxy-Custom', 'ignored'],
  ['X-HTTP-Method-Override', 'GET, TRACE'],
])('does not export ignored XHR header %s', async (name, value) => {
  const native = vi.spyOn(NativeXHR.prototype, 'setRequestHeader');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader(name, value);
  xhr.setRequestHeader('Authorization', 'Bearer permitted');
  xhr.setRequestHeader('X-HTTP-Method', 'PATCH');
  xhr.send();
  Object.assign(xhr, { response: manifest });
  xhr.dispatchEvent(new Event('load'));
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledTimes(2));
  expect(native).toHaveBeenCalledWith(name, value);
  const message = postMessage.mock.calls.find(
    ([message]) => message.namespace === 'okova:request-headers',
  )?.[0];
  const observed = pageRequestHeadersSchema.parse(message);
  expect(observed.headers).toEqual([
    { name: 'authorization', value: 'Bearer permitted' },
    { name: 'x-http-method', value: 'PATCH' },
  ]);
  const command = buildDownloadCommand({ id: 'id', value: 'key', mpd: url }, url, observed.headers);
  expect(command).not.toContain(value);
  expect(command).toContain('authorization: Bearer permitted');
});

test.each([
  { transport: 'fetch', redirected: false },
  { transport: 'XHR', redirected: false },
  { transport: 'fetch', redirected: true },
  { transport: 'XHR', redirected: true },
])(
  'correlates fragment URLs for $transport, redirected=$redirected',
  async ({ transport, redirected }) => {
    const networkUrl = 'https://example.com/playback?token=a%23b';
    const requestUrl = `${networkUrl}#variant`;
    const responseUrl = redirected ? `${networkUrl}&redirected=1` : networkUrl;
    if (transport === 'fetch') {
      const response = new Response(manifest, {
        headers: { 'Content-Type': 'application/dash+xml' },
      });
      Object.defineProperties(response, {
        url: { value: responseUrl },
        redirected: { value: redirected },
      });
      nativeFetch.mockResolvedValue(response);
      await fetch(requestUrl, { headers: { Authorization: 'Bearer fragment' } });
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', requestUrl);
      xhr.setRequestHeader('Authorization', 'Bearer fragment');
      xhr.send();
      Object.assign(xhr, { response: manifest, responseURL: responseUrl });
      xhr.dispatchEvent(new Event('load'));
    }
    await vi.waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ namespace: 'okova:network' }),
        '*',
      ),
    );
    const observations = postMessage.mock.calls
      .filter(([message]) => message.namespace === 'okova:request-headers')
      .map(([message]) => pageRequestHeadersSchema.parse(message));
    expect(observations).toEqual(
      redirected
        ? []
        : [
            expect.objectContaining({
              url: networkUrl,
              headers: [{ name: 'authorization', value: 'Bearer fragment' }],
            }),
          ],
    );
  },
);
