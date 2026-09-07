import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { WidevineClientCredentials } from '../../../lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../../../lib/playready/client-credentials';
import { SessionRegistry, sessionLimitsSchema } from './session-registry';

export const credentialCache = new Map<
  string,
  WidevineClientCredentials | PlayReadyClientCredentials
>();

const configSchema = z.strictObject({
  host: z.string().min(1).default('127.0.0.1'),
  public: z.boolean().default(false),
  maxRequestBodyBytes: z
    .number()
    .int()
    .positive()
    .max(64 * 1024 * 1024)
    .default(1024 * 1024),
  allowedHosts: z
    .array(
      z
        .string()
        .min(1)
        .refine((host) => {
          try {
            const url = new URL(`http://${host}`);
            return (
              /^[a-z0-9._-]+$|^\[[0-9a-f:]+\]$/.test(host) &&
              url.host === host &&
              url.hostname === host
            );
          } catch {
            return false;
          }
        }, 'Expected a lowercase hostname or bracketed IPv6 address without a port'),
    )
    .default([]),
  allowedOrigins: z
    .array(
      z.string().refine((origin) => {
        try {
          const url = new URL(origin);
          return ['http:', 'https:'].includes(url.protocol) && url.origin === origin;
        } catch {
          return false;
        }
      }, 'Expected an HTTP(S) origin without a trailing slash'),
    )
    .optional()
    .transform((origins) => origins ?? null),
  port: z.number().int().min(0).max(65535).default(4000),
  credentials: z.array(z.string().min(1)).default([]),
  users: z
    .record(
      z.string().min(1),
      z.strictObject({ name: z.string(), credentials: z.array(z.string()) }),
    )
    .default({}),
  forcePrivacyMode: z.boolean().default(true),
  sessionLimits: sessionLimitsSchema.strict().prefault({}),
});

export const config = configSchema.parse({});
export const sessions = new SessionRegistry(() => config.sessionLimits);

// Aliases must identify exactly one configured credential file, regardless of list order.
export const resolveCredentials = (identifier: string) => {
  const paths = new Set(
    config.credentials
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
