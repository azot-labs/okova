import { expect, test } from 'vitest';
import { parseCertificate, verifyCertificate } from '../src/lib/widevine/certificate';
import { parseSpkiFromCertificateKey } from '../src/lib/crypto/common';
import { fromBase64, fromBuffer } from '../src/lib/utils';
import { DrmCertificate, SignedDrmCertificate, SignedMessage } from '../src/lib/widevine/proto';
import type { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import { WidevineSession } from '../src/lib/widevine/session';

import { SERVICE_CERTIFICATE } from './service-certificate';

const SERVICE_CERTIFICATE_BYTES = fromBase64(SERVICE_CERTIFICATE).toBuffer();

const getSignedDrmCertificateBytes = async () => {
  const { signedDrmCertificate } = await parseCertificate(SERVICE_CERTIFICATE);
  return SignedDrmCertificate.encode(signedDrmCertificate).finish();
};

test('parse spki from certificate key', async () => {
  const { drmCertificate } = await parseCertificate(SERVICE_CERTIFICATE);
  const publicKey = await parseSpkiFromCertificateKey(drmCertificate.publicKey);
  const expectedPublicKey =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtSESuNBdAj/MXZXiwlHB' +
    'xkm0F3zY0r7vNVuwZ0PeZh49KrwxgreZRtVf3Ajf6VQHgV6aYnSzIqLH9eBnu18K' +
    'wHqJ1FrqlLJRbwdbZu+BHQ0m4bmmuJTyuYV5YqoXHE9mYw0+TGAnGIl/Xh75tqr1' +
    'rU26Kn4UF23xNKHTGFtaIYrAWkxB8IHv/4CjoEDFCwm7x0Du3NjxTWdakZgPksp9' +
    '3GRqBq2tUQH3Sg5JjMAfAFMrrCF4UL2QXpCSNla33+/vQkhnZ/M+9ig9T0JUq3JY' +
    'k5C+5VgI8dZoCA1F2JPCvKL3TWCgwNCgmTzvAWBHAzNMNjgTlIa8na8k/Wegf5rZ' +
    'QwIDAQAB';
  expect(fromBuffer(publicKey).toBase64()).toBe(expectedPublicKey);
});

test('verify valid certificate', async () => {
  const { signedDrmCertificate } = await parseCertificate(SERVICE_CERTIFICATE);
  const isValid = await verifyCertificate(signedDrmCertificate);
  expect(isValid).toBe(true);
});

test('parse signed message wrapped certificate', async () => {
  const signedDrmCertificateBytes = await getSignedDrmCertificateBytes();
  const wrappedCertificate = SignedMessage.encode(
    SignedMessage.create({
      type: SignedMessage.MessageType.SERVICE_CERTIFICATE,
      msg: signedDrmCertificateBytes,
    }),
  ).finish();

  const { drmCertificate, signedDrmCertificate } = await parseCertificate(wrappedCertificate);

  expect(drmCertificate.providerId).toBe('staging.google.com');
  expect(SignedDrmCertificate.encode(signedDrmCertificate).finish()).toEqual(
    signedDrmCertificateBytes,
  );
});

test('reject unsigned drm certificate input', async () => {
  const { drmCertificate } = await parseCertificate(SERVICE_CERTIFICATE);
  const directCertificate = DrmCertificate.encode(drmCertificate).finish();

  await expect(parseCertificate(directCertificate)).rejects.toThrow(
    'Failed to parse service certificate as SignedDrmCertificate',
  );
});

test('reject tampered service certificate during session update', async () => {
  const { signedDrmCertificate } = await parseCertificate(SERVICE_CERTIFICATE);
  const tamperedSignature = new Uint8Array(signedDrmCertificate.signature);
  tamperedSignature[0] ^= 0xff;

  const tamperedCertificate = SignedDrmCertificate.encode(
    SignedDrmCertificate.create({
      drmCertificate: signedDrmCertificate.drmCertificate,
      signature: tamperedSignature,
      signer: signedDrmCertificate.signer,
      hashAlgorithm: signedDrmCertificate.hashAlgorithm,
    }),
  ).finish();

  const wrappedCertificate = SignedMessage.encode(
    SignedMessage.create({
      type: SignedMessage.MessageType.SERVICE_CERTIFICATE,
      msg: tamperedCertificate,
    }),
  ).finish();

  const session = new WidevineSession('temporary', {} as WidevineDeviceCredentials);

  await expect(session.update(wrappedCertificate)).rejects.toThrow(
    'Certificate invalid: signature mismatch',
  );
  expect(session.serviceCertificate).toBeUndefined();
});
