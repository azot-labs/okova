import { fromBase64 } from '../src/lib';
import { expect, test } from 'vitest';
import {
  createHmacSha256,
  encryptWithAesCbc,
  importAesCbcKeyForEncrypt,
} from '../src/lib/crypto/common';
import { fromBuffer } from '../src/lib/utils';
import { deriveKeys } from '../src/lib/widevine/context';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import {
  License,
  LicenseRequest,
  SignedMessage,
  ClientIdentification,
  DrmCertificate,
  SignedDrmCertificate,
} from '../src/lib/widevine/proto';
import { WidevineSession } from '../src/lib/widevine/session';

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
    } as unknown as WidevineDeviceCredentials,
    () => {
      disposeCalls += 1;
    },
  );

  const challenge = await session.generateRequest(initDataType, initData);
  const signedRequest = SignedMessage.decode(challenge!);
  const licenseRequest = LicenseRequest.decode(signedRequest.msg);
  const requestId = fromBuffer(licenseRequest.contentId!.widevinePsshData!.requestId!).toText();
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
  } as unknown as WidevineDeviceCredentials);

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
    const credentials = new WidevineDeviceCredentials(
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
    } as unknown as WidevineDeviceCredentials,
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
  } as unknown as WidevineDeviceCredentials).generateRequest(
    'cenc',
    fromBase64(
      'AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQ62dqu8s0Xpa7z2FmMPGj2hoNd2lkZXZpbmVfdGVzdCIQZmtqM2xqYVNkZmFsa3IzaioCSEQyAA==',
    ).toBuffer(),
  );

  const signedRequest = SignedMessage.decode(challenge!);
  const licenseRequest = LicenseRequest.decode(signedRequest.msg);

  expect(licenseRequest.contentId!.widevinePsshData!.requestId).toHaveLength(16);
});
