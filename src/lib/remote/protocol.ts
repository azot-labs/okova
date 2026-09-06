import { z } from 'zod';
import {
  createHttpClient,
  remoteUrlSchema,
  requestTimeoutSchema,
  type RemoteHttpParams,
} from './http';
import { normalizeKeySystem } from '../key-system';

export type OkovaRemoteParams = RemoteHttpParams & {
  keySystem: string;
  protocol?: 'okova';
  client?: string;
  customData?: string;
};

export const remoteConfigFields = {
  baseUrl: remoteUrlSchema,
  secret: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  requestTimeoutMs: requestTimeoutSchema.optional(),
  label: z.string().trim().min(1).optional(),
};
const keySystem = z
  .enum(['com.widevine.alpha', 'com.microsoft.playready', 'com.microsoft.playready.recommendation'])
  .transform(normalizeKeySystem);

export const okovaConfigSchema = z.object({
  ...remoteConfigFields,
  protocol: z.literal('okova'),
  keySystem,
  client: z.string().trim().min(1).optional(),
  customData: z.string().optional(),
});

const messageType = z.enum([
  'license-request',
  'license-renewal',
  'license-release',
  'individualization-request',
]);
const messageSchema = z.object({ message: z.base64().min(1), messageType });
export const keysSchema = z.record(
  z.string().regex(/^[\da-f]{32}$/i),
  z.string().regex(/^[\da-f]{32}$/i),
);
const generateSchema = messageSchema.extend({ serverCertificateAccepted: z.boolean().optional() });
const updateSchema = z.union([
  messageSchema,
  z.object({ keys: keysSchema }),
  z.object({ success: z.literal(true) }),
]);
const openSchema = z.object({ id: z.string().min(1), keySystem: z.string().optional() });
export type GenerateParams = { initData: string; initDataType: string; serverCertificate?: string };

export const createOkovaApi = (params: OkovaRemoteParams) => {
  const http = createHttpClient(params);
  const sessionRoute = (id: string) => `/sessions/${encodeURIComponent(id)}`;
  return {
    open: async (sessionType: MediaKeySessionType) => {
      const data = openSchema.parse(
        await http.post('/sessions', {
          keySystem: params.keySystem,
          sessionType,
          client: params.client,
          customData: params.customData,
        }),
      );
      if (data.keySystem !== undefined) {
        try {
          if (normalizeKeySystem(data.keySystem) !== normalizeKeySystem(params.keySystem))
            throw new Error('Remote server opened a session for a different DRM system');
        } catch (error) {
          try {
            await http.post(`${sessionRoute(data.id)}/close`);
          } catch (cleanupError) {
            throw new AggregateError([error, cleanupError], `${error}; session cleanup failed`);
          }
          throw error;
        }
      }
      return data.id;
    },
    generate: async (id: string, body: GenerateParams) =>
      generateSchema.parse(await http.post(`${sessionRoute(id)}/generate-request`, body)),
    update: async (id: string, response: string) => {
      const data = updateSchema.parse(await http.post(`${sessionRoute(id)}/update`, { response }));
      if ('success' in data)
        return { keys: keysSchema.parse(await http.get(`${sessionRoute(id)}/keys`)) };
      return data;
    },
    close: async (id: string, remove: boolean) => {
      if (remove) await http.delete(sessionRoute(id));
      else await http.post(`${sessionRoute(id)}/close`);
    },
  };
};

export type RemoteApi = ReturnType<typeof createOkovaApi> & {
  isServiceCertificate?: (response: Uint8Array) => boolean;
};
