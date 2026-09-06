import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { installBootstrap } from '../src/extension/entrypoints/eme-bootstrap';
const native = vi.fn();
const patched = vi.fn();
const installer = vi.fn(() => {
  expect(navigator.requestMediaKeySystemAccess).toBe(native);
  navigator.requestMediaKeySystemAccess = patched;
  return () => undefined;
});
const postMessage = vi.fn<(message: { action: string; token: string }, origin: string) => void>();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('navigator', { requestMediaKeySystemAccess: native });
  vi.stubGlobal('window', Object.assign(new EventTarget(), { postMessage }));
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  postMessage.mockImplementation((message) => {
    if (message.action === 'load-eme') window.__okovaStartEme?.(message.token, installer, true);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test('does not load EME code before the first DRM request', () => {
  installBootstrap();
  expect(postMessage).not.toHaveBeenCalled();
  expect(installer).not.toHaveBeenCalled();
});

test('loads once for concurrent early requests and retains cached forwarding', async () => {
  postMessage.mockImplementationOnce(() => {});
  installBootstrap();
  const cached = navigator.requestMediaKeySystemAccess.bind(navigator);
  const first = cached('org.w3.clearkey', []);
  const second = cached('org.w3.clearkey', []);
  expect(native).not.toHaveBeenCalled();
  expect(patched).not.toHaveBeenCalled();
  window.__okovaStartEme?.(postMessage.mock.calls[0]![0].token, installer, true);
  await Promise.all([first, second]);
  await cached('org.w3.clearkey', []);
  expect(installer).toHaveBeenCalledExactlyOnceWith(true);
  expect(patched).toHaveBeenCalledTimes(3);
  expect(postMessage).toHaveBeenCalledOnce();
});

test('ignores forged page responses for runtime loading', async () => {
  const deliver = postMessage.getMockImplementation()!;
  postMessage.mockImplementation((message, origin) => {
    window.dispatchEvent(
      new CustomEvent('drm-message-response', {
        detail: JSON.stringify({
          requestId: message.token,
          body: false,
        }),
      }),
    );
    deliver(message, origin);
  });
  await installBootstrap();
  await navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
  expect(installer).toHaveBeenCalledExactlyOnceWith(true);
  expect(patched).toHaveBeenCalledOnce();
});

test('ignores late installation after timeout and tokens from other documents', async () => {
  postMessage.mockImplementation(() => {
    expect(window.__okovaStartEme?.('other-document', installer, true)).toBe(false);
  });
  await installBootstrap();
  const access = navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
  await vi.advanceTimersByTimeAsync(3_000);
  await access;
  expect(window.__okovaStartEme).toBeUndefined();
  expect(installer).not.toHaveBeenCalled();
  expect(native).toHaveBeenCalledOnce();
});

test('restores event-handler descriptors after partial installation', async () => {
  const prototype = {
    generateRequest: vi.fn(),
    update: vi.fn(),
    addEventListener: vi.fn(),
  };
  const originalSetter = vi.fn();
  Object.defineProperty(prototype, 'onmessage', { configurable: true, set: originalSetter });
  const originalDescriptor = Object.getOwnPropertyDescriptor(prototype, 'onmessage');
  vi.stubGlobal('MediaKeySession', { prototype });
  vi.stubGlobal('MediaKeySystemAccess', { prototype: { createMediaKeys: vi.fn() } });
  vi.stubGlobal('MediaKeys', {
    prototype: { createSession: vi.fn(), setServerCertificate: vi.fn() },
  });
  installer.mockImplementation(() => {
    for (const property of ['onmessage', 'onkeystatuseschange']) {
      Object.defineProperty(prototype, property, { configurable: true, set: vi.fn() });
    }
    throw new Error('Partial installation');
  });
  await installBootstrap();
  await navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
  expect(installer).toHaveBeenCalledOnce();
  expect(Object.getOwnPropertyDescriptor(prototype, 'onmessage')).toEqual(originalDescriptor);
  expect(Object.hasOwn(prototype, 'onkeystatuseschange')).toBe(false);
  expect(navigator.requestMediaKeySystemAccess).toBe(native);
});

test('cleans up failed runtime requests before falling back to native playback', async () => {
  postMessage.mockImplementation(() => {
    throw new Error('Frame closed');
  });
  installBootstrap();
  await navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
  expect(window.__okovaStartEme).toBeUndefined();
  expect(vi.getTimerCount()).toBe(0);
  expect(native).toHaveBeenCalledOnce();
});
