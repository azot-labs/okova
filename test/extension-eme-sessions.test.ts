import { afterEach, expect, test, vi } from 'vitest';
import eme from '../src/extension/entrypoints/eme';
import { sendDrmMessage } from '../src/extension/utils/drm-bridge';

vi.mock('../src/extension/utils/drm-bridge', () => ({ sendDrmMessage: vi.fn() }));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

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
