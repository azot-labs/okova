import { Bytes, Const, Int32ub, Int8ub, Struct, Switch } from '../construct';
import { fromText } from '../utils';

export const PRD_MAGIC = fromText('PRD').toBuffer();

export const PRD2 = Struct({
  signature: Const(PRD_MAGIC),
  version: Int8ub,
  group_certificate_length: Int32ub,
  group_certificate: Bytes((ctx) => ctx.group_certificate_length),
  encryption_key: Bytes(96),
  signing_key: Bytes(96),
});

export const PRD3 = Struct({
  signature: Const(PRD_MAGIC),
  version: Int8ub,
  group_key: Bytes(96),
  encryption_key: Bytes(96),
  signing_key: Bytes(96),
  group_certificate_length: Int32ub,
  group_certificate: Bytes((ctx) => ctx.group_certificate_length),
});

export const PRD = Struct({
  signature: Const(PRD_MAGIC),
  version: Int8ub,
  data: Switch((ctx) => ctx.version, {
    2: PRD2,
    3: PRD3,
  }),
});
