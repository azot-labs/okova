import { describe, expect, test } from 'vitest';
import { tryGetUtf16Le } from '../src/lib/buffer';
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
    expect(tryGetUtf16Le(new Uint8Array([0x41, 0x01]))).toBeNull();
  });
});
