import { b } from 'barsic';
import { fromText } from '../utils';

export const PRD_MAGIC = fromText('PRD').toBuffer();

export const PRD2 = b.object({
  signature: b.literal('PRD'),
  version: b.uint8(),
  group_certificate_length: b.uint32(),
  group_certificate: b.bytes((ctx) => ctx.group_certificate_length),
  encryption_key: b.bytes(96),
  signing_key: b.bytes(96),
});

export const PRD3 = b.object({
  signature: b.literal('PRD'),
  version: b.uint8(),
  group_key: b.bytes(96),
  encryption_key: b.bytes(96),
  signing_key: b.bytes(96),
  group_certificate_length: b.uint32(),
  group_certificate: b.bytes((ctx) => ctx.group_certificate_length),
});

const PRD_HEADER = b.object({
  signature: b.literal('PRD'),
  version: b.uint8(),
});

export const parsePrd = (data: Uint8Array) => {
  const { version } = PRD_HEADER.parse(data, false);
  switch (version) {
    case 2:
      return { ...PRD2.parse(data), group_key: undefined };
    case 3:
      return PRD3.parse(data);
    default:
      throw new Error(`Unsupported PRD version: ${version}`);
  }
};
