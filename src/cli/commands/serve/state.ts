import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { WidevineDeviceCredentials } from '../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../lib/playready/device-credentials';
import { SessionRegistry, sessionLimitsSchema } from './session-registry';

export const clients = new Map<string, WidevineDeviceCredentials | PlayReadyDeviceCredentials>();

const configSchema = z.strictObject({
  host: z.string().min(1).default('0.0.0.0'),
  port: z.number().int().min(0).max(65535).default(4000),
  clients: z.array(z.string().min(1)).default([]),
  users: z
    .record(z.string(), z.strictObject({ name: z.string(), clients: z.array(z.string()) }))
    .default({}),
  forcePrivacyMode: z.boolean().default(true),
  sessionLimits: sessionLimitsSchema.strict().prefault({}),
});

export const config = configSchema.parse({});
export const sessions = new SessionRegistry(() => config.sessionLimits);

// Aliases must identify exactly one configured device, regardless of list order.
export const resolveClient = (identifier: string) => {
  const paths = new Set(
    config.clients
      .filter(
        (path) =>
          identifier === path ||
          identifier === resolve(path) ||
          identifier === basename(path) ||
          identifier === basename(path, extname(path)),
      )
      .map((path) => resolve(path)),
  );
  return paths.size === 1 ? paths.values().next().value : undefined;
};

// Only an absent implicit config permits starting with defaults.
export const loadConfig = async (configPath?: string) => {
  const path = configPath ?? 'okova.config.json';
  let text: string;
  try {
    text = await readFile(path, 'utf-8');
  } catch (error) {
    if (
      configPath === undefined &&
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      Object.assign(config, configSchema.parse({}));
      return;
    }
    throw new Error(`Cannot read server config "${path}"`, { cause: error });
  }
  try {
    const data: unknown = JSON.parse(text);
    Object.assign(config, configSchema.parse(data));
  } catch (error) {
    throw new Error(
      `Invalid server config "${path}": ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
};
