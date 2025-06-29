import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import {
  fromBuffer,
  PlayReadyCdm,
  requestMediaKeySystemAccess,
  WidevineCdm,
} from '../../../../lib';
import { WidevineClient } from '../../../../lib/widevine/client';
import { PlayReadyClient } from '../../../../lib/playready/client';
import { clients, config, sessions } from '../state';

const app = new Hono();

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
        return c.json(
          { error: 'Client is not found or you are not authorized to use it.' },
          403,
        );
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
        const client = await WidevineClient.from({ wvd: clientData });
        clients.set(clientName, client);
      } else if (isPrd) {
        const client = await PlayReadyClient.from({ prd: clientData });
        clients.set(clientName, client);
      } else {
        return c.json({ error: 'Client is not a valid WVD or PRD file' }, 403);
      }
    }

    const client = clients.get(clientName)!;

    const cdm =
      client instanceof WidevineClient
        ? new WidevineCdm({ client })
        : new PlayReadyCdm({ client });

    const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
    const mediaKeys = await keySystemAccess.createMediaKeys({ cdm });

    const sessionType = c.req.valid('json').sessionType as
      | MediaKeySessionType
      | undefined;
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
    }),
  ),
  async (c) => {
    const secretKey = c.req.header('x-secret-key');
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json(
        { error: 'Session not found. Unable to generate request.' },
        400,
      );
    }
    const initDataType = c.req.valid('json').initDataType || 'cenc';
    const initData = Buffer.from(c.req.valid('json').initData, 'base64');

    session.generateRequest(initDataType, initData);
    const data = await session.waitForLicenseRequest();
    const licenseRequest = Buffer.from(data).toString('base64');
    return c.json({ licenseRequest });
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
    await session.update(response);
    return c.json({ success: true });
  },
);

app.get(
  '/:id/keys',
  zValidator('param', z.object({ id: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json({ error: 'Session not found. Unable to get keys.' }, 400);
    }
    const keys = await session.waitForKeyStatusesChange();
    return c.json(keys);
  },
);

app.post(
  '/:id/close',
  zValidator('param', z.object({ id: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json(
        { error: 'No session has been opened yet. No session to close.' },
        400,
      );
    }
    await session.close();
    return c.json({ success: true });
  },
);

app.delete(
  '/:id',
  zValidator('param', z.object({ id: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey ?? ''}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json(
        { error: 'No session has been opened yet. No session to remove.' },
        400,
      );
    }
    await session.close();
    sessions.delete(sessionKey);
    return c.json({ success: true });
  },
);

export default app;
