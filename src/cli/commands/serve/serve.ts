import { readdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { showRoutes } from 'hono/dev';
import { serve as nodeServe } from '@hono/node-server';
import { help } from './help';
import { config, loadConfig } from './state';
import session from './api/session';

type ServeOptions = {
  host?: string;
  port?: number;
  config?: string;
  client?: string;
  secret?: string;
};

export const serve = async (options: ServeOptions = {}) => {
  const configPath = options.config || 'okova.config.json';
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

  const app = new Hono();

  app.use(logger());
  app.use(secureHeaders());

  app.route('/session', session);

  showRoutes(app);

  const server = nodeServe({
    fetch: app.fetch,
    port: config.port || 4000,
    hostname: config.host || '0.0.0.0',
  });

  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    server.close((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      process.exit(0);
    });
  });
};

serve.help = help;
