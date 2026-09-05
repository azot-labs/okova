import { fromBase64 } from '../utils';
import { WidevinePsshData } from './proto';
import { tryDecodeExactly } from './protobuf';
import { isPsshBoxSequence, parsePsshBoxes, PSSH_SYSTEM_IDS } from '../pssh';

const normalizeInput = (data: Uint8Array | string) =>
  typeof data === 'string' ? fromBase64(data).toBuffer() : data;

const createPssh = (initData: Uint8Array | string) => {
  const input = normalizeInput(initData);
  // Non-box input remains an opaque payload for compatibility with vendor headers.
  const boxes = isPsshBoxSequence(input) ? parsePsshBoxes(input) : null;
  const payload = boxes
    ? boxes.find((box) => box.systemId === PSSH_SYSTEM_IDS.widevine)?.data
    : input;
  if (!payload) throw new Error('No Widevine PSSH box found');
  const parsed = tryDecodeExactly(payload, WidevinePsshData);

  return {
    data: parsed ?? WidevinePsshData.create({}),
    toBuffer: () => (parsed ? WidevinePsshData.encode(parsed).finish() : payload),
  };
};

export type PSSH = ReturnType<typeof createPssh>;

export { createPssh };
