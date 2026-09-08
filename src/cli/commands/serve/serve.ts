import { extname, resolve } from 'node:path';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { showRoutes } from 'hono/dev';
import { serve as nodeServe } from '@hono/node-server';
import { help } from './help';
import { listFiles } from '../../utils';
import { config, loadConfig, sessions } from './state';
import session from './api/session';
import { requestBoundary } from './request-boundary';

type ServeOptions = {
  host?: string;
  port?: number;
  config?: string;
  credentials?: string;
  secret?: string;
  public?: boolean;
};

const describeCredentials = (path: string) => {
  const format = extname(path).toLowerCase();
  const drm = { '.wvd': 'Widevine', '.prd': 'PlayReady' }[format] ?? 'unknown DRM';
  return `${resolve(path)} (${drm}, based on file extension)`;
};

export const serve = async (options: ServeOptions = {}) => {
  await loadConfig(options.config);
  if (options.credentials) {
    config.credentials = [
      options.credentials,
      ...config.credentials.filter((path) => path !== options.credentials),
    ];
  }
  if (!config.credentials.length) {
    const files = await listFiles(process.cwd());
    const candidates = files.filter((file) => /\.(wvd|prd)$/.test(file)).sort();
    if (candidates.length > 1) {
      console.warn(
        'Multiple credential files found. Selecting the first filename in sorted order.',
      );
    }
    const credentialsPath = candidates[0];
    if (credentialsPath) config.credentials.push(credentialsPath);
  }
  if (!options.credentials && config.credentials[0]) {
    console.warn(
      `Default credentials: ${describeCredentials(config.credentials[0])}. ` +
        'Using the first configured file. Use --credentials to choose credentials explicitly.',
    );
  }
  if (options.secret) {
    const anonymousUser = { name: 'anonymous', credentials: [] };
    const user = Object.hasOwn(config.users, options.secret)
      ? config.users[options.secret]!
      : anonymousUser;
    const credentialsPath = options.credentials ?? config.credentials[0];
    if (!user.credentials.length && credentialsPath) {
      user.credentials.push(resolve(credentialsPath));
      if (!options.credentials) {
        console.warn(
          `Granted --secret access to ${describeCredentials(credentialsPath)}. ` +
            'Use --credentials to choose a different grant.',
        );
      }
    }
    config.users = { ...config.users, [options.secret]: user };
  }

  config.public = options.public ?? config.public;
  config.host = options.host ?? config.host;
  if (!config.public && !Object.keys(config.users).length) {
    throw new Error(
      'Configure users or --secret, or explicitly enable anonymous access with --public',
    );
  }
  if (['0.0.0.0', '::'].includes(config.host) && !config.allowedHosts.length) {
    throw new Error(
      'Wildcard binding requires allowedHosts with the names or IP addresses credentials use',
    );
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

  app.use(requestBoundary);

  app.route('/sessions', session);

  showRoutes(app);

  const server = nodeServe({
    fetch: app.fetch,
    port: options.port ?? config.port ?? 4000,
    hostname: config.host,
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
