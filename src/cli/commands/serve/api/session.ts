import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { fromBuffer, MediaKeyMessageEvent, PlayReady, Widevine, Session } from '../../../../lib';
import { WidevineDeviceCredentials } from '../../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../../lib/playready/device-credentials';
import { clients, config, resolveClient, sessions } from '../state';
import { normalizeKeySystem } from '../../../../lib/key-system';
import { WidevineSession } from '../../../../lib/widevine/session';

const app = new Hono();
const SESSION_MESSAGE_TIMEOUT_MS = 5_000;
const SESSION_UPDATE_SYNC_TIMEOUT_MS = 250;

const secretKeyMiddleware = createMiddleware(async (c, next) => {
  // If no users are configured, allow public access
  const isPublic = Object.keys(config.users).length === 0;
  const isSecretRequired = !isPublic;

  const secretKey = c.req.header('x-secret-key');
  if (isSecretRequired && !secretKey) {
    return c.json({ error: 'No secret key provided' }, 403);
  }

  await next();
});

app.use(secretKeyMiddleware);
app.use(async (c, next) => {
  const release = sessions.beginRequest();
  if (!release) return c.json({ error: 'Concurrent request limit reached' }, 503);
  try {
    await next();
  } finally {
    release();
  }
});

const reserveSession = createMiddleware(async (c, next) => {
  const release = sessions.reserve();
  if (!release) return c.json({ error: 'Session capacity reached' }, 503);
  try {
    await next();
  } finally {
    release();
  }
});

const busySessions = new WeakSet<Session>();

// Hold ownership through response synchronization, including certificate changes and close.
const exclusiveSessionMutation = createMiddleware(async (c, next) => {
  const sessionKey = `${c.req.header('x-secret-key') ?? ''}:${c.req.param('id')}`;
  const session = sessions.get(sessionKey);
  if (!session) return next();
  if (busySessions.has(session)) {
    return c.json({ error: 'Session is busy. Retry after the current operation completes.' }, 409);
  }
  busySessions.add(session);
  try {
    await next();
  } finally {
    busySessions.delete(session);
  }
});

app.post(
  '/',
  reserveSession,
  zValidator(
    'json',
    z.object({
      sessionType: z.enum(['temporary', 'persistent-license']).optional(),
      keySystem: z.string().optional(),
      client: z.string().optional(),
      customData: z.string().optional(),
    }),
  ),
  async (c) => {
    const { client: clientName, keySystem, sessionType, customData } = c.req.valid('json');
    let requestedSystem: ReturnType<typeof normalizeKeySystem> | undefined;
    try {
      requestedSystem = keySystem === undefined ? undefined : normalizeKeySystem(keySystem);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Invalid key system' }, 400);
    }
    const secretKey = c.req.header('x-secret-key');
    const user = secretKey ? config.users[secretKey] : undefined;
    const isAllowed = (path: string) =>
      !secretKey || user?.clients.some((identifier) => resolveClient(identifier) === path);
    const defaultPath = config.clients[0];
    const explicitPath = clientName === undefined ? undefined : resolveClient(clientName);
    // Preserve the legacy default only when the caller omits its DRM system.
    let candidates: string[];
    if (clientName !== undefined) {
      candidates = explicitPath ? [explicitPath] : [];
    } else if (requestedSystem) {
      candidates = config.clients.map((path) => resolve(path)).filter(isAllowed);
    } else {
      candidates = defaultPath ? [resolve(defaultPath)] : [];
    }
    if (secretKey && (!candidates.length || !candidates.some(isAllowed))) {
      return c.json({ error: 'Client is not found or you are not authorized to use it.' }, 403);
    }

    let selected: { path: string; engine: Widevine | PlayReady } | null = null;
    for (const path of candidates) {
      if (!isAllowed(path)) continue;
      let client = clients.get(path);
      if (!client) {
        const clientData = await readFile(path);
        const magic = fromBuffer(clientData.subarray(0, 3)).toText();
        if (magic === 'WVD') {
          client = await WidevineDeviceCredentials.from({ wvd: clientData });
        } else if (magic === 'PRD') {
          client = await PlayReadyDeviceCredentials.from({ prd: clientData });
        } else {
          return c.json({ error: 'Client is not a valid WVD or PRD file' }, 400);
        }
        clients.set(path, client);
      }
      const engine =
        client instanceof WidevineDeviceCredentials
          ? new Widevine({ deviceCredentials: client })
          : new PlayReady({ deviceCredentials: client, customData });
      if (!requestedSystem || engine.keySystem === requestedSystem) {
        selected = { path, engine };
        break;
      }
    }
    if (!selected) {
      return c.json(
        {
          error: requestedSystem
            ? `No configured, authorized client matches ${requestedSystem}`
            : 'Client not found',
        },
        400,
      );
    }
    const session = new Session(sessionType, selected.engine);

    const sessionKey = `${secretKey ?? ''}:${session.sessionId}`;
    sessions.set(sessionKey, session);
    return c.json({
      id: session.sessionId,
      client: selected.path,
      keySystem: selected.engine.keySystem,
    });
  },
);

app.post(
  '/:id/generate-request',
  exclusiveSessionMutation,
  zValidator('param', z.object({ id: z.string() })),
  zValidator(
    'json',
    z.object({
      initDataType: z.string().optional(),
      initData: z.string(),
      serverCertificate: z.base64().min(1).optional(),
    }),
  ),
  async (c) => {
    const secretKey = c.req.header('x-secret-key');
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json({ error: 'Session not found. Unable to generate request.' }, 400);
    }
    const { serverCertificate } = c.req.valid('json');
    if (serverCertificate !== undefined) {
      try {
        const accepted = await session.engine.setServerCertificate(
          Buffer.from(serverCertificate, 'base64'),
        );
        if (!accepted) return c.json({ error: 'Server certificates are unsupported' }, 400);
      } catch (error) {
        return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
      }
    }
    if (config.forcePrivacyMode) {
      if (!(session.engine instanceof Widevine)) {
        return c.json({ error: 'Forced privacy mode is unsupported for this key system' }, 400);
      }
      const nativeSession = session.engine.sessions.get(session.sessionId);
      const hasCertificate =
        session.engine.serverCertificate ||
        (nativeSession instanceof WidevineSession && nativeSession.serviceCertificate);
      if (!hasCertificate) {
        return c.json({ error: 'Privacy mode requires a valid server certificate' }, 403);
      }
    }
    const initDataType = c.req.valid('json').initDataType || 'cenc';
    const initData = Buffer.from(c.req.valid('json').initData, 'base64');
    let rejectNextMessage: ((error: unknown) => void) | undefined;
    const nextMessage = new Promise<MediaKeyMessageEvent>((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        clearTimeout(timeout);
        session.removeEventListener('message', handler);
      };

      const fail = (error: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };

      const handler = (event: Event) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(event as MediaKeyMessageEvent);
      };

      session.addEventListener('message', handler);
      const timeout = setTimeout(() => {
        fail(
          new Error(
            `Timed out after ${SESSION_MESSAGE_TIMEOUT_MS}ms waiting for a session message`,
          ),
        );
      }, SESSION_MESSAGE_TIMEOUT_MS);
      rejectNextMessage = fail;
    });

    try {
      await session.generateRequest(initDataType, initData);
    } catch (error) {
      rejectNextMessage?.(error);
    }
    const message = await nextMessage;
    return c.json({
      message: Buffer.from(new Uint8Array(message.message)).toString('base64'),
      messageType: message.messageType,
      serverCertificateAccepted: serverCertificate !== undefined,
    });
  },
);

app.post(
  '/:id/update',
  exclusiveSessionMutation,
  zValidator('param', z.object({ id: z.string() })),
  zValidator('json', z.object({ response: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json({ error: 'Session not found. Unable to update.' }, 400);
    }
    const response = Buffer.from(c.req.valid('json').response, 'base64');
    const outcome = {
      hasKeyStatusesChange: false,
      nextMessage: null as { message: ArrayBuffer; messageType: MediaKeyMessageType } | null,
    };
    const handleMessage = (event: Event) => {
      outcome.nextMessage = event as MediaKeyMessageEvent;
      settleSynchronization();
    };
    const handleKeyStatusesChange = () => {
      outcome.hasKeyStatusesChange = true;
      settleSynchronization();
    };
    let settleSynchronization = () => {};
    const synchronization = new Promise<void>((resolve) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve();
      }, SESSION_UPDATE_SYNC_TIMEOUT_MS);

      settleSynchronization = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve();
      };
    });

    session.addEventListener('message', handleMessage);
    session.addEventListener('keystatuseschange', handleKeyStatusesChange);
    try {
      await session.update(response);
      await synchronization;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to update remote CDM session', error);
      return c.json({ error: `Failed to update remote CDM session: ${message}` }, 502);
    } finally {
      session.removeEventListener('message', handleMessage);
      session.removeEventListener('keystatuseschange', handleKeyStatusesChange);
    }

    if (outcome.nextMessage) {
      return c.json({
        message: Buffer.from(new Uint8Array(outcome.nextMessage.message)).toString('base64'),
        messageType: outcome.nextMessage.messageType,
      });
    }

    if (outcome.hasKeyStatusesChange || session.keys.size) {
      return c.json({ keys: Object.fromEntries(session.keys) });
    }

    return c.json({ success: true });
  },
);

app.get('/:id/keys', zValidator('param', z.object({ id: z.string() })), async (c) => {
  const secretKey = c.req.header('x-secret-key') as string;
  const sessionId = c.req.valid('param').id;
  const sessionKey = `${secretKey ?? ''}:${sessionId}`;
  const session = sessions.get(sessionKey);
  if (!session) {
    return c.json({ error: 'Session not found. Unable to get keys.' }, 400);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.sessionLimits.keyWaitTimeoutMs);
  try {
    const keys = await session.waitForKeyStatusesChange({
      signal: AbortSignal.any([c.req.raw.signal, controller.signal]),
    });
    return c.json(Object.fromEntries(keys));
  } catch (error) {
    if (c.req.raw.signal.aborted) return c.json({ error: 'Request aborted' }, 408);
    if (controller.signal.aborted) return c.json({ error: 'Timed out waiting for keys' }, 504);
    return c.json({ error: error instanceof Error ? error.message : 'Session closed' }, 400);
  } finally {
    clearTimeout(timeout);
  }
});

app.post(
  '/:id/close',
  exclusiveSessionMutation,
  zValidator('param', z.object({ id: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json({ error: 'No session has been opened yet. No session to close.' }, 400);
    }
    await session.close();
    sessions.delete(sessionKey);
    return c.json({ success: true });
  },
);

app.delete(
  '/:id',
  exclusiveSessionMutation,
  zValidator('param', z.object({ id: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json({ error: 'No session has been opened yet. No session to remove.' }, 400);
    }
    await session.close();
    sessions.delete(sessionKey);
    return c.json({ success: true });
  },
);

export default app;
