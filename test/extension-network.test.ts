import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import network from '../src/extension/entrypoints/network';

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
  open() {}
  send() {
    this.response = '';
  }
}

beforeEach(() => {
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal('Worker', class {});
  vi.stubGlobal('XMLHttpRequest', NativeXHR);
  vi.stubGlobal('XMLSerializer', XMLSerializer);
  vi.stubGlobal('postMessage', postMessage);
  vi.stubGlobal('fetch', nativeFetch);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  network.main();
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
  expect(nativeFetch).toHaveBeenCalledWith(url, options);
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
