import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { browser, type Browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing';
import background from '../src/extension/entrypoints/background';
import { appStorage } from '../src/extension/utils/storage';
import * as certificateUtils from '../src/lib/widevine/certificate';
import { fromBase64, fromBuffer } from '../src/lib/utils';
import {
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
  EncryptedClientIdentification,
  LicenseRequest,
  SignedMessage,
} from '../src/lib/widevine/proto';
import { Session, setSupportedEngines } from '../src/lib/api';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import { Widevine } from '../src/lib/widevine/engine';

vi.mock('../src/lib/widevine/device-credentials', () => ({
  WidevineDeviceCredentials: class {
    async pack() {
      return new Uint8Array();
    }
  },
}));

const sessions: Session[] = [];
const tab = (id: number): Browser.tabs.Tab => ({
  id,
  index: 0,
  pinned: false,
  highlighted: false,
  windowId: 1,
  active: true,
  incognito: false,
  selected: true,
  discarded: false,
  autoDiscardable: true,
  groupId: -1,
  frozen: false,
});

beforeEach(async () => {
  fakeBrowser.reset();
  vi.useFakeTimers();
  await appStorage.settings.setValue({
    spoofing: true,
    emeInterception: true,
    requestInterception: false,
    theme: 'auto',
  });
  vi.spyOn(appStorage.clients.active, 'getValue').mockResolvedValue(
    new WidevineDeviceCredentials(new Uint8Array()),
  );
  vi.spyOn(browser.tabs, 'query').mockImplementation(async () => []);
  vi.spyOn(browser.action, 'setBadgeText').mockResolvedValue();
  sessions.length = 0;
  vi.spyOn(Session.prototype, 'generateRequest').mockImplementation(async function (this: Session) {
    sessions.push(this);
  });
  vi.spyOn(Session.prototype, 'pause').mockReturnValue('{}');
  vi.spyOn(Session.prototype, 'close').mockResolvedValue();
  vi.spyOn(Session.prototype, 'update').mockResolvedValue();
  vi.spyOn(Session.prototype, 'waitForLicenseRequest').mockImplementation(
    async function (this: Session) {
      return new TextEncoder().encode(this.sessionId);
    },
  );
  vi.spyOn(Session.prototype, 'waitForKeyStatusesChange').mockResolvedValue(
    new Map([['00112233445566778899aabbccddeeff', 'ffeeddccbbaa99887766554433221100']]),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  setSupportedEngines([]);
});

const startBackground = () => {
  const addListener = vi.spyOn(browser.runtime.onMessage, 'addListener');
  background.main();
  const listener = addListener.mock.calls.at(-1)![0];
  return (
    action: string,
    sessionToken: string,
    sender: Browser.runtime.MessageSender = {},
    message: Record<string, unknown> = {},
  ) =>
    new Promise<unknown>((resolve) => {
      listener(
        {
          action,
          sessionToken,
          initData: 'cHNzaA==',
          initDataType: 'cenc',
          url: 'https://example.com/video',
          message: { 0: 8, 1: 2 },
          ...message,
        },
        sender,
        resolve,
      );
    });
};

const getSessionClient = (index: number) => {
  const engine = sessions[index]?.engine;
  if (!(engine instanceof Widevine)) throw new Error('Expected a Widevine session');
  return engine.deviceCredentials;
};

test('new sessions use the current client while existing sessions retain their credentials', async () => {
  const firstClient = new WidevineDeviceCredentials(new Uint8Array());
  const secondClient = new WidevineDeviceCredentials(new Uint8Array());
  const getClient = vi.mocked(appStorage.clients.active.getValue);
  getClient.mockResolvedValue(firstClient);
  const send = startBackground();
  await send('generateRequest', 'first');
  expect(getSessionClient(0)).toBe(firstClient);

  getClient.mockResolvedValue(secondClient);
  await send('generateRequest', 'second');
  expect(getSessionClient(1)).toBe(secondClient);
  await expect(send('license-request', 'first')).resolves.toBe(btoa(sessions[0]!.sessionId));
  expect(getSessionClient(0)).toBe(firstClient);

  getClient.mockResolvedValue(null);
  await send('generateRequest', 'unselected');
  expect(sessions).toHaveLength(2);
  await expect(send('license-request', 'unselected')).resolves.toBeUndefined();

  getClient.mockResolvedValue(firstClient);
  await send('generateRequest', 'reselected');
  expect(sessions).toHaveLength(3);
  expect(getSessionClient(2)).toBe(firstClient);
  await send('close', 'first');
  await send('close', 'second');
  await send('close', 'reselected');
});

test('a pending client load cannot replace the selection used by later sessions', async () => {
  const firstClient = new WidevineDeviceCredentials(new Uint8Array());
  const secondClient = new WidevineDeviceCredentials(new Uint8Array());
  const pendingClient = Promise.withResolvers<WidevineDeviceCredentials>();
  const loadStarted = Promise.withResolvers<void>();
  vi.mocked(appStorage.clients.active.getValue)
    .mockImplementationOnce(() => {
      loadStarted.resolve();
      return pendingClient.promise;
    })
    .mockResolvedValue(secondClient);
  const send = startBackground();
  const firstRequest = send('generateRequest', 'first');
  await loadStarted.promise;
  await send('generateRequest', 'second');
  expect(getSessionClient(0)).toBe(secondClient);

  pendingClient.resolve(firstClient);
  await firstRequest;
  await send('generateRequest', 'third');
  expect(sessions).toHaveLength(3);
  expect(getSessionClient(2)).toBe(secondClient);
  await send('close', 'first');
  await send('close', 'second');
  await send('close', 'third');
});

test('same-PSSH sessions keep their challenges and updates across tabs, frames and documents', async () => {
  const send = startBackground();
  const owners = [
    { token: 'first', sender: { tab: tab(1), frameId: 0, documentId: 'one' } },
    { token: 'second', sender: { tab: tab(1), frameId: 0, documentId: 'one' } },
    { token: 'first', sender: { tab: tab(2), frameId: 0, documentId: 'two' } },
    { token: 'first', sender: { tab: tab(1), frameId: 1, documentId: 'three' } },
    { token: 'first', sender: { tab: tab(1), frameId: 0, documentId: 'four' } },
  ];
  await Promise.all(owners.map(({ token, sender }) => send('generateRequest', token, sender)));
  expect(new Set(sessions).size).toBe(owners.length);

  for (const [index, { token, sender }] of owners.entries()) {
    await expect(send('license-request', token, sender)).resolves.toBe(
      btoa(sessions[index]!.sessionId),
    );
  }
  for (const [index, { token, sender }] of [...owners.entries()].reverse()) {
    await expect(send('update', token, sender)).resolves.toMatchObject({ keys: expect.any(Array) });
    expect(vi.mocked(Session.prototype.update).mock.contexts.at(-1)).toBe(sessions[index]);
    expect(vi.mocked(Session.prototype.close).mock.contexts.at(-1)).toBe(sessions[index]);
  }
  expect(Session.prototype.close).toHaveBeenCalledTimes(owners.length);
  expect(vi.getTimerCount()).toBe(0);
});

test('retains the session for a service certificate and cleans up failed license parsing', async () => {
  const send = startBackground();
  await send('generateRequest', 'one');
  await send('update', 'one', {}, { message: { 0: 8, 1: 5 } });
  expect(Session.prototype.close).not.toHaveBeenCalled();
  expect(Session.prototype.waitForKeyStatusesChange).not.toHaveBeenCalled();
  await expect(send('license-request', 'one')).resolves.toEqual(expect.any(String));

  const licenseUpdate = Promise.withResolvers<void>();
  const updateStarted = Promise.withResolvers<void>();
  vi.mocked(Session.prototype.update).mockImplementationOnce(() => {
    updateStarted.resolve();
    return licenseUpdate.promise;
  });
  const updating = send('update', 'one');
  await updateStarted.promise;
  expect(Session.prototype.waitForKeyStatusesChange).not.toHaveBeenCalled();
  expect(Session.prototype.close).not.toHaveBeenCalled();

  licenseUpdate.reject(new Error('Invalid license'));
  await expect(updating).resolves.toBeUndefined();
  expect(Session.prototype.waitForKeyStatusesChange).not.toHaveBeenCalled();
  expect(Session.prototype.close).toHaveBeenCalledOnce();
  await expect(send('license-request', 'one')).resolves.toBeUndefined();
  expect(vi.getTimerCount()).toBe(0);
});

test('cleans up failed generation, explicit close and abandoned sessions', async () => {
  const send = startBackground();
  vi.mocked(Session.prototype.generateRequest).mockRejectedValueOnce(new Error('Invalid PSSH'));
  await expect(send('generateRequest', 'failed')).resolves.toBeUndefined();
  expect(Session.prototype.close).toHaveBeenCalledOnce();
  await send('generateRequest', 'closed');
  await send('close', 'closed');
  await expect(send('license-request', 'closed')).resolves.toBeUndefined();
  await send('generateRequest', 'abandoned');
  await vi.advanceTimersByTimeAsync(5 * 60_000);
  await expect(send('license-request', 'abandoned')).resolves.toBeUndefined();
  expect(Session.prototype.close).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});

test.each(['license-request', 'update', 'keystatuseschange'])(
  'refreshes only the active session timeout on %s',
  async (action) => {
    const send = startBackground();
    await send('generateRequest', 'active');
    await send('generateRequest', 'idle');
    await vi.advanceTimersByTimeAsync(4 * 60_000);
    await send(
      action,
      'active',
      {},
      {
        message: { 0: 8, 1: 5 }, // A service certificate keeps the license flow open.
        keyStatuses: {},
      },
    );

    await vi.advanceTimersByTimeAsync(60_000);
    expect(Session.prototype.close).toHaveBeenCalledOnce();
    expect(vi.mocked(Session.prototype.close).mock.contexts[0]).toBe(sessions[1]);
    expect(vi.getTimerCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(4 * 60_000 - 1);
    expect(Session.prototype.close).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect(Session.prototype.close).toHaveBeenCalledTimes(2);
    expect(vi.mocked(Session.prototype.close).mock.contexts[1]).toBe(sessions[0]);
    expect(vi.getTimerCount()).toBe(0);
  },
);

test.each(['navigation', 'removal'])('cleans up only the affected tab on %s', async (action) => {
  const updated = vi.spyOn(browser.tabs.onUpdated, 'addListener');
  const removed = vi.spyOn(browser.tabs.onRemoved, 'addListener');
  const send = startBackground();
  await send('generateRequest', 'one', { tab: tab(1) });
  await send('generateRequest', 'two', { tab: tab(2) });
  if (action === 'navigation') {
    updated.mock.calls[0]![0](1, { status: 'loading' }, tab(1));
  } else {
    removed.mock.calls[0]![0](1, { windowId: 1, isWindowClosing: false });
  }
  await expect(send('license-request', 'one', { tab: tab(1) })).resolves.toBeUndefined();
  await expect(send('license-request', 'two', { tab: tab(2) })).resolves.toEqual(
    expect.any(String),
  );
  expect(Session.prototype.close).toHaveBeenCalledOnce();
  await send('close', 'two', { tab: tab(2) });
});

const SERVICE_CERTIFICATE = `CAUSxQUKvwIIAxIQKHA0VMAI9jYYredEPbbEyBiL5/mQBSKOAjCCAQoCggEBALUhErjQXQI/zF2V4sJRwcZJtBd82NK+7zVbsGdD3mYePSq8MYK3mUbVX9wI3+lUB4FemmJ0syKix/XgZ7tfCsB6idRa6pSyUW8HW2bvgR0NJuG5priU8rmFeWKqFxxPZmMNPkxgJxiJf14e+baq9a1Nuip+FBdt8TSh0xhbWiGKwFpMQfCB7/+Ao6BAxQsJu8dA7tzY8U1nWpGYD5LKfdxkagatrVEB90oOSYzAHwBTK6wheFC9kF6QkjZWt9/v70JIZ2fzPvYoPU9CVKtyWJOQvuVYCPHWaAgNRdiTwryi901goMDQoJk87wFgRwMzTDY4E5SGvJ2vJP1noH+a2UMCAwEAAToSc3RhZ2luZy5nb29nbGUuY29tEoADmD4wNSZ19AunFfwkm9rl1KxySaJmZSHkNlVzlSlyH/iA4KrvxeJ7yYDa6tq/P8OG0ISgLIJTeEjMdT/0l7ARp9qXeIoA4qprhM19ccB6SOv2FgLMpaPzIDCnKVww2pFbkdwYubyVk7jei7UPDe3BKTi46eA5zd4Y+oLoG7AyYw/pVdhaVmzhVDAL9tTBvRJpZjVrKH1lexjOY9Dv1F/FJp6X6rEctWPlVkOyb/SfEJwhAa/K81uDLyiPDZ1Flg4lnoX7XSTb0s+Cdkxd2b9yfvvpyGH4aTIfat4YkF9Nkvmm2mU224R1hx0WjocLsjA89wxul4TJPS3oRa2CYr5+DU4uSgdZzvgtEJ0lksckKfjAF0K64rPeytvDPD5fS69eFuy3Tq26/LfGcF96njtvOUA4P5xRFtICogySKe6WnCUZcYMDtQ0BMMM1LgawFNg4VA+KDCJ8ABHg9bOOTimO0sswHrRWSWX1XF15dXolCk65yEqz5lOfa2/fVomeopkU`;

test.each([
  'setServerCertificate',
  'update',
  'late certificate',
  'replacement wrapped',
  'replacement unwrapped',
])(
  'returns the encrypted challenge after %s without leaking into another session',
  async (delivery) => {
    vi.mocked(Session.prototype.generateRequest).mockRestore();
    vi.mocked(Session.prototype.waitForLicenseRequest).mockRestore();
    vi.mocked(Session.prototype.update).mockRestore();
    const encryptId = vi.fn(async (certificate: SignedDrmCertificate) =>
      EncryptedClientIdentification.create({
        providerId: DrmCertificate.decode(certificate.drmCertificate).providerId,
        encryptedClientId: new Uint8Array([1, 2, 3]),
      }),
    );
    vi.mocked(appStorage.clients.active.getValue).mockResolvedValue(
      Object.assign(new WidevineDeviceCredentials(new Uint8Array()), {
        id: ClientIdentification.create({}),
        encryptId,
        signWithKey: async () => new Uint8Array([0xaa]),
      }),
    );
    const send = startBackground();
    const initData =
      'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==';
    await send(
      'generateRequest',
      'private',
      {},
      {
        initData,
        serverCertificate: delivery === 'setServerCertificate' ? SERVICE_CERTIFICATE : undefined,
      },
    );
    await send('generateRequest', 'other', {}, { initData });
    const isReplacement = delivery.startsWith('replacement');
    if (isReplacement) {
      const { signedDrmCertificate, drmCertificate } =
        await certificateUtils.parseCertificate(SERVICE_CERTIFICATE);
      drmCertificate.providerId = 'previous.example.com';
      signedDrmCertificate.drmCertificate = DrmCertificate.encode(drmCertificate).finish();
      // Only the synthetic previous certificate bypasses signature verification.
      vi.spyOn(certificateUtils, 'verifyCertificate').mockResolvedValueOnce(true);
      await send(
        'update',
        'private',
        {},
        {
          message: SignedMessage.encode({
            type: SignedMessage.MessageType.SERVICE_CERTIFICATE,
            msg: SignedDrmCertificate.encode(signedDrmCertificate).finish(),
          }).finish(),
        },
      );
      expect(encryptId).toHaveBeenCalledTimes(1);
      await expect(encryptId.mock.results[0]?.value).resolves.toMatchObject({
        providerId: 'previous.example.com',
      });
    }
    const replacementCertificate =
      delivery === 'replacement unwrapped'
        ? fromBuffer(
            SignedMessage.decode(fromBase64(SERVICE_CERTIFICATE).toBuffer()).msg,
          ).toBase64()
        : SERVICE_CERTIFICATE;
    if (delivery === 'update') {
      await send(
        'update',
        'private',
        {},
        {
          message: fromBase64(SERVICE_CERTIFICATE).toBuffer(),
        },
      );
    }
    const readChallenge = async (token: string) => {
      const response = await send(
        'license-request',
        token,
        {},
        {
          initData,
          serverCertificate:
            token === 'private' && delivery !== 'update' ? replacementCertificate : undefined,
        },
      );
      if (typeof response !== 'string') throw new Error('Missing challenge');
      return LicenseRequest.decode(SignedMessage.decode(fromBase64(response).toBuffer()).msg);
    };
    const challenge = await readChallenge('private');
    expect(challenge.clientId).toBeNull();
    expect(challenge.encryptedClientId?.providerId).toBe('staging.google.com');
    expect(await readChallenge('private')).toEqual(challenge);
    expect(encryptId).toHaveBeenCalledTimes(isReplacement ? 2 : 1);
    const otherChallenge = await readChallenge('other');
    expect(otherChallenge.clientId).not.toBeNull();
    expect(otherChallenge.encryptedClientId).toBeNull();
    await send('close', 'private');
    await send('close', 'other');
  },
);
