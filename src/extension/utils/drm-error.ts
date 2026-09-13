import { z } from 'zod';

export const drmStages = {
  setup: 'Request setup',
  credentials: 'Credentials loading',
  certificate: 'Server certificate',
  session: 'Session creation',
  challenge: 'Challenge generation',
  license: 'License processing',
  keys: 'Key extraction',
  storage: 'Session storage',
  history: 'Key storage',
  close: 'Session cleanup',
} as const;

export type DrmStage = keyof typeof drmStages;
export const drmErrorSchema = z.object({
  kind: z.enum(['request', 'timeout', 'transport']),
  stage: z.union([
    z.enum(Object.keys(drmStages) as [DrmStage, ...DrmStage[]]),
    z.literal('bridge'),
  ]),
  message: z.string(),
});

export type DrmErrorData = z.infer<typeof drmErrorSchema>;
export type DrmErrorResponse = { error: DrmErrorData };

/** Reconstructed on the page because Error instances do not survive runtime messaging. */
export class DrmRequestError extends Error {
  readonly kind: DrmErrorData['kind'];
  readonly stage: DrmStage | 'bridge';

  constructor(error: DrmErrorData) {
    super(error.message);
    this.name = 'DrmRequestError';
    this.kind = error.kind;
    this.stage = error.stage;
  }
}

export const drmErrorResponse = (
  error: unknown,
  stage: DrmStage | 'bridge',
  kind: DrmErrorData['kind'] = 'request',
): DrmErrorResponse => ({
  error: { kind, stage, message: error instanceof Error ? error.message : String(error) },
});
