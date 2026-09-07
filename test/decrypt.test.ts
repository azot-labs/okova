import { createCipheriv } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import { decryptPacketWithKeyBytes, type EncryptedPacket } from '../src/lib/decrypt';

const key = Uint8Array.from({ length: 16 }, (_, index) => index);
const iv = Uint8Array.from({ length: 16 }, (_, index) => 16 + index);

const makePacket = (overrides: Partial<EncryptedPacket> = {}): EncryptedPacket => ({
  data: new Uint8Array(0),
  keyId: 'test-key',
  psshBoxes: [],
  scheme: 'cenc',
  iv,
  timestamp: 0,
  subsamples: null,
  pattern: null,
  ...overrides,
});

// Explicit byte ranges form an independent oracle for subsample and pattern selection.
const encryptRanges = (
  plaintext: Uint8Array,
  groups: [number, number][][],
  scheme: EncryptedPacket['scheme'],
  counter = iv,
) => {
  const encrypted = new Uint8Array(plaintext);
  for (const ranges of groups) {
    const cipher = createCipheriv(scheme === 'cbcs' ? 'aes-128-cbc' : 'aes-128-ctr', key, counter);
    cipher.setAutoPadding(false);
    const ciphertext = Buffer.concat([
      cipher.update(Buffer.concat(ranges.map(([start, end]) => plaintext.subarray(start, end)))),
      cipher.final(),
    ]);
    let offset = 0;
    for (const [start, end] of ranges) {
      encrypted.set(ciphertext.subarray(offset, offset + end - start), start);
      offset += end - start;
    }
  }
  return encrypted;
};

const plaintext = Uint8Array.from({ length: 157 }, (_, index) => (index * 7 + 3) % 256);

describe('packet decryption', () => {
  test.each([8, 16])(
    'CENC preserves clear bytes and CTR state across partial subsamples, %i-byte IV',
    async (ivLength) => {
      const packetIv = iv.slice(0, ivLength);
      const counter = new Uint8Array(16);
      counter.set(packetIv);
      const data = encryptRanges(
        plaintext,
        [
          [
            [5, 12],
            [15, 34],
            [43, 157],
          ],
        ],
        'cenc',
        counter,
      );
      const packet = makePacket({
        data,
        iv: packetIv,
        subsamples: [
          { clearLen: 5, protectedLen: 7 },
          { clearLen: 3, protectedLen: 19 },
          { clearLen: 9, protectedLen: 114 },
        ],
        // CENC does not use pattern encryption.
        pattern: { cryptByteBlock: 1, skipByteBlock: 1 },
      });
      const original = data.slice();
      await expect(decryptPacketWithKeyBytes(packet, key)).resolves.toEqual(plaintext);
      expect(data).toEqual(original);
      expect(packet.iv).toEqual(packetIv);
    },
  );

  test.each(['cens', 'cbcs'] as const)(
    '%s restarts patterns, preserves skipped blocks and tails, and uses the correct cipher state',
    async (scheme) => {
      const first: [number, number][] = [
        [5, 21],
        [37, 53],
        [69, 85],
      ];
      const second: [number, number][] = [
        [92, 108],
        [124, 140],
      ];
      const data = encryptRanges(
        plaintext,
        scheme === 'cbcs' ? [first, second] : [[...first, ...second]],
        scheme,
      );
      const packet = makePacket({
        scheme,
        data,
        pattern: { cryptByteBlock: 1, skipByteBlock: 1 },
        subsamples: [
          { clearLen: 5, protectedLen: 83 },
          { clearLen: 4, protectedLen: 65 },
        ],
      });
      const original = data.slice();
      await expect(decryptPacketWithKeyBytes(packet, key)).resolves.toEqual(plaintext);
      expect(data).toEqual(original);
    },
  );

  test.each(['cens', 'cbcs'] as const)(
    '%s handles multi-block crypt/skip patterns and a partial crypt run',
    async (scheme) => {
      const data = encryptRanges(
        plaintext,
        [
          [
            [0, 32],
            [80, 112],
          ],
        ],
        scheme,
      );
      await expect(
        decryptPacketWithKeyBytes(
          makePacket({
            data,
            scheme,
            pattern: { cryptByteBlock: 2, skipByteBlock: 3 },
          }),
          key,
        ),
      ).resolves.toEqual(plaintext);
      const shortPlaintext = plaintext.subarray(0, 105);
      const shortData = encryptRanges(
        shortPlaintext,
        [
          [
            [0, 32],
            [80, 96],
          ],
        ],
        scheme,
      );
      await expect(
        decryptPacketWithKeyBytes(
          makePacket({
            data: shortData,
            scheme,
            pattern: { cryptByteBlock: 2, skipByteBlock: 3 },
          }),
          key,
        ),
      ).resolves.toEqual(shortPlaintext);
    },
  );

  test.each(['cenc', 'cens', 'cbcs'] as const)(
    '%s supports absent subsamples and disabled patterns',
    async (scheme) => {
      const end = scheme === 'cenc' ? plaintext.length : 144;
      const data = encryptRanges(plaintext, [[[0, end]]], scheme);
      for (const subsamples of [null, []]) {
        for (const pattern of [
          null,
          { cryptByteBlock: 0, skipByteBlock: 0 },
          { cryptByteBlock: 1, skipByteBlock: 0 },
        ]) {
          await expect(
            decryptPacketWithKeyBytes(makePacket({ data, scheme, subsamples, pattern }), key),
          ).resolves.toEqual(plaintext);
        }
      }
    },
  );

  test.each(['cenc', 'cens', 'cbcs'] as const)(
    '%s supports clear-only and empty packets',
    async (scheme) => {
      await expect(decryptPacketWithKeyBytes(makePacket({ scheme }), key)).resolves.toEqual(
        new Uint8Array(0),
      );
      const result = await decryptPacketWithKeyBytes(
        makePacket({
          scheme,
          data: plaintext,
          subsamples: [{ clearLen: plaintext.length, protectedLen: 0 }],
        }),
        key,
      );
      expect(result).toEqual(plaintext);
      expect(result).not.toBe(plaintext);
    },
  );

  test.each(['cens', 'cbcs'] as const)('%s supports a skip-only pattern', async (scheme) => {
    await expect(
      decryptPacketWithKeyBytes(
        makePacket({
          scheme,
          data: plaintext,
          pattern: { cryptByteBlock: 0, skipByteBlock: 2 },
        }),
        key,
      ),
    ).resolves.toEqual(plaintext);
  });

  test.each([
    { clearLen: -1, protectedLen: 158 },
    { clearLen: 0.5, protectedLen: 156.5 },
    { clearLen: 0, protectedLen: NaN },
    { clearLen: Infinity, protectedLen: 0 },
    { clearLen: 0, protectedLen: 158 },
    { clearLen: 0, protectedLen: 156 },
  ])('rejects malformed subsample lengths: %j', async (subsample) => {
    await expect(
      decryptPacketWithKeyBytes(makePacket({ data: plaintext, subsamples: [subsample] }), key),
    ).rejects.toThrow(/Subsample/);
  });

  test.each([-1, 0.5, NaN, Infinity, 16])('rejects invalid pattern count %s', async (blocks) => {
    for (const pattern of [
      { cryptByteBlock: blocks, skipByteBlock: 1 },
      { cryptByteBlock: 1, skipByteBlock: blocks },
    ]) {
      await expect(
        decryptPacketWithKeyBytes(makePacket({ scheme: 'cbcs', data: plaintext, pattern }), key),
      ).rejects.toThrow(/Pattern/);
    }
  });
});
