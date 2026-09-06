import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { installBootstrap } from '../src/extension/entrypoints/bootstrap.content';
import { sendDrmMessage } from '../src/extension/utils/drm-bridge';

vi.mock('../src/extension/utils/drm-bridge', () => ({ sendDrmMessage: vi.fn() }));
vi.mock('../src/extension/utils/manifest-inspection', () => ({
  installManifestInspection: vi.fn(),
}));
vi.mock('../src/extension/utils/network-interception', () => ({
  installNetworkInterception: vi.fn(),
}));
const native = vi.fn();
const patched = vi.fn();
const installer = vi.fn(() => {
  expect(navigator.requestMediaKeySystemAccess).toBe(native);
  navigator.requestMediaKeySystemAccess = patched;
  return () => undefined;
});
const settings = {
  emeInterception: true,
  spoofing: true,
  clientPlayback: true,
  requestInterception: false,
};

beforeEach(() => {
  vi.stubGlobal('navigator', { requestMediaKeySystemAccess: native });
  vi.stubGlobal('window', {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.mocked(sendDrmMessage).mockImplementation(async (message) => {
    if (message.action === 'startup-settings') return settings;
    if (message.action === 'load-eme' && typeof message.token === 'string') {
      return window.__okovaStartEme?.(message.token, installer);
    }
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

test('does not load EME code on pages without DRM requests', async () => {
  await installBootstrap();
  expect(sendDrmMessage).toHaveBeenCalledExactlyOnceWith({ action: 'startup-settings' }, 3_000);
  expect(installer).not.toHaveBeenCalled();
});

test('loads once for concurrent early requests and retains cached forwarding', async () => {
  const pending = Promise.withResolvers<unknown>();
  vi.mocked(sendDrmMessage).mockReturnValueOnce(pending.promise);
  const configured = installBootstrap();
  const cached = navigator.requestMediaKeySystemAccess.bind(navigator);
  const first = cached('org.w3.clearkey', []);
  const second = cached('org.w3.clearkey', []);
  expect(native).not.toHaveBeenCalled();
  expect(patched).not.toHaveBeenCalled();
  pending.resolve(settings);
  await configured;
  await Promise.all([first, second]);
  await cached('org.w3.clearkey', []);
  expect(installer).toHaveBeenCalledExactlyOnceWith(true);
  expect(patched).toHaveBeenCalledTimes(3);
  expect(sendDrmMessage).toHaveBeenCalledTimes(2);
});

test.each([new Error('Storage unavailable'), new Error('Startup timeout'), null])(
  'falls back to native playback on settings failure: %s',
  async (failure) => {
    vi.mocked(sendDrmMessage).mockImplementation(() =>
      failure ? Promise.reject(failure) : Promise.resolve(null),
    );
    const configured = installBootstrap();
    const access = navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
    await configured;
    await access;
    expect(native).toHaveBeenCalledOnce();
    expect(installer).not.toHaveBeenCalled();
    expect(navigator.requestMediaKeySystemAccess).toBe(native);
  },
);

test('does not load EME code when disabled', async () => {
  vi.mocked(sendDrmMessage).mockResolvedValue({ ...settings, emeInterception: false });
  await installBootstrap();
  await navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
  expect(native).toHaveBeenCalledOnce();
  expect(installer).not.toHaveBeenCalled();
  expect(sendDrmMessage).toHaveBeenCalledOnce();
});

test('ignores late installation after a timeout and tokens from other documents', async () => {
  let token = '';
  vi.mocked(sendDrmMessage).mockImplementation(async (message) => {
    if (message.action === 'startup-settings') return settings;
    token = String(message.token);
    expect(window.__okovaStartEme?.('other-document', installer)).toBe(false);
    throw new Error('Timed out');
  });
  await installBootstrap();
  await navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
  expect(window.__okovaStartEme?.(token, installer)).toBe(false);
  expect(installer).not.toHaveBeenCalled();
  expect(native).toHaveBeenCalledOnce();
});

test.each(['missing acknowledgement', 'installer throws'])(
  'restores native playback when %s',
  async (failure) => {
    if (failure === 'installer throws')
      installer.mockImplementation(() => {
        throw new Error('Install failed');
      });
    else vi.mocked(sendDrmMessage).mockResolvedValueOnce(settings).mockResolvedValueOnce(false);
    await installBootstrap();
    await navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
    expect(native).toHaveBeenCalledOnce();
    expect(navigator.requestMediaKeySystemAccess).toBe(native);
    expect(console.warn).toHaveBeenCalled();
  },
);

test.each(['installer throws', 'acknowledgement lost'])(
  'restores event-handler descriptors after partial installation: %s',
  async (failure) => {
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
      if (failure === 'installer throws') throw new Error('Partial installation');
      return () => undefined;
    });
    vi.mocked(sendDrmMessage).mockImplementation(async (message) => {
      if (message.action === 'startup-settings') return settings;
      window.__okovaStartEme?.(String(message.token), installer);
      throw new Error('Acknowledgement lost');
    });
    await installBootstrap();
    await navigator.requestMediaKeySystemAccess('org.w3.clearkey', []);
    expect(installer).toHaveBeenCalledOnce();
    expect(Object.getOwnPropertyDescriptor(prototype, 'onmessage')).toEqual(originalDescriptor);
    expect(Object.hasOwn(prototype, 'onkeystatuseschange')).toBe(false);
    expect(navigator.requestMediaKeySystemAccess).toBe(native);
  },
);
