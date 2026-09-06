import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { Hono } from 'hono';
import { afterEach, beforeEach, assert, expect, test, vi } from 'vitest';
import {
  fetchDecryptionKeys,
  PlayReady,
  PlayReadyDeviceCredentials,
  Remote,
  Session,
} from '../../src/lib';
import { PlayReadySession } from '../../src/lib/playready/session';
import { createSha256, ecc256Verify } from '../../src/lib/crypto/common';
import sessionApi from '../../src/cli/commands/serve/api/session';
import { clients, config, sessions } from '../../src/cli/commands/serve/state';

beforeEach(({ skip }) => {
  if (!process.env.VITEST_PRD_PATH) skip('Set VITEST_PRD_PATH to enable this fixture suite');
});

const header =
  '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0"><DATA></DATA></WRMHEADER>';
const initData = new Uint8Array(Buffer.from(header, 'utf16le'));
const applicationData = '<app token="a&b">Привет \'world\'</app>';
const originalConfig = structuredClone(config);
let deviceCredentials: PlayReadyDeviceCredentials;

beforeEach(async () => {
  deviceCredentials = await PlayReadyDeviceCredentials.from({
    prd: await readFile(process.env.VITEST_PRD_PATH!),
  });
});

afterEach(async () => {
  await sessions.clear();
  clients.clear();
  Object.assign(config, originalConfig);
  vi.unstubAllGlobals();
});

const checkChallenge = async (challenge: string, customData?: string) => {
  const document = new DOMParser().parseFromString(challenge, 'application/xml');
  const elements = document.getElementsByTagName('CustomData');
  expect(elements.length).toBe(customData === undefined ? 0 : 1);
  if (customData !== undefined) {
    expect(elements[0]?.textContent).toBe(customData);
    expect(elements[0]?.parentNode?.nodeName).toBe('LA');
    expect(elements[0]?.childNodes.length).toBe(customData === '' ? 0 : 1);
  }
  const la = challenge.match(/<LA .*?<\/LA>/s)?.[0];
  const signedInfo = challenge.match(/<SignedInfo .*?<\/SignedInfo>/s)?.[0];
  expect(la).toBeDefined();
  expect(signedInfo).toBeDefined();
  const digest = await createSha256(new TextEncoder().encode(la));
  expect(document.getElementsByTagName('DigestValue')[0]?.textContent).toBe(
    Buffer.from(digest).toString('base64'),
  );
  const signature = Buffer.from(
    document.getElementsByTagName('SignatureValue')[0]?.textContent ?? '',
    'base64',
  );
  expect(
    await ecc256Verify(
      new Uint8Array([4, ...deviceCredentials.signingKey.publicBytes()]),
      new TextEncoder().encode(signedInfo),
      signature,
    ),
  ).toBe(true);
};

test.each([undefined, '', applicationData])('signs custom data: %s', async (customData) => {
  const engine = new PlayReady({ deviceCredentials, customData });
  const session = engine.createSession();
  assert(session instanceof PlayReadySession);
  await checkChallenge(await session.getLicenseChallenge(header), customData);
  const state = session.pause();
  await session.close();
  const resumed = engine.resumeSession(state);
  assert(resumed instanceof PlayReadySession);
  await checkChallenge(await resumed.getLicenseChallenge(header), customData);
  await checkChallenge(
    await resumed.getLicenseChallenge(header, undefined, 'override'),
    'override',
  );
  await resumed.close();
});

test('helper sends the configured custom data in the license request', async () => {
  const engine = new PlayReady({ deviceCredentials, customData: applicationData });
  const fetchLicense = vi.fn<typeof fetch>(async (input) => {
    expect(input).toBeInstanceOf(Request);
    if (!(input instanceof Request)) throw new Error('Expected a Request');
    await checkChallenge(await input.text(), applicationData);
    throw new Error('Stop after inspecting challenge');
  });
  await expect(
    fetchDecryptionKeys({
      cdm: engine,
      pssh: Buffer.from(initData).toString('base64'),
      server: 'https://license.test',
      fetch: fetchLicense,
    }),
  ).rejects.toThrow('Stop after inspecting challenge');
  expect(fetchLicense).toHaveBeenCalledOnce();
  expect(engine.sessions.size).toBe(0);
});

test('remote API keeps custom data separate for sessions sharing credentials', async () => {
  config.clients = ['custom-data.prd'];
  config.users = {};
  config.forcePrivacyMode = false;
  clients.set(resolve('custom-data.prd'), deviceCredentials);
  const app = new Hono().route('/sessions', sessionApi);
  vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
    app.request(input, init),
  );
  for (const customData of [applicationData, '', undefined]) {
    const engine = new Remote({
      keySystem: 'com.microsoft.playready.recommendation',
      baseUrl: 'http://remote.test',
      customData,
    });
    const session = await engine.createSession();
    const message = new Session('temporary', engine, session).waitForLicenseRequest();
    await session.generateRequest(initData);
    await checkChallenge(new TextDecoder().decode(await message), customData);
  }
  const response = await app.request('/sessions', {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ customData: { invalid: true } }),
  });
  expect(response.status).toBe(400);
});

test.each([
  [applicationData, '&lt;app token="a&amp;b"&gt;Привет \'world\'&lt;/app&gt;'],
  ['line 1\r\nline 2\rline 3\n\t&amp;', 'line 1&#xD;\nline 2&#xD;line 3\n\t&amp;amp;'],
])('custom data preserves canonical XML text: %s', async (customData, canonicalText) => {
  const engine = new PlayReady({ deviceCredentials, customData });
  const session = engine.createSession();
  assert(session instanceof PlayReadySession);
  try {
    const challenge = await session.getLicenseChallenge(header);
    const la = challenge.match(/<LA .*?<\/LA>/s)?.[0];
    assert(la);
    // Use the expected canonical text, rather than hashing the emitted XML unchanged.
    const canonicalLa = la.replace(
      /<CustomData>.*?<\/CustomData>/s,
      () => `<CustomData>${canonicalText}</CustomData>`,
    );
    const digest = await createSha256(new TextEncoder().encode(canonicalLa));
    const document = new DOMParser().parseFromString(challenge, 'application/xml');
    expect(document.getElementsByTagName('DigestValue')[0]?.textContent).toBe(
      Buffer.from(digest).toString('base64'),
    );
    await checkChallenge(challenge, customData);
  } finally {
    await session.close();
  }
});

test('remote capacity applies across separate PlayReady engines', async () => {
  config.clients = ['capacity.prd'];
  config.users = {};
  config.sessionLimits = { ...originalConfig.sessionLimits, maxSessions: 16 };
  clients.set(resolve('capacity.prd'), deviceCredentials);
  const responses = await Promise.all(
    Array.from({ length: 17 }, () =>
      sessionApi.request('/', {
        method: 'POST',
        signal: AbortSignal.timeout(30_000),
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    ),
  );
  expect(responses.filter((response) => response.status === 200)).toHaveLength(16);
  expect(responses.filter((response) => response.status === 503)).toHaveLength(1);
  expect(sessions.size).toBe(16);
});
