import { afterEach, expect, test, vi } from 'vitest';
import { Remote, Session } from '../src/lib';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test('remote session update surfaces backend JSON errors', async () => {
  const fetch = vi.fn(async (url: string | URL | Request) => {
    const route = String(url);
    if (route.endsWith('/sessions')) {
      return new Response(JSON.stringify({ id: 'session-1' }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    if (route.endsWith('/sessions/session-1/update')) {
      return new Response(JSON.stringify({ error: 'Failed to update remote CDM session' }), {
        status: 502,
        statusText: 'Bad Gateway',
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetch);

  const cdm = new Remote({
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://remote.example',
  });
  const session = await cdm.createSession();

  await expect(session.update(new Uint8Array([1, 2, 3]))).rejects.toThrow(
    '502 Bad Gateway: Failed to update remote CDM session',
  );
});

test('remote requests time out', async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason ?? new Error('Aborted')),
            { once: true },
          );
        }),
    ),
  );

  const cdm = new Remote({
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://remote.example',
    requestTimeoutMs: 100,
  });

  const expectation = expect(cdm.createSession()).rejects.toThrow(
    'Remote CDM request timed out after 100ms',
  );
  await vi.advanceTimersByTimeAsync(100);
  await expectation;
});

test.each(['close', 'remove'] as const)(
  'remote %s clears local keys and rejects later work',
  async (operation) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request) => {
        const route = String(url);
        const body = route.endsWith('/sessions')
          ? { id: 'session-close' }
          : route.endsWith('/update')
            ? { keys: { '00112233445566778899aabbccddeeff': 'ffeeddccbbaa99887766554433221100' } }
            : { success: true };
        return Response.json(body);
      }),
    );
    const cdm = new Remote({ keySystem: 'com.widevine.alpha', baseUrl: 'https://remote.example' });
    const session = await cdm.createSession();
    await session.update(new Uint8Array([1]));
    expect(session.keys.size).toBe(1);
    await session[operation]();
    expect(session.keys.size).toBe(0);
    expect(session.keyStatuses.size).toBe(0);
    await expect(session.waitForKeys()).rejects.toThrow('Session closed');
    await expect(session.update(new Uint8Array([1]))).rejects.toThrow('Session closed');
    await expect(session.generateRequest(new Uint8Array([1]))).rejects.toThrow('Session closed');
  },
);

test('remote encodes PlayReady session IDs in request URLs', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  vi.stubGlobal('fetch', fetch);
  try {
    fetch.mockResolvedValueOnce(Response.json({ id: 'a/b+c==' }));
    const engine = new Remote({
      keySystem: 'com.microsoft.playready.recommendation',
      baseUrl: 'https://remote.example',
    });
    const session = await engine.createSession();
    fetch.mockResolvedValueOnce(Response.json({ message: 'AQ==', messageType: 'license-request' }));
    await session.generateRequest(new Uint8Array([1]));
    expect(fetch.mock.calls[1]?.[0]).toBe(
      'https://remote.example/sessions/a%2Fb%2Bc%3D%3D/generate-request',
    );
    fetch.mockResolvedValueOnce(Response.json({ success: true }));
    await session.close();
    expect(fetch.mock.calls[2]?.[0]).toBe('https://remote.example/sessions/a%2Fb%2Bc%3D%3D/close');
  } finally {
    vi.unstubAllGlobals();
  }
});

test.each(['close', 'remove'] as const)(
  'remote %s clears native and wrapper state when cleanup fails',
  async (operation) => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(Response.json({ id: 'session' }));
    vi.stubGlobal('fetch', fetch);
    const engine = new Remote({ keySystem: 'com.widevine.alpha', baseUrl: 'https://cdm.test' });
    const native = await engine.createSession();
    const session = new Session('temporary', engine, native);
    const closed = vi.fn();
    const removed = vi.fn();
    native.addEventListener('closed', closed);
    native.addEventListener('removed', removed);
    session.addEventListener('removed', removed);
    const keyId = '00112233445566778899aabbccddeeff';
    const key = 'ffeeddccbbaa99887766554433221100';
    fetch.mockResolvedValueOnce(Response.json({ keys: { [keyId]: key } }));
    await session.update(new Uint8Array([1]));
    expect(native.keys.get(keyId)).toBe(key);
    expect(session.keys.get(keyId)).toBe(key);
    expect(session.keyStatuses.size).toBe(1);
    const waiting = expect(session.waitForLicenseRequest()).rejects.toThrow('Session closed');
    fetch.mockRejectedValueOnce(new Error('Server unavailable'));
    await expect(session[operation]()).rejects.toThrow('Server unavailable');
    await waiting;
    expect(native.keys.size).toBe(0);
    expect(native.keyStatuses.size).toBe(0);
    expect(engine.sessions.size).toBe(0);
    expect(session.keys.size).toBe(0);
    expect(session.keyStatuses.size).toBe(0);
    await expect(session.closed).resolves.toBe('closed-by-application');
    expect(() => session.pause()).toThrow('Session closed');
    await expect(native.update(new Uint8Array())).rejects.toThrow('Session closed');
    // Failed remote cleanup is terminal locally; repeated cleanup must not reopen it.
    await native[operation]();
    await session.close();
    await expect(session.remove()).rejects.toThrow('Session closed');
    expect(closed).toHaveBeenCalledOnce();
    expect(removed).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(3);
  },
);

test.each(['timeout', 'restart', 'server error'] as const)(
  'remote cleanup releases waiters after %s',
  async (failure) => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(Response.json({ id: 'session' }));
    vi.stubGlobal('fetch', fetch);
    const engine = new Remote({
      keySystem: 'com.widevine.alpha',
      baseUrl: 'https://cdm.test',
      requestTimeoutMs: 50,
    });
    const session = await engine.createSession();
    const removed = vi.fn();
    session.addEventListener('removed', removed);
    const waiting = expect(session.waitForKeys()).rejects.toThrow('Session closed');
    if (failure === 'timeout') {
      vi.useFakeTimers();
      fetch.mockImplementationOnce(
        async (_url, init) =>
          new Response(
            new ReadableStream({
              start(controller) {
                init?.signal?.addEventListener('abort', () =>
                  controller.error(init.signal?.reason),
                );
              },
            }),
          ),
      );
    } else {
      fetch.mockResolvedValueOnce(
        Response.json({ error: 'Cleanup failed' }, { status: failure === 'restart' ? 404 : 500 }),
      );
    }
    const closing = expect(session.remove()).rejects.toThrow();
    if (failure === 'timeout') await vi.advanceTimersByTimeAsync(50);
    await closing;
    await waiting;
    expect(removed).not.toHaveBeenCalled();
    expect(engine.sessions.size).toBe(0);
    await session.close();
    expect(fetch).toHaveBeenCalledTimes(2);
  },
);
