import { afterEach, expect, test, vi } from 'vitest';
import eme from '../src/extension/entrypoints/eme';
import { sendDrmMessage } from '../src/extension/utils/drm-bridge';

vi.mock('../src/extension/utils/drm-bridge', () => ({ sendDrmMessage: vi.fn() }));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test.each(['captured keys', 'rejected license', 'bridge failure'])(
  'passes the original response to native update after %s',
  async (result) => {
    vi.useFakeTimers();
    const nativeUpdate = vi.fn<(response: BufferSource) => Promise<void>>().mockResolvedValue();
    class NativeSession extends EventTarget {
      sessionId = 'native-session';
      keyStatuses = new Map();
      update(response: BufferSource) {
        return nativeUpdate.call(this, response);
      }
      async generateRequest() {}
    }
    class NativeKeys {
      createSession() {
        return new NativeSession();
      }
      async setServerCertificate() {
        return true;
      }
    }
    vi.stubGlobal('MediaKeySession', NativeSession);
    vi.stubGlobal('MediaKeys', NativeKeys);
    vi.stubGlobal('window', { MPD_LIST: new Map() });
    const capture = Promise.withResolvers<unknown>();
    vi.mocked(sendDrmMessage).mockReturnValue(capture.promise);
    eme.main();

    const session = new NativeSession();
    const response = new Uint8Array([8, 2]);
    const updating = session.update(response);
    await Promise.resolve();
    expect(sendDrmMessage).toHaveBeenCalledWith(expect.objectContaining({ action: 'update' }));
    expect(nativeUpdate).not.toHaveBeenCalled();

    if (result === 'captured keys') {
      capture.resolve({
        keys: [
          { id: '00112233445566778899aabbccddeeff', value: 'ffeeddccbbaa99887766554433221100' },
        ],
      });
    } else if (result === 'bridge failure') {
      capture.reject(new Error('DRM bridge failed'));
    } else {
      capture.resolve(undefined);
    }

    await expect(updating).resolves.toBeUndefined();
    expect(nativeUpdate).toHaveBeenCalledExactlyOnceWith(response);
    expect(nativeUpdate.mock.calls[0]?.[0]).toBe(response);
    expect(nativeUpdate.mock.contexts[0]).toBe(session);
    await vi.runAllTimersAsync();
  },
);

test('uses distinct tokens despite empty native IDs and waits for background creation', async () => {
  class NativeSession extends EventTarget {
    sessionId = '';
    closedResult = Promise.withResolvers<MediaKeySessionClosedReason>();
    closed = this.closedResult.promise;
    keyStatuses = new Map();
    async generateRequest(type: string, data: BufferSource) {
      expect(type).toBe('cenc');
      expect(data).toBeInstanceOf(Uint8Array);
    }
    async update(response: BufferSource) {
      expect(response).toBeInstanceOf(Uint8Array);
    }
  }
  class NativeKeys {
    createSession() {
      return new NativeSession();
    }
    async setServerCertificate() {
      return true;
    }
  }
  vi.stubGlobal('MediaKeySession', NativeSession);
  vi.stubGlobal('MediaKeys', NativeKeys);
  vi.stubGlobal('window', { MPD_LIST: new Map() });
  const creations = [Promise.withResolvers<unknown>(), Promise.withResolvers<unknown>()];
  let creationIndex = 0;
  vi.mocked(sendDrmMessage).mockImplementation(async (message) => {
    if (message.action === 'generateRequest') return creations[creationIndex++]!.promise;
    if (message.action === 'license-request') return btoa('challenge');
    if (message.action === 'update') return { keys: [] };
  });
  eme.main();

  const first = new NativeSession();
  const second = new NativeSession();
  const initData = new TextEncoder().encode('same pssh');
  const generating = [
    first.generateRequest('cenc', initData),
    second.generateRequest('cenc', initData),
  ];
  await Promise.resolve();
  const tokens = vi.mocked(sendDrmMessage).mock.calls.map(([message]) => message.sessionToken);
  expect(tokens).toHaveLength(2);
  expect(tokens[0]).toEqual(expect.any(String));
  expect(tokens[1]).not.toBe(tokens[0]);

  const handled = Promise.withResolvers<void>();
  first.addEventListener('message', () => handled.resolve());
  first.dispatchEvent(
    Object.assign(new Event('message'), {
      messageType: 'license-request',
      message: initData.buffer,
    }),
  );
  await Promise.resolve();
  expect(sendDrmMessage).toHaveBeenCalledTimes(2);
  creations[1]!.resolve(undefined);
  await generating[1];
  expect(sendDrmMessage).toHaveBeenCalledTimes(2);
  creations[0]!.resolve(undefined);
  await Promise.all([generating[0], handled.promise]);
  expect(sendDrmMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: 'license-request',
      sessionToken: tokens[0],
    }),
  );

  await second.update(initData);
  expect(sendDrmMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: 'update',
      sessionToken: tokens[1],
    }),
  );
  first.closedResult.resolve('closed-by-application');
  await first.closed;
  await Promise.resolve();
  expect(sendDrmMessage).toHaveBeenLastCalledWith({ action: 'close', sessionToken: tokens[0] });
});

test('associates accepted certificate views with MediaKeys and preserves certificate requests', async () => {
  const nativeSetCertificate = vi
    .fn<(certificate: BufferSource) => Promise<boolean>>()
    .mockResolvedValue(true);
  class NativeSession extends EventTarget {
    sessionId = '';
    closed = new Promise<MediaKeySessionClosedReason>(() => {});
    keyStatuses = new Map();
    async generateRequest(type: string, data: BufferSource) {
      expect(type).toBe('cenc');
      expect(data).toBeInstanceOf(Uint8Array);
    }
    async update(response: BufferSource) {
      expect(response).toBeInstanceOf(Uint8Array);
    }
  }
  class NativeKeys {
    createSession() {
      return new NativeSession();
    }
    setServerCertificate(certificate: BufferSource) {
      return nativeSetCertificate(certificate);
    }
  }
  vi.stubGlobal('MediaKeySession', NativeSession);
  vi.stubGlobal('MediaKeys', NativeKeys);
  vi.stubGlobal('window', { MPD_LIST: new Map() });
  vi.mocked(sendDrmMessage).mockImplementation(async (message) => {
    if (message.action === 'license-request') return btoa('encrypted challenge');
  });
  eme.main();

  const keys = new NativeKeys();
  const session = keys.createSession();
  const certificate = new DataView(new Uint8Array([99, 1, 2, 3, 99]).buffer, 1, 3);
  await expect(keys.setServerCertificate(certificate)).resolves.toBe(true);
  expect(nativeSetCertificate).toHaveBeenCalledWith(certificate);
  const initData = new Uint8Array([1]);
  await session.generateRequest('cenc', initData);
  expect(sendDrmMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: 'generateRequest',
      serverCertificate: btoa('\x01\x02\x03'),
    }),
  );
  await new NativeKeys().createSession().generateRequest('cenc', initData);
  expect(sendDrmMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: 'generateRequest',
      serverCertificate: undefined,
    }),
  );

  nativeSetCertificate.mockResolvedValueOnce(false);
  await expect(keys.setServerCertificate(new Uint8Array([4]))).resolves.toBe(false);
  nativeSetCertificate.mockRejectedValueOnce(new Error('Invalid certificate'));
  await expect(keys.setServerCertificate(new Uint8Array([5]))).rejects.toThrow(
    'Invalid certificate',
  );
  const sibling = keys.createSession();
  await sibling.generateRequest('cenc', initData);
  expect(sendDrmMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({
      serverCertificate: btoa('\x01\x02\x03'),
    }),
  );

  const certificateRequest = Object.assign(new Event('message'), {
    messageType: 'license-request',
    message: new Uint8Array([8, 4]).buffer,
  });
  const received = Promise.withResolvers<Event>();
  session.addEventListener('message', received.resolve);
  const callCount = vi.mocked(sendDrmMessage).mock.calls.length;
  session.dispatchEvent(certificateRequest);
  expect(await received.promise).toBe(certificateRequest);
  expect(sendDrmMessage).toHaveBeenCalledTimes(callCount);

  await keys.setServerCertificate(new Uint8Array([6]));
  const handled = Promise.withResolvers<void>();
  sibling.addEventListener('message', () => handled.resolve());
  sibling.dispatchEvent(
    Object.assign(new Event('message'), {
      messageType: 'license-request',
      message: new Uint8Array([8, 1, 2]).buffer,
    }),
  );
  await handled.promise;
  expect(sendDrmMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({
      action: 'license-request',
      serverCertificate: btoa('\x06'),
    }),
  );
});
