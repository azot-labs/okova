import { afterEach, expect, test, vi } from 'vitest';
import {
  fromBase64,
  Remote,
  requestMediaKeySystemAccess,
  setSupportedEngines,
  toBufferSource,
} from '../src/lib';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test('remote session', async () => {
  const url = 'https://cwip-shaka-proxy.appspot.com/no_auth';
  const pssh =
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const baseUrl = process.env.VITEST_REMOTE_BASE_URL;
  if (!baseUrl) {
    console.warn('Remote session config not found. Skipping test');
    return;
  }

  const secret = process.env.VITEST_REMOTE_SECRET;
  const client = process.env.VITEST_REMOTE_CLIENT ?? 'pixel6';

  const cdm = new Remote({
    keySystem: 'com.widevine.alpha',
    baseUrl,
    secret,
    client,
  });

  const certificateResponse = await fetch(url, {
    method: 'POST',
    body: toBufferSource(new Uint8Array([0x08, 0x04])),
  });
  if (!certificateResponse.ok) {
    throw new Error(`Service certificate request failed: ${certificateResponse.status}`);
  }
  await cdm.setServerCertificate(new Uint8Array(await certificateResponse.arrayBuffer()));

  setSupportedEngines([cdm]);
  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();
  await session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(url, {
    body: toBufferSource(licenseRequest),
    method: 'POST',
  })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  await session.update(response);
  const keys = await session.waitForKeyStatusesChange();

  expect(keys.size).toBe(5);
  expect(keys.get('ccbf5fb4c2965be7aa130ffb3ba9fd73')).toBe('9cc0c92044cb1d69433f5f5839a159df');

  await session.close();
  await session.remove();
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
