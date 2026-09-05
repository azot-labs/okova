import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { EccKey } from '../src/lib/crypto/ecc-key';
import { CertificateChain } from '../src/lib/playready/bcert';
import { PlayReadyDeviceCredentials } from '../src/lib/playready/device-credentials';
import { PlayReady } from '../src/lib/playready/engine';
import { PlayReadySession } from '../src/lib/playready/session';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import { Widevine } from '../src/lib/widevine/engine';
import { WidevineSession } from '../src/lib/widevine/session';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';

const createWidevine = () =>
  new Widevine({
    deviceCredentials: new WidevineDeviceCredentials(
      ClientIdentification.create({
        token: SignedDrmCertificate.encode({
          drmCertificate: DrmCertificate.encode({ systemId: 1 }).finish(),
        }).finish(),
      }),
    ),
  });

const createPlayReady = () =>
  new PlayReady({
    deviceCredentials: new PlayReadyDeviceCredentials({
      encryptionKey: EccKey.generate().dumps(),
      signingKey: EccKey.generate().dumps(),
      // Registry tests only need a serializable device, not a provisioned certificate.
      groupCertificate: new CertificateChain({
        signature: new TextEncoder().encode('CHAI'),
        version: 1,
        total_length: 36,
        flags: 0,
        certificate_count: 1,
        certificates: [
          {
            signature: new TextEncoder().encode('CERT'),
            version: 1,
            total_length: 16,
            certificate_length: 16,
            attributes: [],
          },
        ],
      }).dumps(),
    }),
  });

const parseState = (state: string) => z.record(z.string(), z.unknown()).parse(JSON.parse(state));

describe.each([
  { name: 'Widevine', createEngine: createWidevine },
  { name: 'PlayReady', createEngine: createPlayReady },
])('$name session ownership', ({ createEngine }) => {
  test('rejects duplicate live resumes and releases only the owning session', async () => {
    const engine = createEngine();
    const original = engine.createSession();
    if (!original.pause) throw new Error('Missing serialization');
    const state = original.pause();
    expect(() => engine.resumeSession(state)).toThrow('already open');
    expect(engine.sessions.get(original.sessionId)).toBe(original);
    expect(engine.sessions.size).toBe(1);

    await original.close();
    expect(engine.sessions.size).toBe(0);
    const resumed = engine.resumeSession(state);
    await original.close();
    expect(engine.sessions.get(resumed.sessionId)).toBe(resumed);
    await resumed.close();
    expect(engine.sessions.size).toBe(0);
  });

  test('closing an untracked clone cannot dispose the original', async () => {
    const engine = createEngine();
    const original = engine.createSession();
    if (!(original instanceof WidevineSession || original instanceof PlayReadySession)) {
      throw new Error('Expected a native session');
    }
    const clone = original.resume(original.pause());
    await clone.close();
    expect(engine.sessions.get(original.sessionId)).toBe(original);
    await original.close();
    expect(engine.sessions.size).toBe(0);
  });

  test('reads legacy snapshots and rejects invalid state without changing the registry', async () => {
    const engine = createEngine();
    const original = engine.createSession();
    if (!original.pause) throw new Error('Missing serialization');
    const state = parseState(original.pause());
    await original.close();
    for (const invalid of [
      { ...state, version: 2 },
      { ...state, sessionId: '' },
      { ...state, sessionType: 'banana' },
      { ...state, initData: 'not base64!' },
      { ...state, keys: null },
      { ...state, keySystem: 'unsupported' },
    ]) {
      expect(() => engine.resumeSession(JSON.stringify(invalid))).toThrow();
      expect(engine.sessions.size).toBe(0);
    }
    const { version: _version, keySystem: _keySystem, ...legacy } = state;
    const resumed = engine.resumeSession(JSON.stringify(legacy));
    expect(resumed.sessionId).toBe(original.sessionId);
    expect(engine.sessions.get(resumed.sessionId)).toBe(resumed);
    await resumed.close();
  });
});

test('unsupported Widevine load leaves identity and registry unchanged', async () => {
  const engine = createWidevine();
  const session = engine.createSession();
  const id = session.sessionId;
  await expect(session.load('another-session')).resolves.toBe(false);
  expect(session.sessionId).toBe(id);
  expect(engine.sessions.get(id)).toBe(session);
  await session.close();
  expect(engine.sessions.size).toBe(0);
});

test('Widevine session counters advance past created and restored sessions', async () => {
  const engine = createWidevine();
  const first = engine.createSession();
  const second = engine.createSession();
  expect(first.sessionNumber).toBe(1);
  expect(second.sessionNumber).toBe(2);
  const state = second.pause();
  await Promise.all([first.close(), second.close()]);
  const restoredEngine = createWidevine();
  const restored = restoredEngine.resumeSession(state);
  const next = restoredEngine.createSession();
  expect(restored.sessionNumber).toBe(2);
  expect(next.sessionNumber).toBe(3);
  await Promise.all([restored.close(), next.close()]);
});

test('Widevine pause and resume retain key inspection metadata', async () => {
  const engine = createWidevine();
  const original = engine.createSession();
  const keyId = '00112233445566778899aabbccddeeff';
  const key = {
    id: keyId,
    value: 'ffeeddccbbaa99887766554433221100',
    type: 'CONTENT',
    level: 'SW_SECURE_CRYPTO',
    trackLabel: 'HD',
    permissions: ['allowDecrypt'],
  };
  const state = { ...parseState(original.pause()), keys: { [keyId]: key } };
  await original.close();
  const restored = engine.resumeSession(JSON.stringify(state));
  const roundtrip = restored.pause();
  await restored.close();
  const session = engine.resumeSession(roundtrip);
  expect(await session.getKeys()).toEqual([expect.objectContaining(key)]);
  expect(session.keys.get(keyId)).toBe(key.value);
  await session.close();
});
