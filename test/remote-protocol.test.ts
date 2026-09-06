import { afterEach, expect, test, vi } from 'vitest';
import { isServiceCertificate } from '../src/lib/widevine/message';
import { SignedMessage } from '../src/lib/widevine/proto';
import { Remote, Session, fromBase64, fromBuffer } from '../src/lib';
import { SERVICE_CERTIFICATE } from './service-certificate';
import { PSSH } from './utils';

const keyId = '00112233445566778899aabbccddeeff';
const key = 'ffeeddccbbaa99887766554433221100';
const certificate = fromBase64(SERVICE_CERTIFICATE).toBuffer();
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// Protocol fixtures follow pywidevine/serve.py and pyplayready/remote/serve.py.
const createServer = () => {
  const requests: { path: string; method: string; body: unknown }[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
    const path = new URL(String(input)).pathname;
    const body: unknown = init?.body ? JSON.parse(String(init.body)) : undefined;
    requests.push({ path, method: init?.method ?? 'GET', body });
    expect(new Headers(init?.headers).get('x-secret-key')).toBe('test-secret');
    expect(init?.redirect).toBe('error');
    if (path.endsWith('/open'))
      return Response.json({ status: 200, data: { session_id: 'session-one' } });
    if (path.endsWith('/set_service_certificate'))
      return Response.json({ status: 200, data: { provider_id: 'test-provider' } });
    if (path.includes('/get_license_challenge/'))
      return Response.json({ status: 200, data: { challenge_b64: 'CAESAA==' } });
    if (path.endsWith('/get_license_challenge'))
      return Response.json({ data: { challenge: '<Challenge>test</Challenge>' } });
    if (path.includes('/get_keys'))
      return Response.json({
        status: 200,
        data: {
          keys: [
            {
              key_id: '00112233-4455-6677-8899-aabbccddeeff',
              key,
              type: path.endsWith('/CONTENT') ? 'CONTENT' : 1,
            },
          ],
        },
      });
    return Response.json({ status: 200, message: 'Success' });
  });
  vi.stubGlobal('fetch', fetch);
  return { fetch, requests };
};

test('pywidevine transports certificates, challenges, licenses, and content keys across resume', async () => {
  const { requests } = createServer();
  const params = {
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test/api/',
    device: 'device name',
    secret: 'test-secret',
  } as const;
  const engine = new Remote(params);
  await engine.setServerCertificate(certificate);
  const session = new Session('temporary', engine);
  await session.generateRequest('cenc', fromBase64(PSSH).toBuffer());
  expect(await session.waitForLicenseRequest()).toEqual(fromBase64('CAESAA==').toBuffer());
  const resumed = Session.resume(session.pause(), new Remote(params));
  await resumed.update(new Uint8Array([8, 2]));
  expect(resumed.keys.get(keyId)).toBe(key);
  await resumed.close();
  expect(requests.map(({ path }) => path)).toEqual([
    '/api/device%20name/open',
    '/api/device%20name/set_service_certificate',
    '/api/device%20name/get_license_challenge/STREAMING',
    '/api/device%20name/parse_license',
    '/api/device%20name/get_keys/CONTENT',
    '/api/device%20name/close/session-one',
  ]);
  expect(requests[2]?.body).toMatchObject({ session_id: 'session-one', privacy_mode: true });
  expect(requests[3]?.body).toEqual({ session_id: 'session-one', license_message: 'CAI=' });
});

test('pywidevine service certificate updates regenerate the pending challenge', async () => {
  const { requests } = createServer();
  const engine = new Remote({
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    device: 'device',
    secret: 'test-secret',
  });
  const session = await engine.createSession();
  await session.generateRequest(fromBase64(PSSH).toBuffer());
  await session.update(certificate);
  expect(requests.map(({ path }) => path)).toEqual([
    '/device/open',
    '/device/get_license_challenge/STREAMING',
    '/device/set_service_certificate',
    '/device/get_license_challenge/STREAMING',
  ]);
  expect(requests.at(-1)?.body).toMatchObject({ privacy_mode: true });
});

test.each(['challenge', 'challenge_b64'])(
  'pyplayready handles XML and the %s response variant',
  async (field) => {
    const { fetch, requests } = createServer();
    const params = {
      protocol: 'pyplayready',
      keySystem: 'com.microsoft.playready.recommendation',
      baseUrl: 'https://cdm.test',
      device: 'device',
      secret: 'test-secret',
    } as const;
    const engine = new Remote(params);
    const session = new Session('temporary', engine);
    const header =
      '<WRMHEADER version="4.0.0.0"><DATA><KID>AAAAAAAAAAAAAAAAAAAAAA==</KID></DATA></WRMHEADER>';
    // Await opening before replacing the next response.
    await vi.waitFor(() => expect(requests).toHaveLength(1));
    const challenge = '<Challenge>test</Challenge>';
    fetch.mockResolvedValueOnce(
      Response.json({ data: { [field]: field === 'challenge' ? challenge : btoa(challenge) } }),
    );
    await session.generateRequest('cenc', Uint8Array.from(Buffer.from(header, 'utf16le')));
    expect(new TextDecoder().decode(await session.waitForLicenseRequest())).toBe(challenge);
    expect(requests[0]?.path).toBe('/device/open');
    const resumed = Session.resume(session.pause(), new Remote(params));
    await resumed.update(new TextEncoder().encode('<License>test</License>'));
    expect(requests.at(-2)?.body).toEqual({
      session_id: 'session-one',
      license_message: '<License>test</License>',
    });
    expect(resumed.keys.get(keyId)).toBe(key);
    await resumed.close();
  },
);

test('rejects malformed success responses and Python application errors', async () => {
  const { fetch } = createServer();
  const engine = new Remote({
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    device: 'device',
    secret: 'test-secret',
  });
  fetch.mockResolvedValueOnce(Response.json({ status: 200, data: {} }));
  await expect(engine.createSession()).rejects.toThrow();
  fetch.mockResolvedValueOnce(Response.json({ status: 403, message: 'Device not authorized' }));
  await expect(engine.createSession()).rejects.toThrow('Device not authorized');
  fetch.mockResolvedValueOnce(
    Response.json({ status: '401', message: 'Secret Key is Invalid' }, { status: 401 }),
  );
  await expect(engine.createSession()).rejects.toThrow('Secret Key is Invalid');
  await expect(engine.createSession('persistent-license')).rejects.toThrow('temporary');
});

test('deadline covers a stalled response body and malformed JSON errors omit the body', async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(
      async (_input, init) =>
        new Response(
          new ReadableStream({
            start(controller) {
              init?.signal?.addEventListener('abort', () => controller.error(init.signal?.reason));
            },
          }),
        ),
    ),
  );
  const engine = new Remote({
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    requestTimeoutMs: 50,
  });
  const result = expect(engine.createSession()).rejects.toThrow('timed out after 50ms');
  await vi.advanceTimersByTimeAsync(50);
  await result;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('<html>private server data</html>', { status: 502 })),
  );
  await expect(engine.createSession()).rejects.toThrow('invalid JSON (HTTP 502)');
});

test('resumed sessions cannot be attached to another server or device', async () => {
  createServer();
  const params = {
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    device: 'device',
    secret: 'test-secret',
  } as const;
  const engine = new Remote(params);
  const session = await engine.createSession();
  const state = session.pause();
  expect(() => new Remote({ ...params, device: 'another-device' }).resumeSession(state)).toThrow(
    'different server, device',
  );
  expect(() =>
    new Remote({ ...params, baseUrl: 'https://other.test' }).resumeSession(state),
  ).toThrow('different server, device');
});

test.each(['before', 'after'])(
  'resume preserves newer engine certificates set %s attaching the session',
  async (when) => {
    const { requests } = createServer();
    const params = {
      protocol: 'pywidevine',
      keySystem: 'com.widevine.alpha',
      baseUrl: 'https://cdm.test',
      device: 'device',
      secret: 'test-secret',
    } as const;
    const originalEngine = new Remote(params);
    await originalEngine.setServerCertificate(certificate);
    const original = await originalEngine.createSession();
    // The signed certificate and its message envelope are both accepted encodings.
    const replacement = SignedMessage.decode(certificate).msg;
    const engine = new Remote(params);
    if (when === 'before') await engine.setServerCertificate(replacement);
    const session = engine.resumeSession(original.pause());
    if (when === 'after') await engine.setServerCertificate(replacement);
    await session.generateRequest(fromBase64(PSSH).toBuffer());
    expect(
      requests.find(({ path }) => path.endsWith('/set_service_certificate'))?.body,
    ).toMatchObject({ certificate: fromBuffer(replacement).toBase64() });
  },
);

test('resume keeps explicit session certificates ahead of engine certificates', async () => {
  const { requests } = createServer();
  const params = {
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    device: 'device',
    secret: 'test-secret',
  } as const;
  const original = await new Remote(params).createSession();
  await original.generateRequest(fromBase64(PSSH).toBuffer());
  await original.update(certificate);
  const engine = new Remote(params);
  await engine.setServerCertificate(SignedMessage.decode(certificate).msg);
  const session = engine.resumeSession(original.pause());
  await session.generateRequest(fromBase64(PSSH).toBuffer());
  expect(
    requests.filter(({ path }) => path.endsWith('/set_service_certificate')).at(-1)?.body,
  ).toMatchObject({ certificate: SERVICE_CERTIFICATE });
});

test('Okova update retrieves keys when the server acknowledges without including them', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(Response.json({ id: 'session-one' }))
    .mockResolvedValueOnce(Response.json({ success: true }))
    .mockResolvedValueOnce(Response.json({ [keyId]: key }));
  vi.stubGlobal('fetch', fetch);
  const session = await new Remote({
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
  }).createSession();
  await session.update(new Uint8Array([8, 2]));
  expect(session.keys.get(keyId)).toBe(key);
  expect(fetch.mock.calls.map(([url]) => String(url))).toEqual([
    'https://cdm.test/sessions',
    'https://cdm.test/sessions/session-one/update',
    'https://cdm.test/sessions/session-one/keys',
  ]);
});

test('Python device metadata is checked when configured', async () => {
  const { fetch } = createServer();
  fetch.mockResolvedValueOnce(
    Response.json({
      status: 200,
      data: { session_id: 'verified', device: { system_id: '1234', security_level: '3' } },
    }),
  );
  const engine = new Remote({
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    device: 'device',
    secret: 'test-secret',
    systemId: 1234,
    securityLevel: 3,
  });
  const session = await engine.createSession();
  expect(session.sessionId).toBe('verified');
  await session.close();
});

test.each([
  { system_id: 5678, security_level: 3 },
  { system_id: 1234, security_level: 1 },
  undefined,
])('Python device mismatches close the opened server session', async (device) => {
  const { fetch, requests } = createServer();
  fetch.mockResolvedValueOnce(
    Response.json({ status: 200, data: { session_id: 'wrong-device', device } }),
  );
  const engine = new Remote({
    protocol: 'pywidevine',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://cdm.test',
    device: 'device',
    secret: 'test-secret',
    systemId: 1234,
    securityLevel: 3,
  });
  await expect(engine.createSession()).rejects.toThrow('does not match');
  expect(requests.at(-1)?.path).toBe('/device/close/wrong-device');
  expect(engine.sessions.size).toBe(0);
});

test.each(['CONTENT', 2])(
  'Widevine accepts CONTENT key type %s and excludes signing keys',
  async (type) => {
    const { fetch } = createServer();
    const engine = new Remote({
      protocol: 'pywidevine',
      keySystem: 'com.widevine.alpha',
      baseUrl: 'https://cdm.test',
      device: 'device',
      secret: 'test-secret',
    });
    const session = await engine.createSession();
    fetch.mockResolvedValueOnce(Response.json({ status: 200 }));
    fetch.mockResolvedValueOnce(
      Response.json({
        data: {
          keys: [
            { key_id: keyId, key, type },
            { key_id: '00000000000000000000000000000000', key, type: 1 },
          ],
        },
      }),
    );
    await session.update(new Uint8Array([8, 2]));
    expect(Object.fromEntries(session.keys)).toEqual({ [keyId]: key });
  },
);

test('certificate detection leaves opaque license responses to the engine', () => {
  expect(isServiceCertificate(certificate)).toBe(true);
  expect(isServiceCertificate(new Uint8Array([255]))).toBe(false);
});

test('structured server errors retain details', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json(
        { error: { code: 'NO_CLIENT', reason: 'Client unavailable' } },
        { status: 400 },
      ),
    ),
  );
  const engine = new Remote({ keySystem: 'com.widevine.alpha', baseUrl: 'https://cdm.test' });
  await expect(engine.createSession()).rejects.toThrow('"reason":"Client unavailable"');
});

test('native DRM mismatch remains visible when cleanup fails', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(Response.json({ id: 'wrong', keySystem: 'com.microsoft.playready' }))
    .mockRejectedValueOnce(new Error('Offline'));
  vi.stubGlobal('fetch', fetch);
  const engine = new Remote({ keySystem: 'com.widevine.alpha', baseUrl: 'https://cdm.test' });
  await expect(engine.createSession()).rejects.toThrow('different DRM system');
  expect(fetch.mock.calls[1]?.[0]).toBe('https://cdm.test/sessions/wrong/close');
});

test('native open accepts equivalent PlayReady key system names', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ id: 'pr', keySystem: 'com.microsoft.playready' })),
  );
  const engine = new Remote({
    keySystem: 'com.microsoft.playready.recommendation',
    baseUrl: 'https://cdm.test',
  });
  expect((await engine.createSession()).sessionId).toBe('pr');
});

test.each(['a/b', '..%2f', '   ', ' .. ', 'a\\b'])(
  'Python rejects invalid device name %j',
  (device) => {
    expect(
      () =>
        new Remote({
          protocol: 'pywidevine',
          keySystem: 'com.widevine.alpha',
          baseUrl: 'https://cdm.test',
          device,
        }),
    ).toThrow();
  },
);

test('concurrent close and remove share cleanup and notify removal', async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(Response.json({ id: 'session' }));
  vi.stubGlobal('fetch', fetch);
  const engine = new Remote({ keySystem: 'com.widevine.alpha', baseUrl: 'https://cdm.test' });
  const session = await engine.createSession();
  const cleanup = Promise.withResolvers<Response>();
  fetch.mockReturnValueOnce(cleanup.promise);
  const removed = vi.fn();
  session.addEventListener('removed', removed);
  const closing = session.close();
  const removing = session.remove();
  cleanup.resolve(Response.json({ success: true }));
  await Promise.all([closing, removing]);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(removed).toHaveBeenCalledTimes(1);
  expect(engine.sessions.size).toBe(0);
});
