import { readFile } from 'node:fs/promises';
import { WidevineClient } from '../../../lib/widevine/client';
import { PlayReadyClient } from '../../../lib/playready/client';
import { Session } from '../../../lib';

export const sessions = new Map<string, MediaKeySession & Session>();
export const clients = new Map<string, WidevineClient | PlayReadyClient>();

type Config = {
  host: string;
  port: number;
  clients: string[];
  users: { [secretKey: string]: { name: string; clients: string[] } };
  forcePrivacyMode: boolean;
};

const defaultConfig = {
  host: '0.0.0.0',
  port: 4000,
  clients: [],
  users: {},
  forcePrivacyMode: true,
};

export const config: Config = defaultConfig;

export const loadConfig = async (configPath: string) => {
  const data = await readFile(configPath, { encoding: 'utf-8' })
    .then((data) => JSON.parse(data))
    .catch(() => defaultConfig);
  Object.assign(config, data);
};
