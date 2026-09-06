import { expect, test } from 'vitest';
import { parsePsshBoxes, PSSH_SYSTEM_IDS } from '../src/lib/pssh';
import { Pssh } from '../src/lib/playready/pssh';
import { createPssh } from '../src/lib/widevine/pssh';
import {
  widevineInputs,
  playreadyInputs,
  widevineBox,
  playreadyBox,
  payload,
  xml,
  pro,
} from './helpers/pssh-acquisition';

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
