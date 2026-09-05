import { readFile } from 'node:fs/promises';
import { assert, expect, test } from 'vitest';
import {
  PlayReady,
  PlayReadyDeviceCredentials,
  Widevine,
  WidevineDeviceCredentials,
} from '../src/lib';
import { createPsshBox, parsePsshBoxes, PSSH_SYSTEM_IDS, serializePsshBox } from '../src/lib/pssh';
import { Pssh } from '../src/lib/playready/pssh';
import { createPssh } from '../src/lib/widevine/pssh';
import { LicenseRequest, SignedMessage, WidevinePsshData } from '../src/lib/widevine/proto';

const xml =
  '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0"><DATA><LA_URL>https://example.test/许可/Привет/😀</LA_URL></DATA></WRMHEADER>';
const pro = new Uint8Array(10 + xml.length * 2);
const proView = new DataView(pro.buffer);
proView.setUint32(0, pro.length, true);
proView.setUint16(4, 1, true);
proView.setUint16(6, 1, true);
proView.setUint16(8, pro.length - 10, true);
pro.set(Buffer.from(xml, 'utf16le'), 10);
const payload = WidevinePsshData.encode(
  WidevinePsshData.create({ provider: 'parser-test' }),
).finish();
const widevineBox = serializePsshBox(
  createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine, data: payload }),
);
const playreadyBox = serializePsshBox(
  createPsshBox({ systemId: PSSH_SYSTEM_IDS.playready, data: pro }),
);

const variants = (box: Uint8Array, other: Uint8Array) => {
  const extended = new Uint8Array(box.length + 8);
  const view = new DataView(extended.buffer);
  view.setUint32(0, 1);
  extended.set(box.subarray(4, 8), 4);
  view.setBigUint64(8, BigInt(extended.length));
  extended.set(box.subarray(8), 16);
  const toEnd = new Uint8Array(box);
  toEnd.fill(0, 0, 4);
  const parsed = parsePsshBoxes(box)[0];
  assert(parsed);
  const version1 = serializePsshBox(
    createPsshBox({ ...parsed, version: 1, keyIds: ['ab'.repeat(16)] }),
  );
  return [
    { name: 'normal', bytes: box },
    { name: 'extended', bytes: extended },
    { name: 'size-to-end', bytes: toEnd },
    { name: 'version 1', bytes: version1 },
    { name: 'concatenated', bytes: new Uint8Array([...other, ...extended]) },
    { name: 'raw', bytes: parsed.data },
  ];
};

const widevineInputs = variants(widevineBox, playreadyBox);
const playreadyInputs = variants(playreadyBox, widevineBox);

test.each(widevineInputs)('Widevine acquisition parses $name', ({ bytes, name }) => {
  expect(createPssh(bytes).toBuffer()).toEqual(payload);
  if (name !== 'raw')
    expect(
      parsePsshBoxes(bytes).find((box) => box.systemId === PSSH_SYSTEM_IDS.widevine)?.data,
    ).toEqual(payload);
});

test.each(playreadyInputs)('PlayReady acquisition parses $name', ({ bytes, name }) => {
  expect(new Pssh(bytes).wrmHeaders).toEqual([xml]);
  if (name !== 'raw')
    expect(
      parsePsshBoxes(bytes).find((box) => box.systemId === PSSH_SYSTEM_IDS.playready)?.data,
    ).toEqual(pro);
});

test.each([widevineBox, playreadyBox])(
  'both acquisition parsers reject malformed box sequences',
  (box) => {
    const version = new Uint8Array(box);
    version[8] = 2;
    const length = new Uint8Array(box);
    new DataView(length.buffer).setUint32(28, box.length);
    const smallBox = new Uint8Array(box);
    new DataView(smallBox.buffer).setUint32(0, 8);
    const malformed = [
      version,
      length,
      smallBox,
      box.subarray(0, 20),
      new Uint8Array([...box, 0]),
      new Uint8Array([...length, ...widevineBox]),
    ];
    for (const bytes of malformed) {
      expect(() => parsePsshBoxes(bytes)).toThrow();
      expect(() => createPssh(bytes)).toThrow();
      expect(() => new Pssh(bytes)).toThrow();
    }
  },
);

test('rejects a box sequence that has no matching DRM system', () => {
  expect(() => createPssh(playreadyBox)).toThrow('No Widevine PSSH');
  expect(() => new Pssh(widevineBox)).toThrow('No PlayReady PSSH');
});

const wvdPath = process.env.VITEST_WVD_PATH;
const prdPath = process.env.VITEST_PRD_PATH;

test.skipIf(!wvdPath).each(widevineInputs)(
  'Widevine challenge preserves payload from $name',
  async ({ bytes }) => {
    assert(wvdPath, 'Set VITEST_WVD_PATH to enable offline challenge tests');
    const engine = new Widevine({
      deviceCredentials: await WidevineDeviceCredentials.from({ wvd: await readFile(wvdPath) }),
    });
    const session = engine.createSession();
    const messages: Uint8Array[] = [];
    session.onmessage = (event) => {
      messages.push(event.detail.message);
    };
    try {
      await session.generateRequest(bytes);
      expect(messages).toHaveLength(1);
      const message = messages[0];
      assert(message);
      const request = LicenseRequest.decode(SignedMessage.decode(message).msg);
      expect(request.contentId?.widevinePsshData?.psshData).toEqual([payload]);
    } finally {
      await session.close();
    }
  },
);

test.skipIf(!prdPath).each(playreadyInputs)(
  'PlayReady challenge preserves Unicode header from $name',
  async ({ bytes }) => {
    assert(prdPath, 'Set VITEST_PRD_PATH to enable offline challenge tests');
    const engine = new PlayReady({
      deviceCredentials: await PlayReadyDeviceCredentials.from({ prd: await readFile(prdPath) }),
    });
    const session = engine.createSession();
    const messages: Uint8Array[] = [];
    session.onmessage = (event) => {
      messages.push(event.detail.message);
    };
    try {
      await session.generateRequest(bytes);
      expect(messages).toHaveLength(1);
      expect(new TextDecoder().decode(messages[0])).toContain(xml);
    } finally {
      await session.close();
    }
  },
);
