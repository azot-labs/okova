import { expect, test } from 'vitest';
import { createPsshBox, serializePsshBox, PSSH_SYSTEM_IDS } from '../src/lib/pssh';
import {
  getPsshBadgeLabels,
  getPsshSystemLabels,
  getSessionSystemLabels,
} from '../src/extension/entrypoints/popup/utils/drm-system-labels';

const pssh = (systemId: string) => serializePsshBox(createPsshBox({ systemId }));
const encoded = (...boxes: Uint8Array[]) => Buffer.concat(boxes).toString('base64');

test('hides only a known one-to-one match with the session system', () => {
  const widevine = pssh(PSSH_SYSTEM_IDS.widevine);
  const playready = pssh(PSSH_SYSTEM_IDS.playready);
  expect(getPsshBadgeLabels(encoded(widevine), ['W', 'W'])).toEqual([]);
  expect(getPsshBadgeLabels(encoded(playready), ['P'])).toEqual([]);
  expect(getPsshBadgeLabels(encoded(widevine, playready), ['W'])).toEqual([
    'Widevine',
    'PlayReady',
  ]);
  expect(getPsshBadgeLabels(encoded(playready), ['W'])).toEqual(['PlayReady']);
  expect(getPsshBadgeLabels(encoded(widevine), ['W', 'P'])).toEqual(['Widevine']);
  expect(getPsshBadgeLabels(encoded(widevine), [undefined])).toEqual(['Widevine']);
  expect(getPsshBadgeLabels('invalid', [undefined])).toEqual(['Unknown']);
});

test('session labels use recorded systems and deduplicate mixed sessions', () => {
  expect(getSessionSystemLabels(['W', 'P', 'W', undefined])).toEqual(['Widevine', 'PlayReady']);
  expect(getSessionSystemLabels(['C'])).toEqual(['ClearKey']);
  expect(getSessionSystemLabels([undefined])).toEqual(['Unknown']);
  expect(getSessionSystemLabels([])).toEqual(['Unknown']);
});

test('PSSH labels come from every embedded system ID', () => {
  const widevine = pssh(PSSH_SYSTEM_IDS.widevine);
  const playready = pssh(PSSH_SYSTEM_IDS.playready);
  expect(getPsshSystemLabels(encoded(widevine))).toEqual(['Widevine']);
  expect(getPsshSystemLabels(encoded(playready))).toEqual(['PlayReady']);
  expect(getPsshSystemLabels(encoded(widevine, playready, widevine))).toEqual([
    'Widevine',
    'PlayReady',
  ]);
});

test('unknown IDs and malformed data are not guessed', () => {
  const unknown = pssh('00000000000000000000000000000000');
  expect(getPsshSystemLabels(encoded(unknown))).toEqual(['Unknown']);
  expect(getPsshSystemLabels(encoded(pssh(PSSH_SYSTEM_IDS.widevine), unknown))).toEqual([
    'Widevine',
    'Unknown',
  ]);
  expect(getPsshSystemLabels('invalid')).toEqual(['Unknown']);
  expect(getPsshSystemLabels('')).toEqual(['Unknown']);
  expect(getPsshSystemLabels(encoded(pssh(PSSH_SYSTEM_IDS.playready).subarray(0, 20)))).toEqual([
    'Unknown',
  ]);
});
