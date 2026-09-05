import { z } from 'zod';

// Unversioned snapshots were written before v1 and share its required fields.
export const sessionStateSchema = z.object({
  version: z.literal(1).default(1),
  sessionId: z.string().min(1),
  sessionType: z.enum(['temporary', 'persistent-license']),
  initData: z.base64().optional(),
  initDataType: z.string().optional(),
});

export const keyStatusSchema = z.enum([
  'usable',
  'expired',
  'released',
  'output-restricted',
  'output-downscaled',
  'status-pending',
  'internal-error',
  'usable-in-future',
]);

export const hexBytesSchema = z.string().regex(/^(?:[0-9a-fA-F]{2})+$/);
