import { z } from 'zod';
import { okovaConfigSchema } from './protocol';
import {
  pywidevineConfigSchema,
  pyplayreadyConfigSchema,
  pywidevineFileSchema,
} from './pywidevine';

export const remoteConfigSchema = z.discriminatedUnion('protocol', [
  okovaConfigSchema,
  pywidevineConfigSchema,
  pyplayreadyConfigSchema,
]);
export type RemoteConfig = z.infer<typeof remoteConfigSchema>;

export const parseRemoteConfig = (value: unknown): RemoteConfig => {
  if (typeof value === 'object' && value !== null && 'host' in value)
    return remoteConfigSchema.parse(pywidevineFileSchema.parse(value));
  if (typeof value === 'object' && value !== null && !('protocol' in value)) {
    return remoteConfigSchema.parse({ ...value, protocol: 'okova' });
  }
  return remoteConfigSchema.parse(value);
};
