import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import {
  fromBuffer,
  MediaKeyMessageEvent,
  PlayReady,
  requestMediaKeySystemAccess,
  setSupportedEngines,
  Widevine,
} from '../../../../lib';
import { WidevineDeviceCredentials } from '../../../../lib/widevine/device-credentials';
import { PlayReadyDeviceCredentials } from '../../../../lib/playready/device-credentials';
import { clients, config, sessions } from '../state';
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

app.post(
  '/',
  zValidator(
    'json',
    z.object({
      sessionType: z.string().optional(),
      client: z.string().optional(),
    }),
  ),
  async (c) => {
    const clientName = c.req.valid('json').client || config.clients[0];
    const clientPath = config.clients.find((client: string) =>
      basename(client).includes(clientName),
    );

    const secretKey = c.req.header('x-secret-key');
    if (secretKey) {
      const user = config.users[secretKey];
      const clientAllowed = user?.clients.includes(clientName);
      if (!clientAllowed) {
        return c.json({ error: 'Client is not found or you are not authorized to use it.' }, 403);
      }
    }

    if (!clientPath) {
      return c.json({ error: 'Client not found' }, 400);
    }

    if (!clients.has(clientName)) {
      const clientData = await readFile(clientPath);
      const isWvd = fromBuffer(clientData.subarray(0, 3)).toText() == 'WVD';
      const isPrd = fromBuffer(clientData.subarray(0, 3)).toText() == 'PRD';
      if (isWvd) {
        const client = await WidevineDeviceCredentials.from({ wvd: clientData });
        clients.set(clientName, client);
      } else if (isPrd) {
        const client = await PlayReadyDeviceCredentials.from({ prd: clientData });
        clients.set(clientName, client);
      } else {
        return c.json({ error: 'Client is not a valid WVD or PRD file' }, 403);
      }
    }

    const client = clients.get(clientName)!;

    const cdm =
      client instanceof WidevineDeviceCredentials
        ? new Widevine({ deviceCredentials: client })
        : new PlayReady({ deviceCredentials: client });

    setSupportedEngines([cdm]);
    const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
    const mediaKeys = await keySystemAccess.createMediaKeys();

    const sessionType = c.req.valid('json').sessionType as MediaKeySessionType | undefined;
    const session = mediaKeys.createSession(sessionType);

    const sessionKey = `${secretKey ?? ''}:${session.sessionId}`;
    sessions.set(sessionKey, session);
    return c.json({ id: session.sessionId });
  },
);

app.post(
  '/:id/generate-request',
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
  const keys = await session.waitForKeyStatusesChange();
  return c.json(Object.fromEntries(keys));
});

app.post('/:id/close', zValidator('param', z.object({ id: z.string() })), async (c) => {
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
});

app.delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
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
});

export default app;
