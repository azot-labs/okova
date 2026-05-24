import { describe, expect, test } from 'vitest';
import {
  requestMediaKeySystemAccess,
  Session,
  setSupportedEngines,
  waitForKeys,
  type MediaKeyMessageEventInit,
  type MediaKeysEngine,
  type MediaKeysEngineSession,
  type MediaKeysMap,
  type MediaKeyStatusesChangeEventInit,
} from '../src/lib/api';
import { fromBuffer } from '../src/lib/utils';

const KEY_ID = '00112233445566778899aabbccddeeff';
const KEY_VALUE = 'ffeeddccbbaa99887766554433221100';
const LICENSE_REQUEST = new Uint8Array([1, 2, 3, 4]);

class FakeEngineSession extends EventTarget implements MediaKeysEngineSession {
  readonly sessionId = 'fake-session-id';
  readonly sessionType: MediaKeySessionType;
  readonly keyStatuses = new Map<string, MediaKeyStatus>();
  readonly keys: MediaKeysMap = new Map();

  onmessage:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyMessageEventInit>) => any)
    | null = null;
  onkeyschange: ((this: MediaKeysEngineSession, ev: Event) => any) | null = null;
  onkeystatuseschange:
    | ((this: MediaKeysEngineSession, ev: CustomEvent<MediaKeyStatusesChangeEventInit>) => any)
    | null = null;

  lastGeneratedRequest?: { initData: Uint8Array; initDataType: string };
  lastUpdatedResponse?: Uint8Array;

  constructor(sessionType: MediaKeySessionType = 'temporary') {
    super();
    this.sessionType = sessionType;
  }

  async generateRequest(initData: Uint8Array, initDataType: string = 'cenc') {
    this.lastGeneratedRequest = { initData, initDataType };
    this.#emitMessage({
      message: LICENSE_REQUEST,
      messageType: 'license-request',
    });
  }

  async update(response: Uint8Array) {
    this.lastUpdatedResponse = response;
    this.keys.set(KEY_ID, KEY_VALUE);
    this.keyStatuses.set(KEY_ID, 'usable');

    const keysChangeEvent = new Event('keyschange');
    this.dispatchEvent(keysChangeEvent);
    this.onkeyschange?.call(this, keysChangeEvent);

    const keyStatusesChangeEvent = new CustomEvent<MediaKeyStatusesChangeEventInit>(
      'keystatuseschange',
      {
        detail: {
          keys: new Map(this.keys),
          keyStatuses: new Map(this.keyStatuses),
        },
      },
    );
    this.dispatchEvent(keyStatusesChangeEvent);
    this.onkeystatuseschange?.call(this, keyStatusesChangeEvent);
  }

  async close() {
    this.dispatchEvent(new Event('closed'));
  }

  async remove() {}

  pause() {
    return 'paused-state';
  }

  waitForKeys() {
    return waitForKeys(this, () => this.keys);
  }

  #emitMessage(detail: MediaKeyMessageEventInit) {
    const event = new CustomEvent<MediaKeyMessageEventInit>('message', { detail });
    this.dispatchEvent(event);
    this.onmessage?.call(this, event);
  }
}

class FakeEngine implements MediaKeysEngine {
  readonly keySystem: string;

  serverCertificate?: Uint8Array;

  constructor(keySystem = 'com.example.fake') {
    this.keySystem = keySystem;
  }

  async getStatusForPolicy(): Promise<MediaKeyStatus> {
    return 'usable';
  }

  async setServerCertificate(serverCertificate: Uint8Array): Promise<boolean> {
    this.serverCertificate = serverCertificate;
    return true;
  }

  async createSession(sessionType: MediaKeySessionType = 'temporary') {
    return new FakeEngineSession(sessionType);
  }
}

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
    expect(fromBuffer(storedKeyId as Uint8Array).toHex()).toBe(KEY_ID);
    expect(status).toBe('usable');

    expect(session.pause()).toBe('paused-state');
  });

  test('replays queued license requests', async () => {
    const nativeSession = new FakeEngineSession();
    const session = new Session('temporary', new FakeEngine(), nativeSession);

    await session.generateRequest('cenc', new Uint8Array([1]));

    expect(Array.from(await session.waitForLicenseRequest())).toEqual(Array.from(LICENSE_REQUEST));
  });

  test('rejects new work after close', async () => {
    const session = new Session('temporary', new FakeEngine());

    await session.close();

    await expect(session.generateRequest('cenc', new Uint8Array([1]))).rejects.toThrow(
      'Session closed',
    );
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
