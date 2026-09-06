import { assert } from 'vitest';
import {
  createPsshBox,
  parsePsshBoxes,
  PSSH_SYSTEM_IDS,
  serializePsshBox,
} from '../../src/lib/pssh';
import { WidevinePsshData } from '../../src/lib/widevine/proto';

export const xml =
  '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0"><DATA><LA_URL>https://example.test/许可/Привет/😀</LA_URL></DATA></WRMHEADER>';
export const pro = new Uint8Array(10 + xml.length * 2);
const proView = new DataView(pro.buffer);
proView.setUint32(0, pro.length, true);
proView.setUint16(4, 1, true);
proView.setUint16(6, 1, true);
proView.setUint16(8, pro.length - 10, true);
pro.set(Buffer.from(xml, 'utf16le'), 10);
export const payload = WidevinePsshData.encode(
  WidevinePsshData.create({ provider: 'parser-test' }),
).finish();
export const widevineBox = serializePsshBox(
  createPsshBox({ systemId: PSSH_SYSTEM_IDS.widevine, data: payload }),
);
export const playreadyBox = serializePsshBox(
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

export const widevineInputs = variants(widevineBox, playreadyBox);
export const playreadyInputs = variants(playreadyBox, widevineBox);
