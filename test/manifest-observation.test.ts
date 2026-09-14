import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { installManifestObservation } from '../src/extension/utils/manifest-observation';

beforeEach(() => fakeBrowser.reset());
afterEach(() => vi.restoreAllMocks());

test('manifest messages require a browser response in the same frame and document', () => {
  const listener = vi
    .spyOn(browser.webRequest.onHeadersReceived, 'addListener')
    .mockImplementation(() => {});
  const navigation = vi.spyOn(browser.webNavigation.onCommitted, 'addListener');
  const accepts = installManifestObservation();
  const observe = listener.mock.calls[0]![0];
  const source = { url: 'https://example.test/watch', tabId: 1, frameId: 0, documentId: 'a' };
  const url = 'https://example.test/movie.mpd';
  expect(accepts(source, url)).toBe(false);
  const response: Browser.webRequest.OnHeadersReceivedDetails = {
    requestId: 'request',
    url,
    method: 'GET',
    tabId: 1,
    frameId: 0,
    parentFrameId: -1,
    type: 'xmlhttprequest',
    timeStamp: 1,
    statusCode: 200,
    statusLine: 'HTTP/1.1 200 OK',
    documentId: 'a',
    documentLifecycle: 'active',
    frameType: 'outermost_frame',
  };
  observe(response);
  expect(accepts(source, url)).toBe(true);
  expect(accepts({ ...source, documentId: 'b' }, url)).toBe(false);
  expect(accepts({ ...source, frameId: 1 }, url)).toBe(false);
  expect(accepts(source, `${url}?forged`)).toBe(false);
  navigation.mock.calls[0]![0]({
    tabId: 1,
    frameId: 0,
    url: source.url,
    timeStamp: 2,
    transitionType: 'link',
    transitionQualifiers: [],
    documentId: 'b',
    documentLifecycle: 'active',
    frameType: 'outermost_frame',
    parentFrameId: -1,
    processId: 1,
  });
  expect(accepts(source, url)).toBe(false);
});
