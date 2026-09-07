import { fromBase64 } from '../src/lib';
import { expect, test, vi } from 'vitest';
import {
  createHmacSha256,
  encryptWithAesCbc,
  importAesCbcKeyForEncrypt,
} from '../src/lib/crypto/common';
import { fromBuffer } from '../src/lib/utils';
import { deriveContext, deriveKeys } from '../src/lib/widevine/context';
import { WidevineClientCredentials } from '../src/lib/widevine/client-credentials';
import {
  License,
  LicenseRequest,
  SignedMessage,
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';
import { generateSessionId, WidevineSession } from '../src/lib/widevine/session';

test('session stays open after parsing a license', async () => {
  const initDataType = 'cenc';
  const initData = fromBase64(
    'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
  ).toBuffer();
  const sessionKey = new Uint8Array(Array.from({ length: 16 }, (_, index) => index + 1));
  const contentKey = new Uint8Array(Array.from({ length: 16 }, (_, index) => 0xf0 - index));
  let disposeCalls = 0;

  const session = new WidevineSession(
    'temporary',
    {
      id: ClientIdentification.create({}),
      signWithKey: async () => new Uint8Array([0xaa]),
      decryptWithKey: async () => sessionKey,
    } as unknown as WidevineClientCredentials,
    () => {
      disposeCalls += 1;
    },
  );

  const challenge = await session.generateRequest(initDataType, initData);
  const signedRequest = SignedMessage.decode(challenge!);
  const licenseRequest = LicenseRequest.decode(signedRequest.msg);
  const requestId = fromBuffer(licenseRequest.contentId!.widevinePsshData!.requestId!).toHex();
  const context = session.contexts.get(requestId);

  expect(context).toBeDefined();

  const { encKey, macKeyServer } = await deriveKeys(context!.enc, context!.auth, sessionKey);
  const iv = new Uint8Array(16);
  crypto.getRandomValues(iv);
  const encryptedContentKey = await encryptWithAesCbc(
    contentKey,
    await importAesCbcKeyForEncrypt(encKey),
    iv,
  );

  const license = License.create({
    id: {
      requestId: licenseRequest.contentId!.widevinePsshData!.requestId,
    },
    key: [
      {
        id: new Uint8Array(16),
        iv,
        key: encryptedContentKey,
        type: License.KeyContainer.KeyType.CONTENT,
      },
    ],
  });
  const licenseBytes = License.encode(license).finish();
  const signature = await createHmacSha256(macKeyServer, licenseBytes);
  const response = SignedMessage.encode(
    SignedMessage.create({
      type: SignedMessage.MessageType.LICENSE,
      msg: licenseBytes,
      signature,
      sessionKey: new Uint8Array([1]),
    }),
  ).finish();

  await session.update(response);

  expect(session.keys.size).toBe(1);
  expect(disposeCalls).toBe(0);
});

test('session update rejects immediately when the license is not a SignedMessage', async () => {
  const session = new WidevineSession('temporary', {
    id: ClientIdentification.create({}),
    signWithKey: async () => new Uint8Array([0xaa]),
  } as unknown as WidevineClientCredentials);

  await expect(session.update(new Uint8Array([0xff, 0x00, 0x01]))).rejects.toThrow(
    'Failed to parse message as SignedMessage',
  );
});

test.each([
  ...Object.values(SignedMessage.MessageType)
    .filter((type) => typeof type === 'number')
    .filter(
      (type) =>
        type !== SignedMessage.MessageType.LICENSE &&
        type !== SignedMessage.MessageType.SERVICE_CERTIFICATE,
    )
    .map((type) => ({
      name: `message type ${SignedMessage.MessageType[type]}`,
      response: SignedMessage.encode({ type }).finish(),
      error: 'Unexpected Widevine response message type',
    })),
  {
    name: 'unknown message type',
    response: new Uint8Array([0x08, 0x7f]),
    error: 'Unexpected Widevine response message type: 127',
  },
  {
    name: 'missing message type',
    response: SignedMessage.encode({}).finish(),
    error: 'Unexpected Widevine response message type',
  },
  ...[
    { name: 'missing license ID', license: {}, error: 'missing id' },
    { name: 'missing request ID', license: { id: {} }, error: 'missing or empty requestId' },
    {
      name: 'empty request ID',
      license: { id: { requestId: new Uint8Array() } },
      error: 'missing or empty requestId',
    },
  ].map(({ name, license, error }) => ({
    name,
    response: SignedMessage.encode({
      type: SignedMessage.MessageType.LICENSE,
      msg: License.encode(license).finish(),
    }).finish(),
    error: `Invalid Widevine license ID: ${error}`,
  })),
  {
    name: 'malformed license payload',
    response: SignedMessage.encode({
      type: SignedMessage.MessageType.LICENSE,
      msg: new Uint8Array([0x0a, 0x02, 0xff]),
    }).finish(),
    error: 'Failed to parse Widevine license payload',
  },
  {
    name: 'unknown request ID',
    response: SignedMessage.encode({
      type: SignedMessage.MessageType.LICENSE,
      msg: License.encode({ id: { requestId: new Uint8Array([1]) } }).finish(),
    }).finish(),
    error: 'Failed to find context to decrypt keys',
  },
])(
  'session update rejects $name before decryption and preserves state',
  async ({ response, error }) => {
    const credentials = new WidevineClientCredentials(
      ClientIdentification.create({
        token: SignedDrmCertificate.encode({
          drmCertificate: DrmCertificate.encode({ systemId: 1 }).finish(),
        }).finish(),
      }),
    );
    const session = new WidevineSession('temporary', credentials);
    session.contexts.set('pending', { enc: new Uint8Array(16), auth: new Uint8Array(16) });
    const state = session.pause();

    await expect(session.update(response)).rejects.toThrow(error);

    expect(session.pause()).toBe(state);
  },
);

test('android license requests use an OEMCrypto-like request id and set keyControlNonce', async () => {
  const challenge = await new WidevineSession(
    'temporary',
    {
      id: ClientIdentification.create({}),
      type: 'android',
      signWithKey: async () => new Uint8Array([0xaa]),
    } as unknown as WidevineClientCredentials,
    undefined,
    undefined,
    5,
  ).generateRequest(
    'cenc',
    fromBase64(
      'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
    ).toBuffer(),
  );

  const signedRequest = SignedMessage.decode(challenge!);
  const licenseRequest = LicenseRequest.decode(signedRequest.msg);
  const requestId = fromBuffer(licenseRequest.contentId!.widevinePsshData!.requestId!).toText();

  expect(requestId).toMatch(/^[0-9A-F]{32}$/);
  expect(requestId.slice(8, 16)).toBe('00000000');
  expect(requestId.slice(16)).toBe('0500000000000000');
  expect(licenseRequest.keyControlNonce).toBeGreaterThan(0);
  expect(licenseRequest.keyControlNonce).toBeLessThan(2 ** 31);
});

test('chrome license requests use a binary 16-byte request id', async () => {
  const challenge = await new WidevineSession('temporary', {
    id: ClientIdentification.create({}),
    type: 'chrome',
    signWithKey: async () => new Uint8Array([0xaa]),
  } as unknown as WidevineClientCredentials).generateRequest(
    'cenc',
    fromBase64(
      'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
    ).toBuffer(),
  );

  const signedRequest = SignedMessage.decode(challenge!);
  const licenseRequest = LicenseRequest.decode(signedRequest.msg);

  expect(licenseRequest.contentId!.widevinePsshData!.requestId).toHaveLength(16);
});

const createContextTestCredentials = (type: 'chrome' | 'android' = 'chrome') => {
  const credentials = new WidevineClientCredentials(
    ClientIdentification.create({
      token: SignedDrmCertificate.encode(
        SignedDrmCertificate.create({
          drmCertificate: DrmCertificate.encode(DrmCertificate.create({ systemId: 1 })).finish(),
        }),
      ).finish(),
    }),
    type,
  );
  vi.spyOn(credentials, 'signWithKey').mockResolvedValue(new Uint8Array([0xaa]));
  return credentials;
};

const contextInitData = fromBase64(
  'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
).toBuffer();

test('binary request IDs with identical UTF-8 decoding retain separate contexts through resume and license parsing', async () => {
  const credentials = createContextTestCredentials();
  const sessionKey = new Uint8Array(16).fill(1);
  vi.spyOn(credentials, 'decryptWithKey').mockResolvedValue(sessionKey);
  const session = new WidevineSession('temporary', credentials);
  const requestIds = [new Uint8Array(16).fill(0x80), new Uint8Array(16).fill(0x81)];
  expect(fromBuffer(requestIds[0]).toText()).toBe(fromBuffer(requestIds[1]).toText());
  for (const requestId of requestIds) {
    const random = vi.spyOn(crypto, 'getRandomValues').mockReturnValueOnce(requestId);
    try {
      const challenge = await session.generateRequest('cenc', contextInitData);
      const message = SignedMessage.decode(challenge!);
      expect(session.contexts.get(fromBuffer(requestId).toHex())).toEqual(
        deriveContext(message.msg),
      );
    } finally {
      random.mockRestore();
    }
  }
  expect(session.contexts.size).toBe(2);
  const restored = session.resume(session.pause());
  expect(restored.contexts).toEqual(session.contexts);
  for (const requestId of requestIds) {
    const context = restored.contexts.get(fromBuffer(requestId).toHex())!;
    const { macKeyServer } = await deriveKeys(context.enc, context.auth, sessionKey);
    const msg = License.encode(License.create({ id: { requestId } })).finish();
    await restored.update(
      SignedMessage.encode(
        SignedMessage.create({
          type: SignedMessage.MessageType.LICENSE,
          msg,
          signature: await createHmacSha256(macKeyServer, msg),
          sessionKey: new Uint8Array([1]),
        }),
      ).finish(),
    );
    expect(restored.contexts.has(fromBuffer(requestId).toHex())).toBe(false);
  }
  expect(restored.contexts.size).toBe(0);
});

test.each(['chrome', 'android'] as const)(
  'recovers exact request IDs from legacy %s snapshots',
  async (type) => {
    const session = new WidevineSession('temporary', createContextTestCredentials(type));
    const challenge = await session.generateRequest('cenc', contextInitData);
    const request = LicenseRequest.decode(SignedMessage.decode(challenge!).msg);
    const requestId = request.contentId!.widevinePsshData!.requestId!;
    const snapshot = JSON.parse(session.pause());
    delete snapshot.contextKeyEncoding;
    snapshot.contexts = { [fromBuffer(requestId).toText()]: Object.values(snapshot.contexts)[0] };
    const restored = session.resume(JSON.stringify(snapshot));
    expect(restored.contexts).toEqual(session.contexts);
    expect(JSON.parse(restored.pause()).contextKeyEncoding).toBe('hex');
  },
);

test('Android session IDs use Web Crypto while preserving their format', () => {
  const random = vi
    .spyOn(crypto, 'getRandomValues')
    .mockReturnValueOnce(new Uint8Array(8).fill(0xab));
  const weakRandom = vi.spyOn(Math, 'random').mockImplementation(() => {
    throw new Error('Weak randomness');
  });
  try {
    expect(generateSessionId('android')).toBe('ABABABABABABABAB0100000000000000');
    expect(random).toHaveBeenCalledWith(new Uint8Array(8));
  } finally {
    random.mockRestore();
    weakRandom.mockRestore();
  }
});
