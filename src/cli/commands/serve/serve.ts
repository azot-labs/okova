import { readdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import fastify from 'fastify';
import AutoLoad from '@fastify/autoload';
import RateLimit from '@fastify/rate-limit';
import Helmet from '@fastify/helmet';
import Sensible from '@fastify/sensible';
import { help } from './help';
import { config, loadConfig } from './state';

type ServeOptions = {
  host?: string;
  port?: number;
  config?: string;
  client?: string;
  secret?: string;
};

export const serve = async (options: ServeOptions = {}) => {
  const server = fastify({ logger: true });

  const configPath = options.config || 'azot.config.json';
  await loadConfig(configPath);
  if (options.client) config.clients.push(options.client);
  if (!config.clients.length) {
    const files = await readdir(process.cwd());
    const clientPath = files.find((file) => file.endsWith('.wvd'));
    if (clientPath) config.clients.push(clientPath);
  }
  if (options.secret) {
    const anonymousUser = { name: 'anonymous', clients: [] };
    const user = config.users[options.secret] || anonymousUser;
    const clientFilename = basename(options.client || config.clients.at(-1)!);
    const clientName = clientFilename.replace(extname(clientFilename), '');
    if (!user.clients.length) user.clients.push(clientName);
    config.users[options.secret] = user;
  }

  server.register(AutoLoad, { dir: `${import.meta.dirname || __dirname}/api` });
  server.register(RateLimit, { max: 100, timeWindow: '1 minute' });
  server.register(Helmet, { global: true });
  server.register(Sensible);

  server
    .listen({ port: options.port || 4000, host: options.host || '0.0.0.0' })
    .catch((err) => {
      server.log.error(err);
      process.exit(1);
    });
};

serve.help = help;
