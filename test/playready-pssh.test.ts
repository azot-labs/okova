import { expect, test } from 'vitest';
import { InvalidPssh } from '../src/lib/playready/exceptions';
import { Pssh } from '../src/lib/playready/pssh';

const PLAYREADY_SYSTEM_ID = new Uint8Array([
  0x9a, 0x04, 0xf0, 0x79, 0x98, 0x40, 0x42, 0x86, 0xab, 0x92, 0xe6, 0x5b, 0xe0, 0x88, 0x5f, 0x95,
]);

const WIDEVINE_SYSTEM_ID = new Uint8Array([
  0xed, 0xef, 0x8b, 0xa9, 0x79, 0xd6, 0x4a, 0xce, 0xa3, 0xc8, 0x27, 0xdc, 0xd5, 0x1d, 0x21, 0xed,
]);

const WRM_HEADER =
  '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0"><DATA></DATA></WRMHEADER>';

const encodeUtf16Le = (text: string) => Buffer.from(text, 'utf16le');

const createPsshBox = (
  systemId: Uint8Array,
  data: Uint8Array,
  version = 0,
  keyIds: Uint8Array[] = [],
) => {
  const versionField = new Uint8Array([version, 0x00, 0x00, 0x00]);
  const keyIdSection =
    version === 1
      ? new Uint8Array([
          0x00,
          0x00,
          0x00,
          keyIds.length,
          ...keyIds.flatMap((keyId) => Array.from(keyId)),
        ])
      : new Uint8Array();
  const dataLength = data.length;
  const boxLength = 4 + 4 + 4 + 16 + keyIdSection.length + 4 + dataLength;

  return new Uint8Array([
    (boxLength >>> 24) & 0xff,
    (boxLength >>> 16) & 0xff,
    (boxLength >>> 8) & 0xff,
    boxLength & 0xff,
    0x70,
    0x73,
    0x73,
    0x68,
    ...versionField,
    ...systemId,
    ...keyIdSection,
    (dataLength >>> 24) & 0xff,
    (dataLength >>> 16) & 0xff,
    (dataLength >>> 8) & 0xff,
    dataLength & 0xff,
    ...data,
  ]);
};

const createPlayreadyHeader = (records: Array<{ type: number; data: Uint8Array }>) => {
  const payload = new Uint8Array([
    ...records.flatMap(({ type, data }) => [
      type & 0xff,
      (type >>> 8) & 0xff,
      data.length & 0xff,
      (data.length >>> 8) & 0xff,
      ...Array.from(data),
    ]),
  ]);
  const totalLength = 4 + 2 + payload.length;

  return new Uint8Array([
    totalLength & 0xff,
    (totalLength >>> 8) & 0xff,
    (totalLength >>> 16) & 0xff,
    (totalLength >>> 24) & 0xff,
    records.length & 0xff,
    (records.length >>> 8) & 0xff,
    ...payload,
  ]);
};

test('playready PSSH parses version 1 boxes with key IDs', () => {
  const box = createPsshBox(PLAYREADY_SYSTEM_ID, encodeUtf16Le(WRM_HEADER), 1, [
    new Uint8Array(16).fill(1),
  ]);

  const pssh = new Pssh(box);

  expect(pssh.wrmHeaders).toEqual([WRM_HEADER]);
});

test('playready PSSH skips non-PlayReady boxes in concatenated init data', () => {
  const concatenatedBoxes = new Uint8Array([
    ...createPsshBox(WIDEVINE_SYSTEM_ID, new Uint8Array([1, 2, 3, 4])),
    ...createPsshBox(PLAYREADY_SYSTEM_ID, encodeUtf16Le(WRM_HEADER)),
  ]);

  const pssh = new Pssh(concatenatedBoxes);

  expect(pssh.wrmHeaders).toEqual([WRM_HEADER]);
});

test('playready PSSH advances over non-header records inside a PlayReady header', () => {
  const header = createPlayreadyHeader([
    { type: 2, data: new Uint8Array([1, 2, 3, 4]) },
    { type: 1, data: encodeUtf16Le(WRM_HEADER) },
  ]);

  const pssh = new Pssh(header);

  expect(pssh.wrmHeaders).toEqual([WRM_HEADER]);
});

test('playready PSSH rejects empty payloads', () => {
  expect(() => new Pssh(new Uint8Array())).toThrowError(new InvalidPssh('Data must not be empty'));
});

test.each(['Привет 世界 😀', '\ufeffПривет'])(
  'preserves Unicode in raw, record and PRO headers: %s',
  (text) => {
    const xml = WRM_HEADER.replace(
      '<DATA></DATA>',
      `<DATA><LA_URL>https://example.test/${text}</LA_URL></DATA>`,
    );
    const bytes = encodeUtf16Le(`\ufeff${xml}`);
    const pro = createPlayreadyHeader([{ type: 1, data: bytes }]);
    for (const input of [bytes, pro.subarray(6), pro, createPsshBox(PLAYREADY_SYSTEM_ID, pro)]) {
      expect(new Pssh(input).wrmHeaders).toEqual([xml]);
    }
  },
);

test.each([
  new Uint8Array([0x00, 0xd8]),
  new Uint8Array([0x00, 0xdc]),
  new Uint8Array([0x3c]),
  encodeUtf16Le('<OTHER></OTHER>'),
  encodeUtf16Le('<WRMHEADER><DATA></WRMHEADER>'),
])('rejects invalid UTF-16LE or XML in type-1 records', (bytes) => {
  expect(() => new Pssh(createPlayreadyHeader([{ type: 1, data: bytes }]))).toThrow();
});

test('enforces PRO total length, record count and record boundaries', () => {
  const pro = createPlayreadyHeader([{ type: 1, data: encodeUtf16Le(WRM_HEADER) }]);
  const invalid = [pro.subarray(0, pro.length - 1), new Uint8Array([...pro, 0])];
  for (const [offset, value] of [
    [0, pro.length - 1],
    [4, 2],
    [8, pro.length],
  ] as const) {
    const copy = new Uint8Array(pro);
    new DataView(copy.buffer).setUint16(offset, value, true);
    invalid.push(copy);
  }
  for (const bytes of invalid) {
    expect(() => new Pssh(bytes)).toThrow();
    expect(() => new Pssh(createPsshBox(PLAYREADY_SYSTEM_ID, bytes))).toThrow();
  }
});
