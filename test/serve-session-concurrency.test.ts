import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import sessionApi from '../src/cli/commands/serve/api/session';
import { SessionInputError } from '../src/lib/session-input-error';
import { InvalidLicense, ServerException } from '../src/lib/playready/exceptions';
import { config, sessions } from '../src/cli/commands/serve/state';
import { BaseMediaKeysEngine, BaseMediaKeysEngineSession, Session } from '../src/lib/api';

class TestSession extends BaseMediaKeysEngineSession {
  constructor(id = '') {
    super('temporary', id);
  }

  async generateRequest(initData: Uint8Array) {
    this.emitMessage({ message: new Uint8Array(initData), messageType: 'license-request' });
  }

  async update() {
    this.emitKeyStatusesChange();
  }

  async close() {
    this.dispatchEvent(new Event('closed'));
  }
}

class TestEngine extends BaseMediaKeysEngine {
  readonly keySystem = 'com.example.test';

  async setServerCertificate() {
    return true;
  }

  createSession() {
    return new TestSession();
  }
}

const originalConfig = structuredClone(config);

beforeEach(() => {
  config.users = {};
  config.public = true;
  config.forcePrivacyMode = false;
});

afterEach(async () => {
  vi.restoreAllMocks();
  await sessions.clear();
  Object.assign(config, originalConfig);
});

const openSession = (id = 'session', secret = '') => {
  const engine = new TestEngine();
  const native = new TestSession(id);
  const session = new Session('temporary', engine, native);
  sessions.set(`${secret}:${id}`, session);
  return { session, native };
};

const request = (operation: string, data = 'AQ==', id = 'session', secret = '') =>
  sessionApi.request(`/${id}${operation === 'delete' ? '' : `/${operation}`}`, {
    method: operation === 'delete' ? 'DELETE' : 'POST',
    headers: { 'Content-Type': 'application/json', 'x-secret-key': secret },
    body: JSON.stringify({ initData: data, response: data }),
  });

test('rejects a second challenge and allows a retry with its own initialization data', async () => {
  const { native } = openSession();
  const started = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const generate = native.generateRequest.bind(native);
  const generateSpy = vi.spyOn(native, 'generateRequest').mockImplementationOnce(async (data) => {
    started.resolve();
    await release.promise;
    await generate(data);
  });
  const first = request('generate-request', 'AQ==');
  await started.promise;
  try {
    const second = await request('generate-request', 'Ag==');
    expect(second.status).toBe(409);
    expect(await second.json()).toEqual({
      error: 'Session is busy. Retry after the current operation completes.',
    });
    expect(generateSpy).toHaveBeenCalledOnce();

    // Another user can use even the same session ID while this request is pending.
    config.users['other-user'] = { name: 'other', credentials: [] };
    openSession('session', 'other-user');
    expect((await request('generate-request', 'Aw==', 'session', 'other-user')).status).toBe(200);
  } finally {
    release.resolve();
  }
  expect(await (await first).json()).toMatchObject({ message: 'AQ==' });
  const retry = await request('generate-request', 'Ag==');
  expect(retry.status).toBe(200);
  expect(await retry.json()).toMatchObject({ message: 'Ag==' });
});

test.each(['generate-request', 'update', 'close', 'delete'])(
  'rejects %s during an update and allows close after the update finishes',
  async (operation) => {
    const { native } = openSession();
    const started = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const update = native.update.bind(native);
    vi.spyOn(native, 'update').mockImplementationOnce(async () => {
      started.resolve();
      await release.promise;
      await update();
    });
    const pending = request('update');
    await started.promise;
    try {
      expect((await request(operation)).status).toBe(409);
      expect(sessions.has(':session')).toBe(true);
    } finally {
      release.resolve();
    }
    expect((await pending).status).toBe(200);
    expect((await request('close')).status).toBe(200);
    expect(sessions.has(':session')).toBe(false);
  },
);

test.each(['close', 'delete'])('rejects updates while %s is pending', async (operation) => {
  const { native } = openSession();
  const started = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const close = native.close.bind(native);
  vi.spyOn(native, 'close').mockImplementationOnce(async () => {
    started.resolve();
    await release.promise;
    await close();
  });
  const pending = request(operation);
  await started.promise;
  try {
    expect((await request('update')).status).toBe(409);
  } finally {
    release.resolve();
  }
  expect((await pending).status).toBe(200);
  expect((await request('update')).status).toBe(400);
});

test('releases mutation ownership after a failed challenge or invalid request', async () => {
  const { native } = openSession();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(native, 'generateRequest').mockRejectedValueOnce(new Error('Challenge failed'));
  expect((await request('generate-request')).status).toBe(500);
  expect(sessions.has(':session')).toBe(false);
  expect((await request('generate-request')).status).toBe(400);
  openSession();
  const invalid = await sessionApi.request('/session/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  expect(invalid.status).toBe(400);
  expect((await request('update')).status).toBe(200);
});

test('rejects unsupported init data before mutating the session and permits retry', async () => {
  const { native } = openSession();
  const generate = vi.spyOn(native, 'generateRequest');
  const result = await sessionApi.request('/session/generate-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initDataType: 'webm', initData: 'AQ==' }),
  });
  expect(result.status).toBe(400);
  expect(generate).not.toHaveBeenCalled();
  expect((await request('generate-request')).status).toBe(200);
});

test.each([
  new SessionInputError('private input'),
  new InvalidLicense('private license'),
  new ServerException('private fault'),
  new Error('private internal'),
])('maps update errors without exposing payloads: %s', async (error) => {
  const { native } = openSession();
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(native, 'update').mockRejectedValueOnce(error);
  const result = await request('update');
  expect(result.status).toBe(
    error instanceof ServerException ? 502 : error.constructor === Error ? 500 : 400,
  );
  expect(JSON.stringify(await result.json())).not.toContain('private');
  expect(JSON.stringify(log.mock.calls)).not.toContain('private');
  expect((await request('update')).status).toBe(200);
});

test.each([false, true])(
  'closes generation after a message deadline, stalled generator: %s',
  async (stalled) => {
    vi.useFakeTimers();
    try {
      const { native } = openSession();
      const started = Promise.withResolvers<void>();
      const resume = Promise.withResolvers<void>();
      vi.spyOn(native, 'generateRequest').mockImplementationOnce(async () => {
        started.resolve();
        if (stalled) await resume.promise;
      });
      const close = vi.spyOn(native, 'close');
      const pending = request('generate-request');
      await started.promise;
      await vi.advanceTimersByTimeAsync(5_000);
      const result = await pending;
      expect(result.status).toBe(504);
      expect(sessions.has(':session')).toBe(false);
      expect(close).toHaveBeenCalledOnce();
      resume.resolve();
    } finally {
      vi.useRealTimers();
    }
  },
);
