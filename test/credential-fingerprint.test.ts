import { beforeEach, expect, test } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { browser } from 'wxt/browser';
import { createHash } from 'node:crypto';
import {
  getCredentialFingerprint,
  getShareableCredentialFingerprint,
} from '../src/extension/utils/credential-fingerprint';
import {
  formatCaptureTrace,
  type CaptureDiagnostic,
} from '../src/extension/utils/session-diagnostics';
import type { CredentialsInfo } from '../src/extension/utils/storage';

beforeEach(() => fakeBrowser.reset());

const remote: CredentialsInfo = {
  type: 'remote',
  config: {
    protocol: 'okova',
    keySystem: 'com.widevine.alpha',
    baseUrl: 'https://example.com',
    secret: 'password',
    headers: { Authorization: 'Bearer test-token' },
  },
};

test('remote fingerprints share a persistent installation key, without exporting a password verifier', async () => {
  const [first, concurrent] = await Promise.all([
    getCredentialFingerprint(remote),
    getCredentialFingerprint(remote),
  ]);
  expect(first).toBe(concurrent);
  expect(first).toMatch(/^v2:[0-9a-f]{64}$/);
  expect(first).not.toContain(createHash('sha256').update(JSON.stringify(remote)).digest('hex'));
  expect(await getCredentialFingerprint(remote)).toBe(first);
  expect(
    await getCredentialFingerprint({ ...remote, config: { ...remote.config, secret: 'other' } }),
  ).not.toBe(first);
  expect(
    await getCredentialFingerprint({
      ...remote,
      config: { ...remote.config, headers: { Authorization: 'other' } },
    }),
  ).not.toBe(first);
  await browser.storage.local.remove('diagnostic-fingerprint-key');
  expect(await getCredentialFingerprint(remote)).not.toBe(first);
});

test('legacy remote hashes are omitted from shared traces and display', () => {
  const credential = { type: 'remote', fingerprint: 'old-secret-verifier', name: 'Test device' };
  const record: CaptureDiagnostic = {
    captureId: 'capture',
    owner: 'owner',
    createdAt: 0,
    origin: null,
    frameOrigin: null,
    frameId: 0,
    documentId: null,
    keySystem: 'com.widevine.alpha',
    credential,
    sessionId: null,
    outcome: 'observed',
    keyCount: 0,
    events: [],
  };
  expect(getShareableCredentialFingerprint(credential)).toBeUndefined();
  expect(formatCaptureTrace(record)).not.toContain('old-secret-verifier');
  expect(JSON.parse(formatCaptureTrace(record)).credential.name).toBe('Test device');
});
