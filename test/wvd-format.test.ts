import { describe, expect, test } from 'vitest';
import { tryGetUtf16Le } from '../src/lib/buffer';
import { WidevineDeviceCredentials } from '../src/lib/widevine/device-credentials';
import { ClientIdentification } from '../src/lib/widevine/proto';
import { buildWvd, parseWvd, WVD_DEVICE_TYPES } from '../src/lib/widevine/wvd';
import { fromText } from '../src/lib/utils';

describe('WVD format', () => {
  test('roundtrips parsed fields through buildWvd and parseWvd', () => {
    const privateKey = new Uint8Array([1, 2, 3, 4, 5]);
    const clientId = new Uint8Array([9, 8, 7, 6]);

    const wvd = buildWvd({
      deviceType: WVD_DEVICE_TYPES.chrome,
      securityLevel: 1,
      privateKey,
      clientId,
    });

    expect(parseWvd(wvd)).toEqual({
      version: 2,
      deviceType: WVD_DEVICE_TYPES.chrome,
      securityLevel: 1,
      privateKey,
      clientId,
    });
  });

  test('rejects an invalid magic number', () => {
    const invalid = fromText('BAD').toBuffer();
    expect(() => parseWvd(invalid)).toThrow('Invalid WVD file: Wrong magic number');
  });

  test('rejects an unsupported version', () => {
    const valid = buildWvd({
      deviceType: WVD_DEVICE_TYPES.android,
      securityLevel: 3,
      privateKey: new Uint8Array([1]),
      clientId: new Uint8Array([2]),
    });

    valid[3] = 3;

    expect(() => parseWvd(valid)).toThrow('Unsupported WVD version: 3');
  });

  test('rejects truncated payloads', () => {
    const valid = buildWvd({
      deviceType: WVD_DEVICE_TYPES.android,
      securityLevel: 3,
      privateKey: new Uint8Array([1, 2]),
      clientId: new Uint8Array([3, 4]),
    });

    expect(() => parseWvd(valid.subarray(0, valid.length - 1))).toThrow(
      'Invalid WVD file: Truncated client ID',
    );
  });

  test('rejects malformed client identification blobs during device loading', async () => {
    const wvd = buildWvd({
      deviceType: WVD_DEVICE_TYPES.chrome,
      securityLevel: 1,
      privateKey: new Uint8Array([1]),
      clientId: new Uint8Array([1, 2, 3]),
    });

    await expect(WidevineDeviceCredentials.fromPacked(wvd)).rejects.toThrow(
      'Invalid Widevine client ID',
    );
  });

  test('rejects malformed embedded signed drm certificates during device loading', async () => {
    const clientId = ClientIdentification.encode(
      ClientIdentification.create({
        token: new Uint8Array([1, 2, 3]),
      }),
    ).finish();
    const wvd = buildWvd({
      deviceType: WVD_DEVICE_TYPES.android,
      securityLevel: 3,
      privateKey: new Uint8Array([1]),
      clientId,
    });

    await expect(WidevineDeviceCredentials.fromPacked(wvd)).rejects.toThrow(
      'Invalid Widevine signed DRM certificate',
    );
  });
});

describe('tryGetUtf16Le', () => {
  test('decodes valid UTF-16LE bytes', () => {
    const utf16leBytes = new Uint8Array(
      Array.from(fromText('DRM').toBuffer(), (byte) => [byte, 0]).flat(),
    );

    expect(tryGetUtf16Le(utf16leBytes)).toBe('DRM');
  });

  test('returns null for non-UTF-16LE input', () => {
    expect(tryGetUtf16Le(new Uint8Array([0x41, 0x42, 0x43]))).toBeNull();
    expect(tryGetUtf16Le(new Uint8Array([0x00, 0xd8]))).toBeNull();
  });
});

test('WVD fields roundtrip at the maximum length and reject overflow', () => {
  const fields = {
    deviceType: WVD_DEVICE_TYPES.android,
    securityLevel: 3,
    privateKey: new Uint8Array(0xffff).fill(0xab),
    clientId: new Uint8Array(0xffff).fill(0xcd),
  };
  expect(parseWvd(buildWvd(fields))).toMatchObject(fields);
  expect(() => buildWvd({ ...fields, privateKey: new Uint8Array(0x10000) })).toThrow(
    'private key exceeds',
  );
  expect(() => buildWvd({ ...fields, clientId: new Uint8Array(0x10000) })).toThrow(
    'client ID exceeds',
  );
});
