import { readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { WidevineDeviceCredentials } from '../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../lib/playready/device-credentials';
import { SessionRegistry, sessionLimitsSchema } from './session-registry';

export const clients = new Map<string, WidevineDeviceCredentials | PlayReadyDeviceCredentials>();

type Config = {
  host: string;
  port: number;
  clients: string[];
  users: { [secretKey: string]: { name: string; clients: string[] } };
  forcePrivacyMode: boolean;
  sessionLimits: ReturnType<typeof sessionLimitsSchema.parse>;
};

const defaultConfig = {
  host: '0.0.0.0',
  port: 4000,
  clients: [],
  users: {},
  forcePrivacyMode: true,
  sessionLimits: sessionLimitsSchema.parse({}),
};

export const config: Config = structuredClone(defaultConfig);
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

export const loadConfig = async (configPath: string) => {
  const data = await readFile(configPath, { encoding: 'utf-8' })
    .then((data) => JSON.parse(data))
    .catch(() => defaultConfig);
  const sessionLimits = sessionLimitsSchema.parse(data.sessionLimits ?? {});
  Object.assign(config, data, { sessionLimits });
};
