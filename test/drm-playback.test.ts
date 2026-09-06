import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { installDrmPlayback } from '../src/extension/utils/drm-playback';
import { sendDrmMessage } from '../src/extension/utils/drm-bridge';
import { createPsshBox, serializePsshBox, PSSH_SYSTEM_IDS } from '../src/lib/pssh';

vi.mock('../src/extension/utils/drm-bridge', () => ({ sendDrmMessage: vi.fn() }));

const kid = '00112233445566778899aabbccddeeff';
const key = 'ffeeddccbbaa99887766554433221100';
const contentType = 'video/mp4; codecs="avc1.42E01E"';
const nativeUpdate = vi.fn<(response: BufferSource) => Promise<void>>();
const nativeGenerate = vi.fn<(type: string, data: BufferSource) => Promise<void>>();

class NativeMessageEvent extends Event {
  readonly message: ArrayBuffer;
  readonly messageType: MediaKeyMessageType;
  constructor(type: string, init: MediaKeyMessageEventInit) {
    super(type, init);
    this.message = init.message;
    this.messageType = init.messageType;
  }
}

class NativeSession extends EventTarget {
  sessionId = '';
  closedResult = Promise.withResolvers<MediaKeySessionClosedReason>();
  closed = this.closedResult.promise;
  async generateRequest(type: string, data: BufferSource) {
    await nativeGenerate(type, data);
    this.sessionId = 'native-clearkey-session';
    this.dispatchEvent(
      new NativeMessageEvent('message', {
        messageType: 'license-request',
        message: new TextEncoder().encode('native ClearKey request').buffer,
      }),
    );
  }
  update(response: BufferSource) {
    return nativeUpdate(response);
  }
  async close() {
    this.closedResult.resolve('closed-by-application');
  }
}
class NativeKeys {
  createSession() {
    return new NativeSession();
  }
}
class NativeAccess {
  keySystem = 'org.w3.clearkey';
  constructor(readonly configuration: MediaKeySystemConfiguration) {}
  getConfiguration() {
    return structuredClone(this.configuration);
  }
  async createMediaKeys() {
    return new NativeKeys();
  }
}
const nativeRequest = vi.fn(
  async (keySystem: string, configurations: MediaKeySystemConfiguration[]) => {
    if (keySystem !== 'org.w3.clearkey') throw new DOMException('Unavailable', 'NotSupportedError');
    return new NativeAccess(configurations[0]!);
  },
);

const mockSessionBridge = ({
  keySystem = 'com.widevine.alpha',
  challenge = 'Widevine challenge',
  keys = [{ id: kid, value: key }],
} = {}) => {
  vi.mocked(sendDrmMessage).mockImplementation(async (message) => {
    if (message.action === 'playback-config') return keySystem;
    if (message.action === 'license-request') return btoa(challenge);
    if (message.action === 'update') return { keys };
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('navigator', { requestMediaKeySystemAccess: nativeRequest });
  vi.stubGlobal('window', { MPD_LIST: new Map() });
  vi.stubGlobal('MediaKeySystemAccess', NativeAccess);
  vi.stubGlobal('MediaKeys', NativeKeys);
  vi.stubGlobal('MediaKeySession', NativeSession);
  vi.stubGlobal('MediaKeyMessageEvent', NativeMessageEvent);
  nativeGenerate.mockResolvedValue();
  nativeUpdate.mockResolvedValue();
  mockSessionBridge();
  installDrmPlayback();
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const createSession = async () => {
  const access = await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [
    {
      initDataTypes: ['cenc'],
      videoCapabilities: [{ contentType, robustness: 'SW_SECURE_CRYPTO' }],
    },
  ]);
  expect(access.keySystem).toBe('com.widevine.alpha');
  expect(access.getConfiguration().videoCapabilities?.[0]?.robustness).toBe('SW_SECURE_CRYPTO');
  const mediaKeys = await access.createMediaKeys();
  expect(mediaKeys).toBeInstanceOf(NativeKeys);
  return mediaKeys.createSession();
};

const createInitData = (
  systemId: (typeof PSSH_SYSTEM_IDS)[keyof typeof PSSH_SYSTEM_IDS] = PSSH_SYSTEM_IDS.widevine,
) =>
  new Uint8Array(
    serializePsshBox(
      createPsshBox({
        systemId,
        version: 1,
        keyIds: [kid],
      }),
    ),
  );

test('uses real ClearKey objects, hides native messages, and installs extracted keys before update resolves', async () => {
  const session = await createSession();
  const messages: string[] = [];
  session.addEventListener('message', (event) => {
    if (event instanceof NativeMessageEvent) messages.push(new TextDecoder().decode(event.message));
  });
  await session.generateRequest('cenc', createInitData());
  expect(messages).toEqual([]);
  await vi.runAllTimersAsync();
  expect(messages).toEqual(['Widevine challenge']);
  expect(nativeRequest).toHaveBeenCalledWith('org.w3.clearkey', [
    expect.objectContaining({
      initDataTypes: ['keyids'],
      videoCapabilities: [{ contentType, robustness: '', encryptionScheme: 'cenc' }],
    }),
  ]);
  expect(nativeGenerate.mock.calls[0]?.[0]).toBe('keyids');
  const installed = Promise.withResolvers<void>();
  nativeUpdate.mockReturnValueOnce(installed.promise);
  const updating = session.update(new Uint8Array([1, 2, 3]));
  let resolved = false;
  void updating.then(() => {
    resolved = true;
  });
  await vi.waitFor(() => expect(nativeUpdate).toHaveBeenCalledOnce());
  expect(resolved).toBe(false);
  const response = nativeUpdate.mock.calls[0]?.[0];
  expect(response).toBeInstanceOf(Uint8Array);
  expect(JSON.parse(new TextDecoder().decode(response))).toEqual({
    keys: [{ kty: 'oct', kid: 'ABEiM0RVZneImaq7zN3u_w', k: '_-7dzLuqmYh3ZlVEMyIRAA' }],
    type: 'temporary',
  });
  installed.resolve();
  await updating;
  await session.close();
  expect(sendDrmMessage).toHaveBeenCalledWith(expect.objectContaining({ action: 'close' }));
});

test('rejects an unsuccessful extraction without forwarding a Widevine license to ClearKey', async () => {
  mockSessionBridge({ keys: [] });
  const session = await createSession();
  await session.generateRequest('cenc', createInitData());
  await expect(session.update(new Uint8Array([1, 2, 3]))).rejects.toThrow();
  expect(nativeUpdate).not.toHaveBeenCalled();
});

test.for([
  { videoCapabilities: [{ contentType, robustness: 'HW_SECURE_ALL' }] },
  { videoCapabilities: [{ contentType, encryptionScheme: 'cbcs' }] },
  { videoCapabilities: [{ contentType }], sessionTypes: ['persistent-license'] },
])('does not advertise unsupported configurations: %j', async (configuration) => {
  await expect(
    navigator.requestMediaKeySystemAccess('com.widevine.alpha', [configuration]),
  ).rejects.toMatchObject({ name: 'NotSupportedError' });
  expect(nativeRequest).not.toHaveBeenCalled();
});

test.for(['com.microsoft.playready', 'com.microsoft.playready.recommendation'])(
  'adapts %s using PlayReady PSSH IDs and license messages',
  async (keySystem) => {
    mockSessionBridge({
      keySystem: 'com.microsoft.playready.recommendation',
      challenge: '<soap:Envelope/>',
    });
    const access = await navigator.requestMediaKeySystemAccess(keySystem, [
      {
        videoCapabilities: [{ contentType, robustness: '2000' }],
      },
    ]);
    expect(access.keySystem).toBe(keySystem);
    const mediaKeys = await access.createMediaKeys();
    await expect(mediaKeys.setServerCertificate(new Uint8Array([1]))).resolves.toBe(false);
    const session = mediaKeys.createSession();
    let challengeXml = '';
    session.addEventListener('message', (event) => {
      if (event instanceof NativeMessageEvent) {
        challengeXml = new TextDecoder('utf-16le').decode(event.message);
      }
    });
    await session.generateRequest('cenc', createInitData(PSSH_SYSTEM_IDS.playready));
    await vi.runAllTimersAsync();
    expect(challengeXml).toContain('<PlayReadyKeyMessage type="LicenseAcquisition">');
    expect(challengeXml).toContain(
      `<Challenge encoding="base64encoded">${btoa('<soap:Envelope/>')}</Challenge>`,
    );
    expect(challengeXml).toContain('<name>Content-Type</name>');
    await session.update(new TextEncoder().encode('<License/>'));
    expect(sendDrmMessage).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update', keySystem }),
    );
    expect(JSON.parse(new TextDecoder().decode(nativeUpdate.mock.calls[0]?.[0])).keys[0].kid).toBe(
      'ABEiM0RVZneImaq7zN3u_w',
    );
  },
);

test('does not advertise a DRM system that differs from the active client', async () => {
  await expect(
    navigator.requestMediaKeySystemAccess('com.microsoft.playready.recommendation', [
      {
        videoCapabilities: [{ contentType }],
      },
    ]),
  ).rejects.toMatchObject({ name: 'NotSupportedError' });
  expect(nativeRequest).not.toHaveBeenCalled();
});

test('encodes a large sliced response without including surrounding bytes or overflowing the call stack', async () => {
  const session = await createSession();
  await session.generateRequest('cenc', createInitData());
  const length = 256 * 1024;
  const backing = new Uint8Array(length + 2).fill(7);
  backing[0] = 99;
  backing[length + 1] = 99;
  await session.update(new DataView(backing.buffer, 1, length));
  const encoded = vi
    .mocked(sendDrmMessage)
    .mock.calls.find(([message]) => message.action === 'update')?.[0].messageBase64;
  if (typeof encoded !== 'string') throw new Error('Expected an encoded response');
  const decoded = Buffer.from(encoded, 'base64');
  expect(decoded.length).toBe(length);
  expect(decoded.every((byte) => byte === 7)).toBe(true);
});

test('reinstalling playback leaves the installed adapter unchanged', async () => {
  const installedRequest = navigator.requestMediaKeySystemAccess;
  installDrmPlayback();
  expect(navigator.requestMediaKeySystemAccess).toBe(installedRequest);
  const session = await createSession();
  await session.generateRequest('cenc', createInitData());
  expect(nativeGenerate).toHaveBeenCalledOnce();
  expect(
    vi
      .mocked(sendDrmMessage)
      .mock.calls.filter(([message]) => message.action === 'playback-config'),
  ).toHaveLength(1);
});

test('rejects updates before or during initialization and duplicate generation', async () => {
  const session = await createSession();
  await expect(session.update(new Uint8Array([1]))).rejects.toMatchObject({
    name: 'InvalidStateError',
  });
  const generated = Promise.withResolvers<void>();
  nativeGenerate.mockReturnValueOnce(generated.promise);
  const generating = session.generateRequest('cenc', createInitData());
  await expect(session.update(new Uint8Array([1]))).rejects.toMatchObject({
    name: 'InvalidStateError',
  });
  await expect(session.generateRequest('cenc', createInitData())).rejects.toMatchObject({
    name: 'InvalidStateError',
  });
  generated.resolve();
  await generating;
});

test('failed generation leaves updates invalid without replaying its error', async () => {
  nativeGenerate.mockRejectedValueOnce(new Error('Native generation failed'));
  const session = await createSession();
  await expect(session.generateRequest('cenc', createInitData())).rejects.toThrow(
    'Native generation failed',
  );
  await expect(session.update(new Uint8Array([1]))).rejects.toMatchObject({
    name: 'InvalidStateError',
  });
  await expect(session.generateRequest('cenc', createInitData())).rejects.toMatchObject({
    name: 'InvalidStateError',
  });
  expect(nativeUpdate).not.toHaveBeenCalled();
});

test('closing before challenge delivery suppresses the message', async () => {
  const session = await createSession();
  const listener = vi.fn();
  session.addEventListener('message', listener);
  await session.generateRequest('cenc', createInitData());
  await session.close();
  await vi.runAllTimersAsync();
  expect(listener).not.toHaveBeenCalled();
  await expect(session.update(new Uint8Array([1]))).rejects.toMatchObject({
    name: 'InvalidStateError',
  });
});

test('closing during native generation prevents a background session from being created', async () => {
  const session = await createSession();
  const generated = Promise.withResolvers<void>();
  nativeGenerate.mockReturnValueOnce(generated.promise);
  const generating = session.generateRequest('cenc', createInitData());
  await session.close();
  generated.resolve();
  await expect(generating).rejects.toMatchObject({ name: 'InvalidStateError' });
  expect(sendDrmMessage).not.toHaveBeenCalledWith(
    expect.objectContaining({ action: 'generateRequest' }),
  );
});

test.for(['org.w3.clearkey', 'com.apple.fps'])(
  'passes %s directly to the browser',
  async (keySystem) => {
    const configurations = [{ videoCapabilities: [{ contentType }] }];
    if (keySystem === 'org.w3.clearkey') {
      await navigator.requestMediaKeySystemAccess(keySystem, configurations);
    } else {
      await expect(
        navigator.requestMediaKeySystemAccess(keySystem, configurations),
      ).rejects.toMatchObject({ name: 'NotSupportedError' });
    }
    expect(nativeRequest).toHaveBeenCalledWith(keySystem, configurations);
    expect(sendDrmMessage).not.toHaveBeenCalled();
  },
);

test.for(['com.microsoft.playready.recommendation.3000', 'com.microsoft.playready.hardware'])(
  'rejects hardware DRM %s',
  async (keySystem) => {
    await expect(navigator.requestMediaKeySystemAccess(keySystem, [{}])).rejects.toMatchObject({
      name: 'NotSupportedError',
    });
    expect(nativeRequest).not.toHaveBeenCalled();
    expect(sendDrmMessage).toHaveBeenCalledExactlyOnceWith({ action: 'playback-config' });
  },
);

test('propagates playback configuration bridge failures', async () => {
  vi.mocked(sendDrmMessage).mockRejectedValueOnce(new Error('Bridge unavailable'));
  await expect(createSession()).rejects.toThrow('Bridge unavailable');
  expect(nativeRequest).not.toHaveBeenCalled();
});

test('rejects empty server certificates', async () => {
  const access = await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{}]);
  const mediaKeys = await access.createMediaKeys();
  await expect(mediaKeys.setServerCertificate(new Uint8Array())).rejects.toBeInstanceOf(TypeError);
});

test.for([
  'com.widevine.alpha',
  'com.microsoft.playready',
  'com.microsoft.playready.recommendation',
  'com.microsoft.playready.hardware',
  'com.microsoft.playready.recommendation.3000',
])('uses native %s when the active client has been removed', async (keySystem) => {
  vi.mocked(sendDrmMessage).mockResolvedValueOnce(null);
  const configurations = [{ videoCapabilities: [{ contentType }] }];
  const nativeAccess = new NativeAccess(configurations[0]!);
  nativeRequest.mockResolvedValueOnce(nativeAccess);
  const access = await navigator.requestMediaKeySystemAccess(keySystem, configurations);
  expect(access).toBe(nativeAccess);
  expect(nativeRequest).toHaveBeenCalledExactlyOnceWith(keySystem, configurations);
});

test('delivers the regenerated challenge after a service certificate, then installs license keys', async () => {
  const session = await createSession();
  const messages: string[] = [];
  session.addEventListener('message', (event) => {
    if (event instanceof NativeMessageEvent) messages.push(new TextDecoder().decode(event.message));
  });
  await session.generateRequest('cenc', createInitData());
  await vi.runAllTimersAsync();
  messages.length = 0;
  vi.mocked(sendDrmMessage).mockResolvedValueOnce({ challenge: btoa('private challenge') });
  await session.update(new Uint8Array([8, 5]));
  expect(messages).toEqual([]);
  expect(nativeUpdate).not.toHaveBeenCalled();
  await vi.runAllTimersAsync();
  expect(messages).toEqual(['private challenge']);
  await session.update(new Uint8Array([8, 2]));
  expect(nativeUpdate).toHaveBeenCalledOnce();
});

test.for([undefined, { challenge: '' }])(
  'rejects unsuccessful certificate updates: %j',
  async (result) => {
    const session = await createSession();
    await session.generateRequest('cenc', createInitData());
    await vi.runAllTimersAsync();
    const listener = vi.fn();
    session.addEventListener('message', listener);
    vi.mocked(sendDrmMessage).mockResolvedValueOnce(result);
    await expect(session.update(new Uint8Array([8, 5]))).rejects.toMatchObject({
      name: 'OperationError',
    });
    await vi.runAllTimersAsync();
    expect(listener).not.toHaveBeenCalled();
    expect(nativeUpdate).not.toHaveBeenCalled();
  },
);

test('does not deliver a regenerated challenge after close', async () => {
  const session = await createSession();
  await session.generateRequest('cenc', createInitData());
  await vi.runAllTimersAsync();
  const listener = vi.fn();
  session.addEventListener('message', listener);
  vi.mocked(sendDrmMessage).mockResolvedValueOnce({ challenge: btoa('private challenge') });
  await session.update(new Uint8Array([8, 5]));
  await session.close();
  await vi.runAllTimersAsync();
  expect(listener).not.toHaveBeenCalled();
});
