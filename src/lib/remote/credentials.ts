import { fromBuffer } from '../utils';
import { z } from 'zod';
import { okovaConfigSchema } from './protocol';
import {
  pywidevineConfigSchema,
  pyplayreadyConfigSchema,
  pywidevineFileSchema,
} from './pywidevine';

const credentialsDataSchema = z.discriminatedUnion('protocol', [
  okovaConfigSchema,
  pywidevineConfigSchema,
  pyplayreadyConfigSchema,
]);
// Accept previously exported Okova connections without changing third-party device fields.
export const remoteCredentialsSchema = z.preprocess((value) => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'client' in value &&
    !('credentials' in value)
  ) {
    return { ...value, credentials: value.client };
  }
  return value;
}, credentialsDataSchema);
export type RemoteCredentialsData = z.infer<typeof remoteCredentialsSchema>;

export const parseRemoteCredentialsData = (value: unknown): RemoteCredentialsData => {
  if (typeof value === 'object' && value !== null && 'host' in value)
    return remoteCredentialsSchema.parse(pywidevineFileSchema.parse(value));
  if (typeof value === 'object' && value !== null && !('protocol' in value)) {
    return remoteCredentialsSchema.parse({ ...value, protocol: 'okova' });
  }
  return remoteCredentialsSchema.parse(value);
};

/** Connection and authentication data for a remote DRM server. */
export class RemoteCredentials {
  private constructor(
    readonly config: RemoteCredentialsData,
    readonly filename: string,
  ) {}

  static async from(value: unknown) {
    const config = parseRemoteCredentialsData(value);
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(config)),
    );
    return new RemoteCredentials(
      config,
      `remote-${fromBuffer(new Uint8Array(digest)).toHex()}.json`,
    );
  }

  get label() {
    return (
      this.config.label ??
      `${this.credentialName ?? 'Default credentials'} @ ${new URL(this.config.baseUrl).host}`
    );
  }
  get credentialName() {
    return this.config.protocol === 'okova' ? this.config.credentials : this.config.device;
  }
  get protocolLabel() {
    return this.config.protocol === 'okova' ? 'Okova' : this.config.protocol;
  }
  get keySystem() {
    return this.config.keySystem;
  }
  getName() {
    return this.label;
  }
  async pack() {
    return new TextEncoder().encode(JSON.stringify(this.config, null, 2) + '\n');
  }
}
