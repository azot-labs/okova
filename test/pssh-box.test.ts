import { expect, test } from 'vitest';
import {
  PSSH_SYSTEM_IDS,
  createPsshBox,
  parsePsshBoxes,
  serializePsshBox,
  psshBoxToBase64,
  getPsshKeyIds,
  setPsshKeyIds,
  convertPsshBox,
} from '../src/lib/main';
import { WidevinePsshData } from '../src/lib/widevine/proto';
import { createPssh } from '../src/lib/widevine/pssh';
import { Pssh } from '../src/lib/playready/pssh';
import { WrmHeader } from '../src/lib/playready/wrmheader';

const KID = '00112233445566778899aabbccddeeff';
const OTHER_KID = 'ffeeddccbbaa99887766554433221100';
const widevine = () => setPsshKeyIds(createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine }), [KID]);

test.each(['reordered known fields', 'unknown field before known fields'])(
  'Widevine inspection, editing, and conversion accept %s',
  (order) => {
    const kidField = new Uint8Array([0x12, 0x10, ...Buffer.from(KID, 'hex')]);
    const algorithmField = [0x08, 0x01];
    const unknownField = [0xf8, 0x07, 0x01];
    const data = new Uint8Array(
      order === 'reordered known fields'
        ? [...kidField, ...algorithmField]
        : [...unknownField, ...algorithmField, ...kidField],
    );
    const box = createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine, data });

    expect(getPsshKeyIds(box)).toEqual([KID]);
    const edited = setPsshKeyIds(box, [OTHER_KID]);
    expect(getPsshKeyIds(edited)).toEqual([OTHER_KID]);
    expect(WidevinePsshData.decode(edited.data).algorithm).toBe(WidevinePsshData.Algorithm.AESCTR);
    if (order === 'unknown field before known fields') {
      expect(Array.from(edited.data.slice(-3))).toEqual(unknownField);
    }
    expect(getPsshKeyIds(convertPsshBox(box, 'playready'))).toEqual([KID]);
    expect(box.data).toEqual(data);
  },
);

test.each([
  { name: 'truncated KID', data: [0x12, 0x10, 0x01] },
  { name: 'trailing incomplete varint', data: [0x08, 0x01, 0xf8, 0x07, 0x80] },
  { name: 'trailing incomplete bytes', data: [0x08, 0x01, 0xfa, 0x07, 0x02, 0x01] },
  { name: 'unexpected end group', data: [0x08, 0x01, 0x0c] },
])('Widevine operations reject $name', ({ data }) => {
  const box = createPsshBox({
    systemId: PSSH_SYSTEM_IDS.widevine,
    data: new Uint8Array([0x12, 0x10, ...Buffer.from(KID, 'hex'), ...data]),
  });
  expect(() => getPsshKeyIds(box)).toThrow();
  expect(() => setPsshKeyIds(box, [OTHER_KID])).toThrow();
  expect(() => convertPsshBox(box, 'playready')).toThrow();
});

test('construction and parsing own their payload bytes, including Node Buffers', () => {
  const input = Buffer.from([1, 2, 3]);
  const box = createPsshBox({ systemId: KID, data: input });
  input.fill(0);
  expect(box.data).toEqual(new Uint8Array([1, 2, 3]));
  const encoded = Buffer.from(serializePsshBox(box));
  const parsed = parsePsshBoxes(encoded)[0];
  encoded.fill(0);
  expect(parsed).toEqual(box);
});

test('conversion rejects mixed PlayReady algorithms and oversized generated records', () => {
  const source = setPsshKeyIds(widevine(), [KID, OTHER_KID]);
  const box = convertPsshBox(source, 'playready');
  const xml = Buffer.from(box.data.subarray(10)).toString('utf16le');
  const mixed = new Uint8Array(box.data);
  mixed.set(Buffer.from(xml.replace('AESCTR', 'AESCBC'), 'utf16le'), 10);
  expect(() => convertPsshBox({ ...box, data: mixed }, 'widevine')).toThrow('mixed');
  expect(() =>
    convertPsshBox(source, 'playready', { laUrl: `https://example.com/${'a'.repeat(33000)}` }),
  ).toThrow('size limit');
});

test('serializes known version 0 bytes and parses concatenated boxes from a buffer slice', () => {
  const empty = createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine });
  expect(Buffer.from(serializePsshBox(empty)).toString('hex')).toBe(
    '000000207073736800000000edef8ba979d64acea3c827dcd51d21ed00000000',
  );
  const v1 = createPsshBox({
    systemId: '00000000-0000-0000-0000-000000000000',
    version: 1,
    keyIds: [KID],
    flags: 0xffffff,
    data: new Uint8Array([1, 2]),
  });
  const joined = Buffer.concat([Buffer.from([255]), serializePsshBox(empty), serializePsshBox(v1)]);
  expect(parsePsshBoxes(joined.subarray(1))).toEqual([empty, v1]);
  expect(parsePsshBoxes(psshBoxToBase64(v1))).toEqual([v1]);
  expect(getPsshKeyIds(v1)).toEqual([KID]);
});

test('accepts extended sizes and size-to-end boxes, serializing with a normal size', () => {
  const normal = serializePsshBox(widevine());
  const extended = Buffer.concat([normal.subarray(0, 8), Buffer.alloc(8), normal.subarray(8)]);
  extended.writeUInt32BE(1, 0);
  extended.writeBigUInt64BE(BigInt(extended.length), 8);
  expect(serializePsshBox(parsePsshBoxes(extended)[0])).toEqual(normal);
  const toEnd = normal.slice();
  new DataView(toEnd.buffer).setUint32(0, 0);
  expect(serializePsshBox(parsePsshBoxes(toEnd)[0])).toEqual(normal);
});

test('rejects truncation, invalid versions, overflowing KID counts and mismatched lengths', () => {
  const bytes = serializePsshBox(
    createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine, version: 1, keyIds: [KID] }),
  );
  for (let length = 0; length < bytes.length; length++) {
    expect(() => parsePsshBoxes(bytes.subarray(0, length))).toThrow();
  }
  for (const [offset, value] of [
    [0, 12],
    [4, 0],
    [8, 0x02000000],
    [28, 0xffffffff],
    [48, 1],
  ]) {
    const corrupt = bytes.slice();
    new DataView(corrupt.buffer).setUint32(offset, value);
    expect(() => parsePsshBoxes(corrupt)).toThrow();
  }
  expect(() => parsePsshBoxes('%%%')).toThrow();
  expect(() => createPsshBox({ systemId: 'bad' })).toThrow();
  expect(() => createPsshBox({ systemId: KID, flags: 0x1000000 })).toThrow();
  expect(() =>
    createPsshBox({ systemId: KID, version: 1, keyIds: [new Uint8Array(15)] }),
  ).toThrow();
});

test.each([0, 1] as const)(
  'editing Widevine v%i preserves metadata and unknown protobuf fields',
  (version) => {
    const payload = WidevinePsshData.encode(
      WidevinePsshData.create({ provider: 'test-provider', contentId: new Uint8Array([1, 2, 3]) }),
    ).finish();
    const data = new Uint8Array([...payload, 0xf8, 0x07, 0x01]);
    const box = createPsshBox(
      version === 1
        ? { systemId: PSSH_SYSTEM_IDS.widevine, data, version, keyIds: [OTHER_KID] }
        : { systemId: PSSH_SYSTEM_IDS.widevine, data },
    );
    const before = serializePsshBox(box);
    const edited = setPsshKeyIds(box, [KID, OTHER_KID]);
    expect(serializePsshBox(box)).toEqual(before);
    expect(getPsshKeyIds(edited)).toEqual([KID, OTHER_KID]);
    expect(edited.keyIds).toEqual(version === 1 ? [KID, OTHER_KID] : []);
    const parsed = createPssh(serializePsshBox(edited));
    expect(parsed.data.provider).toBe('test-provider');
    expect(parsed.data.contentId).toEqual(new Uint8Array([1, 2, 3]));
    expect(Array.from(edited.data.slice(-3))).toEqual([0xf8, 0x07, 0x01]);
    expect(getPsshKeyIds(setPsshKeyIds(edited, []))).toEqual([]);
  },
);

test.each([0x63656e63, 0x63626373])(
  'converts scheme %i both ways using PlayReady GUID byte order',
  (protectionScheme) => {
    const source = setPsshKeyIds(
      createPsshBox({
        systemId: PSSH_SYSTEM_IDS.widevine,
        version: 1,
        flags: 7,
        data: WidevinePsshData.encode(WidevinePsshData.create({ protectionScheme })).finish(),
      }),
      [KID, OTHER_KID],
    );
    const converted = convertPsshBox(source, 'playready', {
      laUrl: 'https://example.com/许可?a=1&b=2',
    });
    const header = new WrmHeader(new Pssh(serializePsshBox(converted)).wrmHeaders[0]);
    expect(Buffer.from(header.keyIds[0].value).toString('hex')).toBe(
      '33221100554477668899aabbccddeeff',
    );
    expect(header.keyIds[0].algId).toBe(protectionScheme === 0x63656e63 ? 'AESCTR' : 'AESCBC');
    expect(header.keyIds[0].checksum).toBeNull();
    expect(header.laUrl).toBe('https://example.com/许可?a=1&b=2');
    expect(getPsshKeyIds({ ...converted, version: 0, keyIds: [] })).toEqual([KID, OTHER_KID]);
    const restored = convertPsshBox(converted, 'widevine');
    expect(getPsshKeyIds(restored)).toEqual([KID, OTHER_KID]);
    expect(restored.flags).toBe(7);
    expect(restored.version).toBe(1);
    expect(WidevinePsshData.decode(restored.data).protectionScheme).toBe(protectionScheme);
  },
);

test('reads legacy PlayReady versions and rejects corrupt objects or unsupported algorithms', () => {
  const kid = 'MyIRAFVEd2aImaq7zN3u/w==';
  for (const version of ['4.0.0.0', '4.1.0.0', '4.2.0.0', '4.3.0.0']) {
    let info = `<KID ALGID="AESCTR" VALUE="${kid}"></KID>`;
    if (version === '4.2.0.0' || version === '4.3.0.0') info = `<KIDS>${info}</KIDS>`;
    let content = `<PROTECTINFO>${info}</PROTECTINFO>`;
    if (version === '4.0.0.0')
      content = `<PROTECTINFO><KEYLEN>16</KEYLEN><ALGID>AESCTR</ALGID></PROTECTINFO><KID>${kid}</KID>`;
    const xml = Buffer.from(
      `<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="${version}"><DATA>${content}</DATA></WRMHEADER>`,
      'utf16le',
    );
    const pro = Buffer.alloc(10 + xml.length);
    pro.writeUInt32LE(pro.length, 0);
    pro.writeUInt16LE(1, 4);
    pro.writeUInt16LE(1, 6);
    pro.writeUInt16LE(xml.length, 8);
    pro.set(xml, 10);
    const box = createPsshBox({ systemId: PSSH_SYSTEM_IDS.playready, data: pro });
    expect(getPsshKeyIds(box)).toEqual([KID]);
    expect(getPsshKeyIds(convertPsshBox(box, 'widevine'))).toEqual([KID]);
    const corrupt = { ...box, data: box.data.slice(0, -1) };
    expect(() => getPsshKeyIds(corrupt)).toThrow();
  }
  const unsupported = createPsshBox({
    systemId: PSSH_SYSTEM_IDS.widevine,
    data: WidevinePsshData.encode(WidevinePsshData.create({ protectionScheme: 123 })).finish(),
  });
  expect(() => convertPsshBox(setPsshKeyIds(unsupported, [KID]), 'playready')).toThrow('scheme');
  expect(() => convertPsshBox(widevine(), 'widevine')).toThrow('already');
  expect(() => setPsshKeyIds(convertPsshBox(widevine(), 'playready'), [KID])).toThrow('only');
  expect(() =>
    convertPsshBox(createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine }), 'playready'),
  ).toThrow('at least one');
});
