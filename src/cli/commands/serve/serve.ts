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

  await loadConfig(options.config || 'azot.config.json');
  if (options.client) config.clients.push(options.client);
  if (options.secret && options.client) {
    const clientFilename = basename(options.client);
    const clientName = clientFilename.replace(extname(clientFilename), '');
    config.users[options.secret] = {
      name: 'anonymous',
      clients: [clientName],
    };
  }

  server.register(AutoLoad, { dir: `${import.meta.dirname}/api` });
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
