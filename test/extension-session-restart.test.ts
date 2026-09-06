import { readFile } from 'node:fs/promises';
import { generateKeyPairSync } from 'node:crypto';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import background from '../src/extension/entrypoints/background';
import { appStorage } from '../src/extension/utils/storage';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../src/lib/playready/device-credentials';
import { fromBase64, fromBuffer, toBufferSource } from '../src/lib/utils';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
  License,
  LicenseRequest,
  SignedMessage,
} from '../src/lib/widevine/proto';
import { deriveContext, deriveKeys } from '../src/lib/widevine/context';
import {
  createHmacSha256,
  encryptWithAesCbc,
  importAesCbcKeyForEncrypt,
} from '../src/lib/crypto/common';

const initData =
  'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
const sender: Browser.runtime.MessageSender = { frameId: 0, documentId: 'document' };
const pendingRecords = async () =>
  Object.entries(await browser.storage.session.get(null)).filter(([key]) =>
    key.startsWith('pending-session:'),
  );

const startWorker = () => {
  const now = Date.now();
  vi.clearAllTimers();
  vi.setSystemTime(now);
  const listener = vi.spyOn(browser.runtime.onMessage, 'addListener');
  background.main();
  const onMessage = listener.mock.calls.at(-1)![0];
  return (action: string, token = 'one', extra: Record<string, unknown> = {}) =>
    new Promise<unknown>((resolve) => {
      onMessage(
        {
          action,
          keySystem: 'com.widevine.alpha',
          sessionToken: token,
          initData,
          initDataType: 'cenc',
          url: 'https://example.com/video',
          ...extra,
        },
        sender,
        resolve,
      );
    });
};

beforeEach(async () => {
  fakeBrowser.reset();
  vi.useFakeTimers();
  vi.spyOn(browser.tabs, 'query').mockImplementation(async () => []);
  await appStorage.settings.setValue({
    spoofing: true,
    emeInterception: true,
    requestInterception: false,
    theme: 'auto',
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const wvdPath = process.env.VITEST_WVD_PATH;
const prdPath = process.env.VITEST_PRD_PATH;

const loadWidevineClient = async () => {
  if (wvdPath) return WidevineDeviceCredentials.from({ wvd: await readFile(wvdPath) });
  // A local RSA client keeps the restart regression runnable without device files.
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const client = new WidevineDeviceCredentials(
    ClientIdentification.create({
      token: SignedDrmCertificate.encode(
        SignedDrmCertificate.create({
          drmCertificate: DrmCertificate.encode(DrmCertificate.create({ systemId: 1 })).finish(),
        }),
      ).finish(),
    }),
  );
  await client.importKey(privateKey);
  return client;
};

test('restores the original Widevine challenge and decrypts a license after worker termination', async () => {
  const client = await loadWidevineClient();
  await appStorage.clients.active.setValue(client);
  let send = startWorker();
  await send('generateRequest');
  const challenge = await send('license-request');
  expect(challenge).toEqual(expect.any(String));
  if (typeof challenge !== 'string') throw new Error('Missing challenge');
  // Removing the selection must not remove the credentials of a pending session.
  await appStorage.clients.active.setValue(null);
  send = startWorker();
  expect(await send('license-request')).toBe(challenge);

  const signed = SignedMessage.decode(fromBase64(challenge).toBuffer());
  const request = LicenseRequest.decode(signed.msg);
  const context = deriveContext(signed.msg);
  const sessionKey = new Uint8Array(16).fill(7);
  const contentKey = new Uint8Array(16).fill(9);
  const { encKey, macKeyServer } = await deriveKeys(context.enc, context.auth, sessionKey);
  const iv = new Uint8Array(16);
  const license = License.encode(
    License.create({
      id: { requestId: request.contentId!.widevinePsshData!.requestId },
      key: [
        {
          id: new Uint8Array(16),
          iv,
          key: await encryptWithAesCbc(contentKey, await importAesCbcKeyForEncrypt(encKey), iv),
          type: License.KeyContainer.KeyType.CONTENT,
        },
      ],
    }),
  ).finish();
  const { n, e, kty } = await crypto.subtle.exportKey('jwk', client.key.forDecrypt);
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    { n, e, kty },
    { name: 'RSA-OAEP', hash: 'SHA-1' },
    false,
    ['encrypt'],
  );
  const response = SignedMessage.encode(
    SignedMessage.create({
      type: SignedMessage.MessageType.LICENSE,
      msg: license,
      signature: await createHmacSha256(macKeyServer, license),
      sessionKey: new Uint8Array(
        await crypto.subtle.encrypt('RSA-OAEP', publicKey, toBufferSource(sessionKey)),
      ),
    }),
  ).finish();
  send = startWorker();
  expect(
    await send('update', 'one', { message: Object.fromEntries(response.entries()) }),
  ).toMatchObject({ keys: [{ value: fromBuffer(contentKey).toHex() }] });
  expect(await pendingRecords()).toEqual([]);
});

test('does not revive expired or explicitly closed sessions after a restart', async () => {
  await appStorage.clients.active.setValue(await loadWidevineClient());
  let send = startWorker();
  await send('generateRequest', 'expired');
  await send('generateRequest', 'closed');
  send = startWorker();
  await send('close', 'closed');
  vi.clearAllTimers();
  vi.setSystemTime(Date.now() + 5 * 60_000);
  send = startWorker();
  expect(await send('license-request', 'expired')).toBeUndefined();
  expect(await send('license-request', 'closed')).toBeUndefined();
  expect(await pendingRecords()).toEqual([]);
});

test.skipIf(!prdPath)('restores a PlayReady challenge with no selected client', async () => {
  await appStorage.clients.active.setValue(
    await PlayReadyDeviceCredentials.from({ prd: await readFile(prdPath!) }),
  );
  const wrm =
    '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0"><DATA><PROTECTINFO><KEYLEN>16</KEYLEN><ALGID>AESCTR</ALGID></PROTECTINFO><KID>AAAAAAAAAAAAAAAAAAAAAA==</KID></DATA></WRMHEADER>';
  let send = startWorker();
  await send('generateRequest', 'one', {
    keySystem: 'com.microsoft.playready',
    initData: Buffer.from(wrm, 'utf16le').toString('base64'),
  });
  const challenge = await send('license-request');
  expect(challenge).toEqual(expect.any(String));
  await appStorage.clients.active.setValue(null);
  send = startWorker();
  expect(await send('license-request')).toBe(challenge);
  await send('close');
  expect(await pendingRecords()).toEqual([]);
});

test.each(['rejected read', 'synchronous storage error'])(
  'continues handling messages after a restoration %s',
  async (failure) => {
    const error = new Error('Session storage unavailable');
    const get = vi.spyOn(browser.storage.session, 'get');
    if (failure === 'rejected read') {
      get.mockRejectedValueOnce(error);
    } else {
      get.mockImplementationOnce(() => {
        throw error;
      });
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const send = startWorker();

    for (const token of ['keyed', '']) {
      await send('keystatuseschange', token, {
        keyStatuses: { 'ABEiM0RVZneImaq7zN3u/w==': 'usable' },
      });
      expect(await appStorage.recentKeys.getValue()).toMatchObject([
        { id: '00112233445566778899aabbccddeeff', value: 'usable' },
      ]);
      await appStorage.recentKeys.setValue([]);
    }

    await appStorage.clients.active.setValue(await loadWidevineClient());
    await send('generateRequest');
    expect(await send('license-request')).toEqual(expect.any(String));
    await send('close');
    expect(await pendingRecords()).toEqual([]);
    expect(warn).toHaveBeenCalledWith('[okova] Unable to restore pending DRM sessions', error);
  },
);

test.each(['okova', 'pywidevine'] as const)(
  'restores a %s remote session without reopening or using the new selection',
  async (protocol) => {
    const { RemoteClient } = await import('../src/extension/utils/remote-client');
    const client = await RemoteClient.from({
      protocol,
      keySystem: 'com.widevine.alpha',
      baseUrl: 'https://cdm.test',
      secret: 'test-secret',
      device: 'test-device',
    });
    await appStorage.clients.active.setValue(client);
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input, init) => {
        const path = new URL(String(input)).pathname;
        calls.push(path);
        expect(new Headers(init?.headers).get('x-secret-key')).toBe('test-secret');
        if (path === '/sessions') return Response.json({ id: 'remote-id' });
        if (path.endsWith('/open'))
          return Response.json({ status: 200, data: { session_id: 'remote-id' } });
        if (path.endsWith('/generate-request'))
          return Response.json({ message: 'CAESAA==', messageType: 'license-request' });
        if (path.includes('/get_license_challenge/'))
          return Response.json({ status: 200, data: { challenge_b64: 'CAESAA==' } });
        if (path.endsWith('/update'))
          return Response.json({
            keys: { '00112233445566778899aabbccddeeff': 'ffeeddccbbaa99887766554433221100' },
          });
        if (path.includes('/get_keys/'))
          return Response.json({
            status: 200,
            data: {
              keys: [
                {
                  key_id: '00112233445566778899aabbccddeeff',
                  key: 'ffeeddccbbaa99887766554433221100',
                  type: 'CONTENT',
                },
              ],
            },
          });
        return Response.json({ status: 200, success: true });
      }),
    );
    try {
      let send = startWorker();
      await send('generateRequest');
      expect(await send('license-request')).toBe('CAESAA==');
      expect(await pendingRecords()).toHaveLength(1);
      await appStorage.clients.active.setValue(null);
      send = startWorker();
      expect(await send('license-request')).toBe('CAESAA==');
      expect(await send('update', 'one', { message: [8, 2] })).toMatchObject({
        keys: [
          { id: '00112233445566778899aabbccddeeff', value: 'ffeeddccbbaa99887766554433221100' },
        ],
      });
      expect(calls.filter((path) => path === '/sessions' || path.endsWith('/open'))).toHaveLength(
        1,
      );
      expect(calls.at(-1)).toContain('close');
      expect(await pendingRecords()).toHaveLength(0);
    } finally {
      vi.unstubAllGlobals();
    }
  },
);

test('closes remote sessions that expired while the worker was stopped', async () => {
  const { RemoteClient } = await import('../src/extension/utils/remote-client');
  await appStorage.clients.active.setValue(
    await RemoteClient.from({
      protocol: 'okova',
      keySystem: 'com.widevine.alpha',
      baseUrl: 'https://cdm.test',
    }),
  );
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (input) => {
      const path = new URL(String(input)).pathname;
      calls.push(path);
      if (path === '/sessions') return Response.json({ id: 'expired-id' });
      if (path.endsWith('/generate-request'))
        return Response.json({ message: 'CAESAA==', messageType: 'license-request' });
      return Response.json({ success: true });
    }),
  );
  try {
    const send = startWorker();
    await send('generateRequest');
    expect(await pendingRecords()).toHaveLength(1);
    vi.setSystemTime(Date.now() + 6 * 60_000);
    await startWorker()('license-request');
    expect(calls.at(-1)).toBe('/sessions/expired-id/close');
    expect(await pendingRecords()).toHaveLength(0);
  } finally {
    vi.unstubAllGlobals();
  }
});

test('unreachable expired remote sessions do not delay new local sessions', async () => {
  const { RemoteClient } = await import('../src/extension/utils/remote-client');
  await appStorage.clients.active.setValue(
    await RemoteClient.from({
      protocol: 'okova',
      keySystem: 'com.widevine.alpha',
      baseUrl: 'https://cdm.test',
    }),
  );
  const cleanup = Promise.withResolvers<void>();
  const closeRequests: string[] = [];
  let sessionCount = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (input) => {
      const path = new URL(String(input)).pathname;
      if (path === '/sessions') return Response.json({ id: `remote-${++sessionCount}` });
      if (path.endsWith('/generate-request'))
        return Response.json({ message: 'CAESAA==', messageType: 'license-request' });
      closeRequests.push(path);
      await cleanup.promise;
      return Response.json({ success: true });
    }),
  );
  try {
    let send = startWorker();
    for (const token of ['one', 'two', 'three', 'four']) await send('generateRequest', token);
    expect(await pendingRecords()).toHaveLength(4);
    vi.setSystemTime(Date.now() + 6 * 60_000);
    await appStorage.clients.active.setValue(await loadWidevineClient());
    send = startWorker();
    let isGenerated = false;
    const generated = send('generateRequest', 'local').then(() => {
      isGenerated = true;
    });
    await vi.waitFor(() => expect(isGenerated).toBe(true));
    await generated;
    expect(closeRequests).toHaveLength(4);
    expect(await send('license-request', 'local')).toEqual(expect.any(String));
    await send('close', 'local');
    expect(await pendingRecords()).toHaveLength(0);
  } finally {
    cleanup.resolve();
    vi.unstubAllGlobals();
  }
});
