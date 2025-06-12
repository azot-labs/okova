import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Session } from '../../../../lib/session';
import { Client } from '../../../../lib/client';
import { clients, config, sessions } from '../state';

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

app.post(
  '/',
  zValidator('json', z.object({ client: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key');
    if (!secretKey) return c.json({ error: 'No secret key provided' }, 403);
    const clientName = c.req.valid('json').client;
    const user = config.users[secretKey];
    const clientPath = config.clients.find((client: string) =>
      basename(client).includes(clientName),
    );
    const clientAllowed = user?.clients.includes(clientName);
    if (!clientPath || !clientAllowed) {
      return c.json(
        { error: 'Client is not found or you are not authorized to use it.' },
        403,
      );
    }
    if (!clients.has(clientName)) {
      const wvd = await readFile(clientPath);
      const client = await Client.fromPacked(wvd);
      clients.set(clientName, client);
    }
    const session = new Session('temporary', clients.get(clientName)!);
    const sessionKey = `${secretKey}:${session.sessionId}`;
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
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey}:${sessionId}`;
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
    const sessionKey = `${secretKey}:${sessionId}`;
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
    const sessionKey = `${secretKey}:${sessionId}`;
    const session = sessions.get(sessionKey);
    if (!session) {
      return c.json({ error: 'Session not found. Unable to get keys.' }, 400);
    }
    const keys = [];
    for (const key of session.keys.values()) {
      keys.push({
        kid: key.id,
        key: key.value,
        type: key.type,
      });
    }
    return c.json(keys);
  },
);

app.post(
  '/:id/close',
  zValidator('param', z.object({ id: z.string() })),
  async (c) => {
    const secretKey = c.req.header('x-secret-key') as string;
    const sessionId = c.req.valid('param').id;
    const sessionKey = `${secretKey}:${sessionId}`;
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
    const sessionKey = `${secretKey}:${sessionId}`;
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
