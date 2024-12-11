import { readFile } from 'node:fs/promises';
import { Session } from '../../../lib/session';
import { Client } from '../../../lib/client';

export const sessions = new Map<string, Session>();
export const clients = new Map<string, Client>();

type Config = {
  host: string;
  port: number;
  clients: string[];
  users: { [key: string]: { name: string; clients: string[] } };
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
