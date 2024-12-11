import { readFile } from 'node:fs/promises';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { Session } from '../../../../lib/session';
import { Client } from '../../../../lib/client';
import { clients, config, sessions } from '../state';

const plugin: FastifyPluginAsyncTypebox = async (server) => {
  server.post(
    '/session',
    {
      schema: {
        body: Type.Object({
          client: Type.String(),
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          403: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const secretKey = request.headers['x-secret-key'] as string;
      const clientName = request.body.client;
      const user = config.users[secretKey];
      const hasClient = config.clients.some((client: string) =>
        client.includes(clientName),
      );
      const hasUserClient = user?.clients.includes(clientName);
      if (!hasClient || !hasUserClient) {
        return reply.forbidden(
          'Client is not found or you are not authorized to use it.',
        );
      }
      const wvd = await readFile('client.wvd');
      const client = clients.get(clientName) || (await Client.fromPacked(wvd));
      if (!clients.has(clientName!)) clients.set(clientName!, client);
      const session = new Session('temporary', client);
      const sessionKey = `${secretKey}:${session.sessionId}`;
      sessions.set(sessionKey, session);
      return { id: session.sessionId };
    },
  );

  server.post(
    '/session/:id/generate-request',
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        body: Type.Object({
          initDataType: Type.Optional(Type.String()),
          initData: Type.String(),
        }),
        response: {
          200: Type.Object({
            licenseRequest: Type.String(),
          }),
          400: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const secretKey = request.headers['x-secret-key'] as string;
      const sessionId = request.params.id;
      const sessionKey = `${secretKey}:${sessionId}`;
      const session = sessions.get(sessionKey);
      if (!session) {
        return reply.badGateway(
          'Session not found. Unable to generate request.',
        );
      }
      const initDataType = request.body.initDataType || 'cenc';
      const initData = Buffer.from(request.body.initData, 'base64');
      session.generateRequest(initDataType, initData);
      const data = await session.waitForLicenseRequest();
      const licenseRequest = Buffer.from(data).toString('base64');
      return reply.send({ licenseRequest });
    },
  );

  server.post(
    '/session/:id/update',
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        body: Type.Object({
          response: Type.String(),
        }),
        response: {
          400: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const secretKey = request.headers['x-secret-key'] as string;
      const sessionId = request.params.id;
      const sessionKey = `${secretKey}:${sessionId}`;
      const session = sessions.get(sessionKey);
      if (!session) {
        return reply.badGateway('Session not found. Unable to update.');
      }
      const response = Buffer.from(request.body.response, 'base64');
      await session.update(response);
      return reply.send();
    },
  );

  server.get(
    '/session/:id/keys',
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: Type.Array(
            Type.Object({
              kid: Type.String(),
              key: Type.String(),
              type: Type.String(),
            }),
          ),
          400: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const secretKey = request.headers['x-secret-key'] as string;
      const sessionId = request.params.id;
      const sessionKey = `${secretKey}:${sessionId}`;
      const session = sessions.get(sessionKey);
      if (!session) {
        return reply.badGateway('Session not found. Unable to get keys.');
      }
      const keys = [];
      for (const key of session.keys.values()) {
        keys.push({
          kid: key.id,
          key: key.value,
          type: key.type,
        });
      }
      return reply.send(keys);
    },
  );

  server.delete(
    '/session/:id',
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          400: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const secretKey = request.headers['x-secret-key'] as string;
      const sessionId = request.params.id;
      const sessionKey = `${secretKey}:${sessionId}`;
      const session = sessions.get(sessionKey);
      if (!session) {
        return reply.badGateway(
          'No session has been opened yet. No session to close.',
        );
      }
      await session.close();
      sessions.delete(sessionKey);
      return reply.send();
    },
  );
};

export default plugin;
