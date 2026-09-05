import { cbc, ctr } from '@noble/ciphers/aes.js';
import { describe, expect, test, vi } from 'vitest';
import { fetchDecryptionKeys } from '../src/lib/main';
import {
  BaseMediaKeysEngine,
  BaseMediaKeysEngineSession,
  requestMediaKeySystemAccess,
  Session,
  setSupportedEngines,
  waitForKeys,
  type EncryptedPacket,
} from '../src/lib/api';
import { fromBuffer, fromHex, parseBufferSource } from '../src/lib/utils';

const KEY_ID = '00112233445566778899aabbccddeeff';
const KEY_VALUE = 'ffeeddccbbaa99887766554433221100';
const LICENSE_REQUEST = new Uint8Array([1, 2, 3, 4]);

class FakeEngineSession extends BaseMediaKeysEngineSession {
  readonly sessionId = 'fake-session-id';
  lastGeneratedRequest?: { initData: Uint8Array; initDataType: string };
  lastUpdatedResponse?: Uint8Array;

  constructor(sessionType: MediaKeySessionType = 'temporary') {
    super(sessionType);
  }

  async generateRequest(initData: Uint8Array, initDataType: string = 'cenc') {
    this.lastGeneratedRequest = { initData, initDataType };
    this.emitMessage({
      message: LICENSE_REQUEST,
      messageType: 'license-request',
    });
  }

  async update(response: Uint8Array) {
    this.lastUpdatedResponse = response;
    this.keys.set(KEY_ID, KEY_VALUE);
    this.keyStatuses.set(KEY_ID, 'usable');
    this.emitKeysChange();
    this.emitKeyStatusesChange();
  }

  async close() {
    this.dispatchEvent(new Event('closed'));
  }

  async remove() {}

  pause() {
    return 'paused-state';
  }
}

class FakeEngine extends BaseMediaKeysEngine {
  readonly keySystem: string;

  serverCertificate?: Uint8Array;

  constructor(keySystem = 'com.example.fake') {
    super();
    this.keySystem = keySystem;
  }

  async setServerCertificate(serverCertificate: Uint8Array): Promise<boolean> {
    this.serverCertificate = serverCertificate;
    return true;
  }

  async createSession(sessionType: MediaKeySessionType = 'temporary') {
    return new FakeEngineSession(sessionType);
  }
}

describe.each(['successful', 'failed'])('fetchDecryptionKeys with %s cleanup', (cleanup) => {
  test.each(['success', 'generateRequest', 'fetch', 'update'] as const)(
    'closes its session after %s',
    async (outcome) => {
      const engine = new FakeEngine();
      const session = new FakeEngineSession();
      vi.spyOn(engine, 'createSession').mockResolvedValue(session);
      const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response());
      const failure = new Error('License flow failed');
      if (outcome === 'fetch') {
        fetchImpl.mockRejectedValue(failure);
      } else if (outcome !== 'success') {
        vi.spyOn(session, outcome).mockRejectedValue(failure);
      }

      const { promise: closeFinished, resolve: finishClose } = Promise.withResolvers<void>();
      const { promise: closeStarted, resolve: startClose } = Promise.withResolvers<void>();
      const closeSession = session.close.bind(session);
      const close = vi.spyOn(session, 'close').mockImplementation(async () => {
        startClose();
        await closeFinished;
        await closeSession();
        if (cleanup === 'failed') throw new Error('Session close failed');
      });
      let isSettled = false;
      const result = fetchDecryptionKeys({
        cdm: engine,
        pssh: 'AQ==',
        server: 'https://license.example.test',
        fetch: fetchImpl,
      }).finally(() => {
        isSettled = true;
      });
      const assertion =
        outcome === 'success'
          ? expect(result).resolves.toEqual(new Map([[KEY_ID, KEY_VALUE]]))
          : expect(result).rejects.toBe(failure);

      await closeStarted;
      expect(isSettled).toBe(false);
      finishClose();
      await assertion;
      expect(close).toHaveBeenCalledOnce();
    },
  );
});

describe('waitForKeys', () => {
  test('resolves immediately when keys already exist', async () => {
    const keys = new Map([[KEY_ID, KEY_VALUE]]);
    await expect(waitForKeys(new EventTarget(), () => keys)).resolves.toEqual(keys);
  });

  test('rejects when aborted before waiting starts', async () => {
    const controller = new AbortController();
    controller.abort(new Error('stop waiting'));

    await expect(
      waitForKeys(new EventTarget(), () => new Map(), { signal: controller.signal }),
    ).rejects.toThrow('stop waiting');
  });

  test('rejects when waiting times out', async () => {
    await expect(waitForKeys(new EventTarget(), () => new Map(), { timeoutMs: 5 })).rejects.toThrow(
      'Timed out after 5ms waiting for keys',
    );
  });
});

describe('Session', () => {
  test('key statuses match fresh buffers and views by bytes and expose read-only iteration', async () => {
    const native = new FakeEngineSession();
    const session = new Session('temporary', new FakeEngine(), native);
    const statuses = session.keyStatuses;
    expect(statuses.size).toBe(0);
    expect([...statuses]).toEqual([]);
    await session.update(new Uint8Array());
    const kid = Uint8Array.from(fromHex(KEY_ID).toBuffer());
    const padded = new Uint8Array(20);
    padded.set(kid, 2);
    for (const lookup of [kid, kid.buffer, new DataView(padded.buffer, 2, 16)]) {
      expect(statuses.get(lookup)).toBe('usable');
      expect(statuses.has(lookup)).toBe(true);
    }
    expect(statuses.has(new Uint8Array(16))).toBe(false);
    expect(statuses.get(new Uint8Array(16))).toBeUndefined();
    expect(statuses).not.toHaveProperty('set');
    expect(statuses).not.toHaveProperty('clear');
    const callback = vi.fn();
    const receiver = {};
    statuses.forEach(callback, receiver);
    expect(callback).toHaveBeenCalledWith('usable', expect.any(ArrayBuffer), statuses);
    expect(callback.mock.contexts).toEqual([receiver]);
    expect([...statuses.values()]).toEqual(['usable']);
    expect([...statuses.entries()]).toEqual([[kid.buffer, 'usable']]);
    const exposed = statuses.keys().next().value;
    if (!(exposed instanceof ArrayBuffer)) throw new Error('Expected key bytes');
    new Uint8Array(exposed).fill(0);
    expect(statuses.get(kid)).toBe('usable');
    native.dispatchEvent(
      new CustomEvent('keystatuseschange', {
        detail: { keys: new Map(), keyStatuses: new Map() },
      }),
    );
    expect(session.keyStatuses).toBe(statuses);
    expect(statuses.size).toBe(0);
    await session.close();
  });

  test('concurrent and repeated close call the engine once and preserve the closed promise', async () => {
    const native = new FakeEngineSession();
    const engineSession = Promise.withResolvers<FakeEngineSession>();
    const session = new Session('temporary', new FakeEngine(), engineSession.promise);
    const closed = session.closed;
    const close = vi.spyOn(native, 'close');
    const first = session.close();
    const second = session.close();
    engineSession.resolve(native);
    await Promise.all([first, second]);
    await session.close();
    expect(close).toHaveBeenCalledOnce();
    expect(session.closed).toBe(closed);
    await expect(closed).resolves.toBe('closed-by-application');
  });

  test('a failed close can be retried', async () => {
    const native = new FakeEngineSession();
    const close = vi.spyOn(native, 'close').mockRejectedValueOnce(new Error('Close failed'));
    const session = new Session('temporary', new FakeEngine(), native);
    await expect(session.close()).rejects.toThrow('Close failed');
    await session.close();
    expect(close).toHaveBeenCalledTimes(2);
    await expect(session.closed).resolves.toBe('closed-by-application');
  });

  test('waits for future license requests and syncs key status updates', async () => {
    const engine = new FakeEngine();
    const session = new Session('temporary', engine);
    const initData = new Uint8Array([9, 8, 7]);

    const pendingLicenseRequest = session.waitForLicenseRequest();
    const pendingKeyStatuses = session.waitForKeyStatusesChange();

    await session.generateRequest('cenc', initData);
    expect(Array.from(await pendingLicenseRequest)).toEqual(Array.from(LICENSE_REQUEST));

    await session.update(new Uint8Array([6, 5, 4]));
    const keys = await pendingKeyStatuses;
    expect(keys.get(KEY_ID)).toBe(KEY_VALUE);

    const [storedKeyId, status] = Array.from(session.keyStatuses.entries())[0]!;
    expect(fromBuffer(parseBufferSource(storedKeyId)).toHex()).toBe(KEY_ID);
    expect(status).toBe('usable');

    expect(session.pause()).toBe('paused-state');
  });

  test('replays queued license requests', async () => {
    const nativeSession = new FakeEngineSession();
    const session = new Session('temporary', new FakeEngine(), nativeSession);

    await session.generateRequest('cenc', new Uint8Array([1]));

    expect(Array.from(await session.waitForLicenseRequest())).toEqual(Array.from(LICENSE_REQUEST));
  });

  test('preserves already available key snapshots after close', async () => {
    const session = new Session('temporary', new FakeEngine());
    await session.update(new Uint8Array([1]));
    const keys = await session.waitForKeyStatusesChange();

    await session.close();

    expect(session.keys.size).toBe(0);
    expect(keys).toEqual(new Map([[KEY_ID, KEY_VALUE]]));
    await expect(session.waitForKeyStatusesChange()).rejects.toThrow('Session closed');
  });

  test('rejects new work after close', async () => {
    const session = new Session('temporary', new FakeEngine());

    await session.close();

    await expect(session.generateRequest('cenc', new Uint8Array([1]))).rejects.toThrow(
      'Session closed',
    );
  });

  test('resolves closed when remove transitions the session to closed', async () => {
    const session = new Session('temporary', new FakeEngine());

    await session.remove();

    await expect(session.closed).resolves.toBe('closed-by-application');
    await expect(session.generateRequest('cenc', new Uint8Array([1]))).rejects.toThrow(
      'Session closed',
    );
  });
});

describe('BaseMediaKeysEngineSession', () => {
  test('decrypts cenc packets with stored content keys', async () => {
    const session = new FakeEngineSession();
    await session.update(new Uint8Array([1]));

    const iv = Uint8Array.from([
      0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe, 0xef, 0xcd, 0xab, 0x89, 0x67, 0x45, 0x23,
      0x01,
    ]);
    const plaintext = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const encrypted = ctr(fromHex(KEY_VALUE).toBuffer(), iv).encrypt(plaintext);

    const packet: EncryptedPacket = {
      data: encrypted,
      keyId: KEY_ID,
      psshBoxes: [],
      scheme: 'cenc',
      iv,
      timestamp: 123,
      subsamples: null,
      pattern: null,
    };

    await expect(session.decrypt(packet)).resolves.toEqual(plaintext);
  });

  test('decrypts cbcs packets with stored content keys', async () => {
    const session = new FakeEngineSession();
    await session.update(new Uint8Array([1]));

    const iv = Uint8Array.from([
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32,
      0x10,
    ]);
    const plaintext = Uint8Array.from([
      0x7a, 0x42, 0x19, 0xd0, 0x11, 0x22, 0x33, 0x44, 0x95, 0x86, 0x77, 0x68, 0x59, 0x4a, 0x3b,
      0x2c,
    ]);
    const encrypted = cbc(fromHex(KEY_VALUE).toBuffer(), iv, { disablePadding: true }).encrypt(
      plaintext,
    );

    const packet: EncryptedPacket = {
      data: encrypted,
      keyId: KEY_ID,
      psshBoxes: [],
      scheme: 'cbcs',
      iv,
      timestamp: 456,
      subsamples: [{ clearLen: 0, protectedLen: encrypted.byteLength }],
      pattern: { cryptByteBlock: 1, skipByteBlock: 0 },
    };

    await expect(session.decrypt(packet)).resolves.toEqual(plaintext);
  });
});

describe('requestMediaKeySystemAccess', () => {
  test('wraps the registered engine', async () => {
    const engine = new FakeEngine('com.example.registered');
    setSupportedEngines([engine]);

    const configuration = { label: 'default' } as MediaKeySystemConfiguration;
    const access = requestMediaKeySystemAccess(engine.keySystem, [configuration]);
    const mediaKeys = await access.createMediaKeys();

    expect(access.getConfiguration()).toBe(configuration);
    expect(await mediaKeys.getStatusForPolicy()).toBe('usable');
    expect(await mediaKeys.setServerCertificate(new Uint8Array([4, 2]).buffer)).toBe(true);
    expect(Array.from(engine.serverCertificate ?? [])).toEqual([4, 2]);
    expect(mediaKeys.createSession()).toBeInstanceOf(Session);
  });

  test('throws when the media key system is not registered', () => {
    setSupportedEngines([]);
    expect(() => requestMediaKeySystemAccess('com.example.missing', [])).toThrow(
      'Unsupported media key system',
    );
  });
});
