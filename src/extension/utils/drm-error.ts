export const drmStages = {
  setup: 'Request setup',
  credentials: 'Credentials loading',
  certificate: 'Server certificate',
  session: 'DRM session',
  challenge: 'Challenge generation',
  license: 'License processing',
  keys: 'Key extraction',
  storage: 'Session storage',
  history: 'Key storage',
  close: 'Session cleanup',
} as const;

export type DrmStage = keyof typeof drmStages;
export type DrmErrorData = {
  kind: 'request' | 'timeout' | 'transport';
  stage: DrmStage | 'bridge';
  message: string;
};
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
