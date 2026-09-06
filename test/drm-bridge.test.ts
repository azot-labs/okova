import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser } from 'wxt/browser';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import content from '../src/extension/entrypoints/content';
import { appStorage, type Settings } from '../src/extension/utils/storage';
import { sendDrmMessage } from '../src/extension/utils/drm-bridge';

vi.mock('../src/extension/utils/storage', () => ({
  appStorage: { settings: { getValue: vi.fn<() => Promise<Partial<Settings>>>() } },
}));

const postMessage = vi.fn<(message: { requestId: string }, origin: string) => void>();
const sendMessage = vi.fn<(message: unknown) => Promise<unknown>>();

beforeEach(() => {
  vi.mocked(appStorage.settings.getValue).mockResolvedValue(null);
  vi.useFakeTimers();
  vi.stubGlobal(
    'window',
    Object.assign(new EventTarget(), {
      postMessage,
      location: { href: 'https://example.com/video' },
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const respond = (requestId: string, body?: unknown) => {
  window.dispatchEvent(
    new CustomEvent('drm-message-response', { detail: JSON.stringify({ requestId, body }) }),
  );
};

test('matches concurrent requests to their own out-of-order responses and cleans up', async () => {
  const removeListener = vi.spyOn(window, 'removeEventListener');
  const onFirst = vi.fn();
  const onSecond = vi.fn();
  const first = sendDrmMessage({ action: 'license-request' }).then(onFirst);
  const second = sendDrmMessage({ action: 'license-request' }).then(onSecond);
  const acknowledgement = sendDrmMessage({ action: 'generateRequest' });
  const firstId = postMessage.mock.calls[0]![0].requestId;
  const secondId = postMessage.mock.calls[1]![0].requestId;
  const acknowledgementId = postMessage.mock.calls[2]![0].requestId;
  expect(new Set([firstId, secondId, acknowledgementId]).size).toBe(3);

  for (const detail of ['legacy response', 'null', '42', '{}', { requestId: firstId }]) {
    window.dispatchEvent(new CustomEvent('drm-message-response', { detail }));
  }
  respond('unknown-request', 'unrelated response');
  respond(acknowledgementId);
  await expect(acknowledgement).resolves.toBeUndefined();
  expect(onFirst).not.toHaveBeenCalled();
  expect(onSecond).not.toHaveBeenCalled();

  respond(secondId, 'second challenge');
  await second;
  expect(onSecond).toHaveBeenCalledExactlyOnceWith('second challenge');
  expect(onFirst).not.toHaveBeenCalled();

  respond(secondId, 'duplicate response');
  respond(firstId, 'first challenge');
  await first;
  expect(onFirst).toHaveBeenCalledExactlyOnceWith('first challenge');
  expect(removeListener).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});

test('registers the response listener before posting the request', async () => {
  postMessage.mockImplementation(({ requestId }) => respond(requestId, 'challenge'));
  await expect(sendDrmMessage({ action: 'license-request' })).resolves.toBe('challenge');
  expect(vi.getTimerCount()).toBe(0);
});

test('times out and removes the listener without affecting a later request', async () => {
  const removeListener = vi.spyOn(window, 'removeEventListener');
  const request = sendDrmMessage({ action: 'license-request' });
  const timedOutId = postMessage.mock.calls[0]![0].requestId;
  const rejected = expect(request).rejects.toThrow('Timed out waiting for DRM response');
  await vi.advanceTimersByTimeAsync(30_000);
  await rejected;
  expect(removeListener).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);

  const onResponse = vi.fn();
  const next = sendDrmMessage({ action: 'license-request' }).then(onResponse);
  respond(timedOutId, 'late response');
  await Promise.resolve();
  expect(onResponse).not.toHaveBeenCalled();
  respond(postMessage.mock.calls[1]![0].requestId, 'next challenge');
  await next;
  expect(onResponse).toHaveBeenCalledExactlyOnceWith('next challenge');
});

test('cleans up when posting the request throws', async () => {
  const removeListener = vi.spyOn(window, 'removeEventListener');
  postMessage.mockImplementation(() => {
    throw new Error('Unable to clone message');
  });
  await expect(sendDrmMessage({ action: 'update' })).rejects.toThrow('Unable to clone message');
  expect(removeListener).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

const startContentBridge = async () => {
  vi.spyOn(browser.runtime, 'sendMessage').mockImplementation(sendMessage);
  vi.spyOn(browser.runtime, 'getURL').mockImplementation((path) => path);
  vi.stubGlobal('document', {
    createElement: () => ({ remove: vi.fn() }),
    head: { appendChild: (element: { onload: () => void }) => element.onload() },
  });
  await content.main({} as ContentScriptContext);
  postMessage.mockImplementation((data) => {
    // Node's MessageEvent requires a MessagePort source, so attach the page window separately.
    const event = new MessageEvent('message', { data });
    Object.defineProperty(event, 'source', { value: window });
    window.dispatchEvent(event);
  });
};

test('content bridge preserves request IDs for acknowledgements and license responses', async () => {
  await startContentBridge();
  const licenseResponse = Promise.withResolvers<unknown>();
  sendMessage.mockReturnValueOnce(licenseResponse.promise).mockResolvedValueOnce(undefined);

  const onLicense = vi.fn();
  const license = sendDrmMessage({ action: 'license-request' }).then(onLicense);
  await expect(sendDrmMessage({ action: 'generateRequest' })).resolves.toBeUndefined();
  expect(onLicense).not.toHaveBeenCalled();
  expect(sendMessage).toHaveBeenNthCalledWith(1, {
    action: 'license-request',
    url: 'https://example.com/video',
  });

  licenseResponse.resolve('license challenge');
  await license;
  expect(onLicense).toHaveBeenCalledExactlyOnceWith('license challenge');
  expect(vi.getTimerCount()).toBe(0);
});

test('content bridge correlates runtime errors and the request cleans up', async () => {
  await startContentBridge();
  const onResponse = vi.fn();
  window.addEventListener('drm-message-response', onResponse);
  const removeListener = vi.spyOn(window, 'removeEventListener');
  sendMessage.mockRejectedValueOnce(new Error('Extension context invalidated'));
  await expect(sendDrmMessage({ action: 'update' })).rejects.toThrow(
    'Extension context invalidated',
  );
  const response = onResponse.mock.calls[0]![0] as CustomEvent<unknown>;
  expect(typeof response.detail).toBe('string');
  expect(removeListener).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

test.each([undefined, 'license challenge', { keys: [{ id: 'key-id', value: 'key-value' }] }])(
  'content bridge sends string-only event detail and preserves body %j',
  async (body) => {
    await startContentBridge();
    const onResponse = vi.fn();
    window.addEventListener('drm-message-response', onResponse);
    sendMessage.mockResolvedValueOnce(body);

    await expect(sendDrmMessage({ action: 'update' })).resolves.toEqual(body);
    const response = onResponse.mock.calls[0]![0] as CustomEvent<unknown>;
    expect(typeof response.detail).toBe('string');
    expect(vi.getTimerCount()).toBe(0);
  },
);

test('registers the bridge before loading scripts and waits for manifest initialization', async () => {
  vi.mocked(appStorage.settings.getValue).mockResolvedValue({
    emeInterception: true,
    spoofing: true,
    clientPlayback: true,
    requestInterception: true,
    theme: 'auto',
  });
  vi.spyOn(browser.runtime, 'getURL').mockImplementation((path) => path);
  const listen = vi.spyOn(window, 'addEventListener');
  const scripts: { src: string; onload: () => void; remove: () => void }[] = [];
  vi.stubGlobal('document', {
    createElement: () => ({ remove: vi.fn() }),
    head: {
      appendChild: (element: (typeof scripts)[number]) => {
        expect(listen).toHaveBeenCalledWith('message', expect.any(Function), false);
        scripts.push(element);
      },
    },
  });
  const starting = content.main({} as ContentScriptContext);
  await vi.waitFor(() => expect(scripts).toHaveLength(1));
  expect(scripts[0]?.src).toBe('/manifest.js');
  scripts[0]?.onload();
  await vi.waitFor(() => expect(scripts).toHaveLength(3));
  expect(scripts.map((script) => script.src)).toEqual([
    '/manifest.js',
    '/network.js',
    '/eme-playback.js',
  ]);
  scripts[1]?.onload();
  scripts[2]?.onload();
  await starting;
  for (const script of scripts) expect(script.remove).toHaveBeenCalledOnce();
});

test('reports script load failures and removes the failed element', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const remove = vi.fn();
  vi.stubGlobal('document', {
    createElement: () => ({ remove }),
    head: { appendChild: (element: { onerror: () => void }) => element.onerror() },
  });
  await content.main({} as ContentScriptContext);
  expect(warn).toHaveBeenCalledWith(
    '[okova] Script injection failed',
    expect.objectContaining({ message: 'Failed to inject /manifest.js' }),
  );
  expect(remove).toHaveBeenCalledOnce();
});
