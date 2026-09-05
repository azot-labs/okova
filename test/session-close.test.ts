import { afterEach, expect, test, vi } from 'vitest';
import app from '../src/cli/commands/serve/api/session';
import { sessions } from '../src/cli/commands/serve/state';
import { Session } from '../src/lib/api';
import { EccKey } from '../src/lib/crypto/ecc-key';
import { Key } from '../src/lib/playready/key';
import { fromBase64, fromHex } from '../src/lib/utils';
import { PlayReadySession } from '../src/lib/playready/session';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import { Widevine } from '../src/lib/widevine/engine';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';
import { WidevineSession } from '../src/lib/widevine/session';

const KEY_ID = '00112233445566778899aabbccddeeff';
const KEY = 'ffeeddccbbaa99887766554433221100';
const credentials = new WidevineDeviceCredentials(
  ClientIdentification.create({
    token: SignedDrmCertificate.encode(
      SignedDrmCertificate.create({
        drmCertificate: DrmCertificate.encode(DrmCertificate.create({ systemId: 1 })).finish(),
      }),
    ).finish(),
  }),
);

const createSession = (kind: string) => {
  const engine = new Widevine({ deviceCredentials: credentials });
  const native =
    kind === 'widevine'
      ? engine.resumeSession(
          JSON.stringify({
            sessionId: 'close-test',
            sessionType: 'temporary',
            keys: { [KEY_ID]: { id: KEY_ID, value: KEY } },
            contexts: { request: { enc: 'AQ==', auth: 'Ag==' } },
            keyStatuses: { [KEY_ID]: 'usable' },
            initData: 'AQ==',
            initDataType: 'cenc',
          }),
        )
      : PlayReadySession.resume(
          JSON.stringify({
            sessionId: 'close-test',
            sessionType: 'temporary',
            keys: [{ keyId: KEY_ID, key: KEY, keyType: 1, cipherType: 3 }],
            initData: 'AQ==',
            initDataType: 'cenc',
            certificateChain: '',
            encryptionKey: Buffer.from(EccKey.generate().dumps()).toString('base64'),
            signingKey: Buffer.from(EccKey.generate().dumps()).toString('base64'),
            rgbMagicConstantZero: '',
            wmrmServerKey: { x: '1', y: '2' },
            clientVersion: 'test',
          }),
          {
            certificateChain: new Uint8Array(),
            encryptionKey: EccKey.generate().dumps(),
            signingKey: EccKey.generate().dumps(),
          },
        );
  return { native, engine, session: new Session('temporary', engine, native) };
};

afterEach(async () => {
  await sessions.clear();
  vi.restoreAllMocks();
});

for (const kind of ['widevine', 'playready']) {
  test.each(['close', 'delete'])(
    '%s releases a ' + kind + ' session and rejects subsequent HTTP operations',
    async (operation) => {
      const { session, native, engine } = createSession(kind);
      const sessionKey = `owner:${session.sessionId}`;
      sessions.set(sessionKey, session);
      const headers = { 'x-secret-key': 'owner', 'content-type': 'application/json' };
      const path = `/${session.sessionId}`;
      expect((await app.request(`${path}/keys`, { headers })).status).toBe(200);
      const response = await app.request(operation === 'close' ? `${path}/close` : path, {
        method: operation === 'close' ? 'POST' : 'DELETE',
        headers,
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(sessions.has(sessionKey)).toBe(false);
      expect(engine.sessions.size).toBe(0);
      for (const target of [session, native]) {
        expect(target.keys.size).toBe(0);
        expect(target.keyStatuses.size).toBe(0);
        expect(target.initData).toBeUndefined();
        expect(target.initDataType).toBeUndefined();
        expect(() => target.pause()).toThrow('Session closed');
        await expect(target.update(new Uint8Array())).rejects.toThrow('Session closed');
      }
      if (native instanceof WidevineSession) {
        expect(native.contexts.size).toBe(0);
        expect(native.serviceCertificate).toBeUndefined();
        await expect(native.getKeys()).rejects.toThrow('Session closed');
      }
      await expect(native.generateRequest(new Uint8Array())).rejects.toThrow('Session closed');
      await expect(native.waitForKeys()).rejects.toThrow('Session closed');
      await expect(session.waitForKeyStatusesChange()).rejects.toThrow('Session closed');
      await expect(session.waitForLicenseRequest()).rejects.toThrow('Session closed');
      for (const [suffix, method, body] of [
        ['/keys', 'GET', undefined],
        ['/close', 'POST', undefined],
        ['', 'DELETE', undefined],
        ['/generate-request', 'POST', JSON.stringify({ initData: 'AQ==' })],
        ['/update', 'POST', JSON.stringify({ response: 'AQ==' })],
      ]) {
        const result = await app.request(path + suffix, { method, headers, body });
        expect(result.status).toBe(400);
      }
    },
  );

  test(kind + ' close rejects pending key waits', async () => {
    const { native, session } = createSession(kind);
    native.keys.clear();
    session.keys.clear();
    const nativeWait = expect(native.waitForKeys()).rejects.toThrow('Session closed');
    const wrapperWait = expect(session.waitForKeyStatusesChange()).rejects.toThrow(
      'Session closed',
    );
    const messageWait = expect(session.waitForLicenseRequest()).rejects.toThrow('Session closed');
    await session.close();
    await Promise.all([nativeWait, wrapperWait, messageWait]);
  });
}

test('an in-flight PlayReady update cannot restore keys after close', async () => {
  const { native, session } = createSession('playready');
  if (!(native instanceof PlayReadySession)) throw new Error('Expected PlayReady');
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof native.parseLicense>>>();
  vi.spyOn(native, 'parseLicense').mockReturnValue(pending.promise);
  const update = expect(session.update(new Uint8Array())).rejects.toThrow('Session closed');
  await session.close();
  pending.resolve([new Key(fromHex(KEY_ID).toBuffer(), 1, 3, fromHex(KEY).toBuffer())]);
  await update;
  expect(session.keys.size).toBe(0);
  expect(native.keys.size).toBe(0);
});

test('an in-flight Widevine challenge cannot restore context after close', async () => {
  const { native, session } = createSession('widevine');
  if (!(native instanceof WidevineSession)) throw new Error('Expected Widevine');
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof credentials.signWithKey>>>();
  const started = Promise.withResolvers<void>();
  vi.spyOn(credentials, 'signWithKey').mockImplementation(() => {
    started.resolve();
    return pending.promise;
  });
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();
  const request = expect(native.generateRequest(initData)).rejects.toThrow('Session closed');
  await started.promise;
  await session.close();
  pending.resolve(new Uint8Array([1]));
  await request;
  expect(native.contexts.size).toBe(0);
  expect(native.initData).toBeUndefined();
});
