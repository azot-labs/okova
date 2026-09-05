import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { Hono } from 'hono';
import { fromBase64, Remote, Session, PlayReady, PlayReadyDeviceCredentials } from '../src/lib';
import sessionApi from '../src/cli/commands/serve/api/session';
import { clients, config, sessions } from '../src/cli/commands/serve/state';
import { license } from '../src/cli/commands/license/license';
import { LicenseRequest, SignedMessage } from '../src/lib/widevine/proto';
import { loadWidevineDeviceCredentials, PSSH } from './utils';
import { SERVICE_CERTIFICATE } from './service-certificate';

const certificate = fromBase64(SERVICE_CERTIFICATE).toBuffer();
const initData = fromBase64(PSSH).toBuffer();
const originalConfig = structuredClone(config);
const app = new Hono().route('/sessions', sessionApi);

beforeEach(async () => {
  config.clients = ['test.wvd'];
  config.users = {};
  config.forcePrivacyMode = true;
  clients.set(resolve('test.wvd'), await loadWidevineDeviceCredentials());
});

afterEach(async () => {
  Object.assign(config, originalConfig);
  clients.clear();
  await sessions.clear();
  vi.unstubAllGlobals();
});

const connect = (keySystem = 'com.widevine.alpha') => {
  vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
    app.request(input, init),
  );
  return new Remote({ keySystem, baseUrl: 'http://remote.test' });
};

const decodeChallenge = (message: Uint8Array) =>
  LicenseRequest.decode(SignedMessage.decode(message).msg);

test('forced privacy rejects a challenge before signing without a certificate', async () => {
  const remote = connect();
  const session = await remote.createSession();
  await expect(session.generateRequest(initData)).rejects.toThrow(
    'Privacy mode requires a valid server certificate',
  );
});

test.each([true, false])(
  'certificate transport encrypts client ID, set before session: %s',
  async (beforeSession) => {
    const remote = connect();
    if (beforeSession) await remote.setServerCertificate(certificate);
    const session = await remote.createSession();
    if (!beforeSession) await remote.setServerCertificate(certificate);
    const message = new Session('temporary', remote, session).waitForLicenseRequest();
    await session.generateRequest(initData);
    const challenge = decodeChallenge(await message);
    expect(challenge.clientId).toBeNull();
    expect(challenge.encryptedClientId?.encryptedClientId?.length).toBeGreaterThan(0);
  },
);

test('privacy can be disabled explicitly for plaintext requests', async () => {
  config.forcePrivacyMode = false;
  const remote = connect();
  const session = await remote.createSession();
  const message = new Session('temporary', remote, session).waitForLicenseRequest();
  await session.generateRequest(initData);
  const challenge = decodeChallenge(await message);
  expect(challenge.clientId).toBeTruthy();
  expect(challenge.encryptedClientId).toBeNull();
});

test('server validates certificates independently of the remote client', async () => {
  const session = await connect().createSession();
  const response = await app.request(`/sessions/${session.sessionId}/generate-request`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ initData: PSSH, serverCertificate: 'AQID' }),
  });
  expect(response.status).toBe(400);
  await expect(session.generateRequest(initData)).rejects.toThrow('Privacy mode requires');
});

test('remote rejects invalid and unsupported certificates', async () => {
  const remote = connect();
  await expect(remote.setServerCertificate(new Uint8Array([1, 2, 3]))).rejects.toThrow();
  const playready = new Remote({
    keySystem: 'com.microsoft.playready.recommendation',
    baseUrl: 'http://remote.test',
  });
  await expect(playready.setServerCertificate(certificate)).rejects.toThrow('unsupported');
});

test('CLI encrypt fetches a certificate before sending an encrypted challenge', async () => {
  const requests: Uint8Array[] = [];
  vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const request = new Request(input, init);
    const body = new Uint8Array(await request.arrayBuffer());
    requests.push(body);
    if (requests.length === 1) return new Response(certificate);
    throw new Error('Challenge captured');
  });
  await expect(
    license({
      url: 'http://license.test',
      pssh: PSSH,
      clientPath: process.env.VITEST_WVD_PATH ?? 'clients/client.wvd',
      encrypt: true,
    }),
  ).rejects.toThrow('Challenge captured');
  expect(requests[0]).toEqual(new Uint8Array([8, 4]));
  const challenge = decodeChallenge(requests[1]);
  expect(challenge.clientId).toBeNull();
  expect(challenge.encryptedClientId?.encryptedClientId?.length).toBeGreaterThan(0);
});

test.each([200, 500])(
  'CLI aborts before generating a challenge when certificate response is invalid: %s',
  async (status) => {
    const fetch = vi.fn(async () => new Response('invalid certificate', { status }));
    vi.stubGlobal('fetch', fetch);
    await expect(
      license({
        url: 'http://license.test',
        pssh: PSSH,
        clientPath: process.env.VITEST_WVD_PATH ?? 'clients/client.wvd',
        encrypt: true,
      }),
    ).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  },
);

test('certificates do not carry over to another remote engine', async () => {
  const remote = connect();
  await remote.setServerCertificate(certificate);
  const session = await remote.createSession();
  await session.generateRequest(initData);
  const otherSession = await connect().createSession();
  await expect(otherSession.generateRequest(initData)).rejects.toThrow('Privacy mode requires');
});

test('PlayReady rejects server certificates, forced privacy, and CLI encrypt', async () => {
  const clientPath = process.env.VITEST_PRD_PATH ?? 'clients/client.prd';
  const deviceCredentials = await PlayReadyDeviceCredentials.from({
    prd: await readFile(clientPath),
  });
  const engine = new PlayReady({ deviceCredentials });
  await expect(engine.setServerCertificate()).rejects.toThrow('unsupported');
  clients.set(resolve('test.wvd'), deviceCredentials);
  const session = await connect('com.microsoft.playready').createSession();
  await expect(session.generateRequest(initData)).rejects.toThrow(
    'Forced privacy mode is unsupported',
  );
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  await expect(
    license({ url: 'http://license.test', pssh: PSSH, clientPath, encrypt: true }),
  ).rejects.toThrow('--encrypt is supported only for Widevine');
  expect(fetch).not.toHaveBeenCalled();
});

test('remote refuses a server that silently ignores certificate transport', async () => {
  vi.stubGlobal('fetch', async () =>
    Response.json({ id: 'old-server-session', message: 'AQID', messageType: 'license-request' }),
  );
  const remote = new Remote({ keySystem: 'com.widevine.alpha', baseUrl: 'http://old-server.test' });
  await remote.setServerCertificate(certificate);
  const session = await remote.createSession();
  await expect(session.generateRequest(initData)).rejects.toThrow(
    'did not acknowledge the server certificate',
  );
});
