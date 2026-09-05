import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { showRoutes } from 'hono/dev';
import { serve as nodeServe } from '@hono/node-server';
import { help } from './help';
import { config, loadConfig, sessions } from './state';
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
    const clientPath = options.client ?? config.clients.at(-1);
    if (!user.clients.length && clientPath) user.clients.push(resolve(clientPath));
    config.users[options.secret] = user;
  }

  const app = new Hono();
  const pendingRequests = new Set<Promise<void>>();
  let isShuttingDown = false;

  app.use(async (c, next) => {
    if (isShuttingDown) return c.json({ error: 'Server is shutting down' }, 503);
    const completed = Promise.withResolvers<void>();
    pendingRequests.add(completed.promise);
    try {
      await next();
    } finally {
      pendingRequests.delete(completed.promise);
      completed.resolve();
    }
  });

  app.use(logger());
  app.use(secureHeaders());

  app.route('/sessions', session);

  showRoutes(app);

  const server = nodeServe({
    fetch: app.fetch,
    port: options.port ?? config.port ?? 4000,
    hostname: options.host ?? config.host ?? '0.0.0.0',
  });

  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    const disconnected = new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    // Release key waiters first, then close sessions created by requests still draining.
    // Track handlers too: a pending device load can outlive its disconnected socket.
    void Promise.all([disconnected, sessions.clear(), ...pendingRequests])
      .then(() => sessions.clear())
      .then(
        () => process.exit(0),
        (error: unknown) => {
          console.error('Failed to shut down server', error);
          process.exit(1);
        },
      );
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

serve.help = help;
