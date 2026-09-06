import { z } from 'zod';
import { createHttpClient, remoteUrlSchema } from './http';
import { remoteConfigFields, type GenerateParams, type RemoteApi } from './protocol';
import { CLIENT_KEY_SYSTEMS } from '../key-system';
import { fromBase64, fromBuffer } from '../utils';
import { Pssh } from '../playready/pssh';
import { isPsshBoxSequence, parsePsshBoxes, PSSH_SYSTEM_IDS } from '../pssh';
import { isServiceCertificate } from '../widevine/message';
import { License } from '../widevine/proto';

const deviceName = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => !['.', '..'].includes(value) && !/[\\/%]/.test(value),
    'Invalid remote device name',
  );
const systemId = z.number().int().nonnegative();
const securityLevel = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(150),
  z.literal(2000),
  z.literal(3000),
]);
const deviceFields = {
  ...remoteConfigFields,
  device: deviceName,
  systemId: systemId.optional(),
  securityLevel: securityLevel.optional(),
};
export const pywidevineConfigSchema = z.object({
  ...deviceFields,
  protocol: z.literal('pywidevine'),
  keySystem: z.literal(CLIENT_KEY_SYSTEMS.widevine),
});
export const pyplayreadyConfigSchema = z.object({
  ...deviceFields,
  protocol: z.literal('pyplayready'),
  keySystem: z.literal(CLIENT_KEY_SYSTEMS.playready),
});
export type PywidevineRemoteParams = Omit<
  z.infer<typeof pywidevineConfigSchema> | z.infer<typeof pyplayreadyConfigSchema>,
  'keySystem'
> & { keySystem: string };

// Proxy2 exports use Python names; camelCase aliases also occur in JS clients.
export const pywidevineFileSchema = z
  .object({
    host: remoteUrlSchema,
    secret: z.string().min(1),
    device_name: deviceName.optional(),
    deviceName: deviceName.optional(),
    name: deviceName.optional(),
    security_level: securityLevel.optional(),
    securityLevel: securityLevel.optional(),
    system_id: systemId.optional(),
    systemId: systemId.optional(),
    protocol: z.enum(['pywidevine', 'pyplayready']).optional(),
  })
  .transform((value, context) => {
    const device = value.device_name ?? value.deviceName ?? value.name;
    if (!device) {
      context.addIssue({ code: 'custom', message: 'device_name is required' });
      return z.NEVER;
    }
    const level = value.security_level ?? value.securityLevel;
    const protocol = value.protocol ?? (level && level >= 150 ? 'pyplayready' : 'pywidevine');
    return {
      protocol,
      baseUrl: value.host,
      secret: value.secret,
      device,
      keySystem:
        protocol === 'pyplayready' ? CLIENT_KEY_SYSTEMS.playready : CLIENT_KEY_SYSTEMS.widevine,
      systemId: value.system_id ?? value.systemId,
      securityLevel: level,
    };
  });

/** Only ambiguous legacy files use the Widevine fallback. */
export const usesPywidevineFallback = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  'host' in value &&
  !('protocol' in value) &&
  !('security_level' in value) &&
  !('securityLevel' in value);

const statusSchema = z.object({
  status: z
    .union([
      z.number(),
      z
        .string()
        .regex(/^\d{3}$/)
        .transform(Number),
    ])
    .optional(),
  message: z.string().optional(),
});

const pyCertificateSchema = z.object({ data: z.object({ provider_id: z.string().min(1) }) });
const pyOpenSchema = z.object({
  data: z.object({
    session_id: z.string().min(1),
    device: z.unknown().optional(),
  }),
});
const reportedNumber = z.union([systemId, z.string().regex(/^\d+$/).transform(Number)]);
const pyDeviceSchema = z.object({
  system_id: reportedNumber.optional(),
  security_level: reportedNumber.optional(),
});
const pyChallengeSchema = z.object({
  data: z.union([
    z.object({ challenge_b64: z.base64().min(1) }),
    z.object({ challenge: z.string().min(1) }),
  ]),
});
const keyIdSchema = z
  .string()
  .regex(/^(?:[\da-f]{32}|[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/i)
  .transform((value) => value.replaceAll('-', '').toLowerCase());
const pyKeysSchema = z.object({
  data: z.object({
    keys: z.array(
      z.object({
        key_id: keyIdSchema,
        key: z.string().regex(/^[\da-f]{32}$/i),
        type: z.union([z.string(), z.number()]).optional(),
      }),
    ),
  }),
});
export const createPywidevineApi = (params: PywidevineRemoteParams): RemoteApi => {
  const transport = createHttpClient(params);
  const unwrapStatus = async (request: Promise<unknown>) => {
    const data = await request;
    const envelope = statusSchema.parse(data);
    if (envelope.status !== undefined && envelope.status !== 200) {
      throw new Error(`${envelope.status}: ${envelope.message ?? 'Remote CDM request failed'}`);
    }
    return data;
  };
  const http = {
    get: (path: string) => unwrapStatus(transport.get(path)),
    post: (path: string, body: object) => unwrapStatus(transport.post(path, body)),
  };
  const isWidevine = params.protocol === 'pywidevine';
  if (
    params.keySystem !== (isWidevine ? CLIENT_KEY_SYSTEMS.widevine : CLIENT_KEY_SYSTEMS.playready)
  ) {
    throw new Error('Remote protocol does not match the DRM key system');
  }
  const device = `/${encodeURIComponent(deviceName.parse(params.device))}`;
  const getKeys = async (id: string) => {
    const result = pyKeysSchema.parse(
      await http.post(`${device}/get_keys${isWidevine ? '/CONTENT' : ''}`, { session_id: id }),
    );
    return Object.fromEntries(
      result.data.keys
        .filter(
          (key) =>
            !isWidevine ||
            key.type === undefined ||
            key.type === 'CONTENT' ||
            key.type === License.KeyContainer.KeyType.CONTENT,
        )
        .map((key) => [key.key_id, key.key.toLowerCase()]),
    );
  };
  return {
    isServiceCertificate: (response) => isWidevine && isServiceCertificate(response),
    open: async (sessionType: MediaKeySessionType) => {
      if (sessionType !== 'temporary')
        throw new Error('Python remote APIs support temporary sessions only');
      const data = pyOpenSchema.parse(await http.get(`${device}/open`)).data;
      const sessionId = data.session_id;
      const metadata = pyDeviceSchema.safeParse(data.device);
      const hasMismatch =
        (params.systemId !== undefined &&
          (!metadata.success || metadata.data.system_id !== params.systemId)) ||
        (params.securityLevel !== undefined &&
          (!metadata.success || metadata.data.security_level !== params.securityLevel));
      if (hasMismatch) {
        // Opening succeeded; release the server slot before rejecting the wrong device.
        const message = 'Remote device does not match the configured system ID or security level';
        try {
          await http.get(`${device}/close/${encodeURIComponent(sessionId)}`);
        } catch (error) {
          throw new Error(`${message}; session cleanup failed`, { cause: error });
        }
        throw new Error(message);
      }
      return sessionId;
    },
    generate: async (id: string, body: GenerateParams) => {
      if (body.initDataType !== 'cenc')
        throw new Error('Python remote APIs require cenc initialization data');
      let initData = body.initData;
      const bytes = fromBase64(initData).toBuffer();
      // pywidevine accepts the inner WidevinePsshData; pyplayready takes one WRMHEADER,
      // selecting the first header just as its serve.py does for a full PSSH.
      if (isWidevine && isPsshBoxSequence(bytes)) {
        const box = parsePsshBoxes(bytes).find((box) => box.systemId === PSSH_SYSTEM_IDS.widevine);
        if (!box) throw new Error('No Widevine PSSH box found');
        initData = fromBuffer(box.data).toBase64();
      } else if (!isWidevine) {
        const header = new Pssh(bytes).wrmHeaders[0];
        if (!header) throw new Error('No PlayReady WRMHEADER found');
        initData = header;
      }
      if (body.serverCertificate !== undefined) {
        pyCertificateSchema.parse(
          await http.post(`${device}/set_service_certificate`, {
            session_id: id,
            certificate: body.serverCertificate,
          }),
        );
      }
      const result = pyChallengeSchema.parse(
        await http.post(`${device}/get_license_challenge${isWidevine ? '/STREAMING' : ''}`, {
          session_id: id,
          init_data: initData,
          ...(isWidevine ? { privacy_mode: body.serverCertificate !== undefined } : {}),
        }),
      ).data;
      const message =
        'challenge_b64' in result
          ? result.challenge_b64
          : fromBuffer(new TextEncoder().encode(result.challenge)).toBase64();
      return {
        message,
        messageType: 'license-request' as const,
        serverCertificateAccepted: body.serverCertificate !== undefined,
      };
    },
    update: async (id: string, response: string) => {
      await http.post(`${device}/parse_license`, {
        session_id: id,
        license_message: isWidevine
          ? response
          : new TextDecoder().decode(fromBase64(response).toBuffer()),
      });
      return { keys: await getKeys(id) };
    },
    // Python servers expose only close; it also releases all session state.
    close: async (id: string) => {
      await http.get(`${device}/close/${encodeURIComponent(id)}`);
    },
  };
};
