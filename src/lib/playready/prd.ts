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

export const PRD = b.object({
  signature: b.literal('PRD'),
  version: b.uint8(),
  data: b.variant((ctx) => ctx.version, {
    2: PRD2,
    3: PRD3,
  }),
});
