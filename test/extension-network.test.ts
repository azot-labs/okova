import { runInNewContext } from 'node:vm';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import network from '../src/extension/entrypoints/network';

const manifest = '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"/>';
const url = 'https://example.com/manifest.mpd';
const postMessage = vi.fn();
const nativeFetch = vi.fn<typeof fetch>();
const nativeCreateObjectURL = vi.fn<typeof URL.createObjectURL>();

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
  // Restore the object URL patch after each test.
  vi.spyOn(URL, 'createObjectURL').mockImplementation(nativeCreateObjectURL);
  network.main();
});

afterEach(() => {
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
        method: 'response',
        params: { url, text: manifest, headers: { 'content-type': 'application/dash+xml' } },
      }),
      '*',
    );
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

// Execute the actual generated blob worker script with Node's real fetch body types.
const useWorkerFetch = async () => {
  let workerBlob: Blob | undefined;
  const patchedCreateObjectURL = URL.createObjectURL;
  nativeCreateObjectURL.mockImplementation((blob) => {
    if (blob instanceof Blob) workerBlob = blob;
    return 'blob:test';
  });
  patchedCreateObjectURL(new Blob([''], { type: 'text/javascript' }));
  if (!workerBlob) throw new Error('Worker script was not generated');
  class WorkerGlobalScope {
    postMessage = postMessage;
  }
  const context = { fetch: nativeFetch, console, WorkerGlobalScope, self: new WorkerGlobalScope() };
  runInNewContext(await workerBlob.text(), context);
  vi.stubGlobal('fetch', context.fetch);
};

test.each(['page', 'worker'])('%s fetch returns before inspection finishes', async (context) => {
  if (context === 'worker') await useWorkerFetch();
  const response = makeResponse();
  const inspection = Promise.withResolvers<string>();
  const clone = response.clone();
  vi.spyOn(clone, 'text').mockReturnValue(inspection.promise);
  vi.spyOn(response, 'clone').mockReturnValue(clone);
  nativeFetch.mockResolvedValue(response);
  const options = { credentials: 'include' } satisfies RequestInit;
  expect(await fetch(url, options)).toBe(response);
  expect(nativeFetch).toHaveBeenCalledWith(url, options);
  expect(postMessage).not.toHaveBeenCalled();
  expect(await response.text()).toBe(manifest);
  inspection.resolve(manifest);
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledOnce());
});

test.each([
  ['page', 'clone'],
  ['page', 'body'],
  ['page', 'message'],
  ['worker', 'clone'],
  ['worker', 'body'],
  ['worker', 'message'],
])('%s fetch contains %s inspection failures', async (context, failure) => {
  if (context === 'worker') await useWorkerFetch();
  const response = makeResponse();
  const error = new Error('Inspection failed');
  if (failure === 'clone') {
    vi.spyOn(response, 'clone').mockImplementation(() => {
      throw error;
    });
  } else if (failure === 'body') {
    const clone = response.clone();
    vi.spyOn(clone, 'text').mockRejectedValue(error);
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
});

test.each(['page', 'worker'])('%s fetch preserves network failures', async (context) => {
  if (context === 'worker') await useWorkerFetch();
  const error = new TypeError('Network failure');
  nativeFetch.mockRejectedValue(error);
  await expect(fetch(url)).rejects.toBe(error);
  expect(console.warn).not.toHaveBeenCalled();
});
