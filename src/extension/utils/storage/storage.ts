import { createCaptureHistory } from './capture-history';
import { CLIENT_KEY_SYSTEMS, normalizeKeySystem } from '../../../lib/key-system';
import type { DrmStage } from '../drm-error';
import type { Credentials } from '../../../lib/credentials';
import { browser, storage } from '#imports';
import { z } from 'zod';
import { remoteCredentialsSchema } from '@okova/lib/remote/credentials';
import { RemoteCredentials } from '../../../lib/remote/credentials';
import { WidevineClientCredentials } from '../../../lib/widevine/client-credentials';
import { PlayReadyClientCredentials } from '../../../lib/playready/client-credentials';
import { fromBase64, fromBuffer } from '../../../lib';
import { asJson } from './json';
import { settingsStorage } from './settings';

export { defaultSettings, type Settings, type ThemeMode } from './settings';

export * from './history-record';

export { drmStages, type DrmStage } from '../drm-error';
export type DrmFailure = { stage: DrmStage; error: string; url: string; createdAt: number };

// Session storage keeps diagnostics across popup/worker restarts, but not browser restarts.
export const getDrmFailureStorage = (tabId: number) =>
  storage.defineItem<DrmFailure>(`session:drm-failure:${tabId}`);

export const MAX_HISTORY_RECORDS = 1_000;

// Compatibility limit for bounded bridge requests. Stored captures share a 6 MiB budget.
export const MAX_HISTORY_BYTES = 2 * 1024 * 1024;

export type { Credentials } from '../../../lib/credentials';
export const credentialsInfoSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wvd'), data: z.string() }),
  z.object({ type: z.literal('prd'), data: z.string() }),
  z.object({ type: z.literal('remote'), config: remoteCredentialsSchema }),
]);
export type CredentialsInfo = z.infer<typeof credentialsInfoSchema>;

export const deserializeCredentials = async (info: CredentialsInfo) => {
  if (info.type === 'remote') return RemoteCredentials.from(info.config);
  const data = fromBase64(info.data).toBuffer();
  if (info.type === 'prd') {
    return await PlayReadyClientCredentials.from({ prd: data });
  } else if (info.type === 'wvd') {
    return await WidevineClientCredentials.from({ wvd: data });
  }
  throw new Error('Unsupported credentials type');
};

export const serializeCredentials = async (credentials: Credentials): Promise<CredentialsInfo> => {
  if (credentials instanceof RemoteCredentials)
    return { type: 'remote', config: credentials.config };
  const type = credentials instanceof PlayReadyClientCredentials ? 'prd' : 'wvd';
  const data = fromBuffer(await credentials.pack()).toBase64();
  return { type, data };
};

const activeCredentialsIdsSchema = z.object({
  widevine: z.string().nullable(),
  playready: z.string().nullable(),
});
export type ActiveCredentialsIds = z.infer<typeof activeCredentialsIdsSchema>;
export const getKeySystemSlot = (keySystem: string) =>
  normalizeKeySystem(keySystem) === CLIENT_KEY_SYSTEMS.widevine ? 'widevine' : 'playready';

export const getCredentialsSystem = (credentials: Credentials) => {
  if (credentials instanceof RemoteCredentials) return getKeySystemSlot(credentials.keySystem);
  return credentials instanceof WidevineClientCredentials ? 'widevine' : 'playready';
};

const previousCredentialsRegistrySchema = z.object({
  credentials: z.array(z.object({ id: z.string(), info: z.unknown() })),
  activeCredentialsId: z.string().nullable(),
});
const credentialsRegistrySchema = previousCredentialsRegistrySchema
  .omit({ activeCredentialsId: true })
  .extend({
    activeCredentialsIds: activeCredentialsIdsSchema,
  });
type CredentialsRegistry = z.infer<typeof credentialsRegistrySchema>;

const migrateCredentialsRegistry = (
  previous: z.infer<typeof previousCredentialsRegistrySchema>,
): CredentialsRegistry => {
  const activeCredentialsIds: ActiveCredentialsIds = { widevine: null, playready: null };
  const entry = previous.credentials.find((entry) => entry.id === previous.activeCredentialsId);
  // Preserve the selected slot even if its payload needs re-importing.
  const info = z
    .object({ type: z.string(), config: z.object({ keySystem: z.string() }).optional() })
    .safeParse(entry?.info);
  if (entry && info.success) {
    if (info.data.type === 'wvd') activeCredentialsIds.widevine = entry.id;
    else if (info.data.type === 'prd') activeCredentialsIds.playready = entry.id;
    else if (info.data.type === 'remote' && info.data.config) {
      try {
        activeCredentialsIds[getKeySystemSlot(info.data.config.keySystem)] = entry.id;
      } catch {
        /* An unknown system cannot seed either slot. */
      }
    }
  }
  return { credentials: previous.credentials, activeCredentialsIds };
};
export type StoredCredentials = { id: string; credentials: Credentials };
export type FailedCredentials = { id: string; error: string };
export type CredentialsSnapshot = {
  credentials: StoredCredentials[];
  failedCredentials: FailedCredentials[];
  activeCredentialsIds: ActiveCredentialsIds;
};
const credentialsRegistry = storage.defineItem<unknown>('local:credentials-registry');
const legacyRegistry = storage.defineItem<unknown>('local:client-registry');
const legacyRegistrySchema = z.object({
  clients: z.array(z.object({ id: z.string(), info: z.unknown() })),
  activeClientId: z.string().nullable(),
});
const legacyCredentials = asJson(storage.defineItem<(string | CredentialsInfo)[]>('local:clients'));
const legacyActiveCredentials = storage.defineItem<string | CredentialsInfo>('local:active-client');
const withCredentialsLock = <T>(operation: () => Promise<T>) =>
  navigator.locks.request('okova:credentials', operation);
const sameCredentialsInfo = (left: unknown, right: unknown) => {
  const parsedLeft = credentialsInfoSchema.safeParse(left);
  const parsedRight = credentialsInfoSchema.safeParse(right);
  return (
    JSON.stringify(parsedLeft.success ? parsedLeft.data : left) ===
    JSON.stringify(parsedRight.success ? parsedRight.data : right)
  );
};

// Keep legacy data as a backup. Once written, the registry is the only source of truth.
const readCredentialsRegistry = async (): Promise<CredentialsRegistry> => {
  const stored = await credentialsRegistry.getValue();
  if (stored) {
    if (typeof stored === 'object' && 'activeCredentialsIds' in stored)
      return credentialsRegistrySchema.parse(stored);
    return migrateCredentialsRegistry(previousCredentialsRegistrySchema.parse(stored));
  }
  const previous = await legacyRegistry.getValue();
  if (previous) {
    const legacy = legacyRegistrySchema.parse(previous);
    return migrateCredentialsRegistry({
      credentials: legacy.clients,
      activeCredentialsId: legacy.activeClientId,
    });
  }
  const registry: z.infer<typeof previousCredentialsRegistrySchema> = {
    credentials: [],
    activeCredentialsId: null,
  };
  const normalizeLegacy = async (value: string | CredentialsInfo) => {
    const info = typeof value === 'string' ? { type: 'wvd' as const, data: value } : value;
    try {
      return await serializeCredentials(
        await deserializeCredentials(credentialsInfoSchema.parse(info)),
      );
    } catch {
      return info;
    }
  };
  for (const value of (await legacyCredentials.getValue()) ?? []) {
    const info = await normalizeLegacy(value);
    if (!registry.credentials.some((entry) => sameCredentialsInfo(entry.info, info))) {
      registry.credentials.push({ id: crypto.randomUUID(), info });
    }
  }
  const active = await legacyActiveCredentials.getValue();
  if (active) {
    const info = await normalizeLegacy(active);
    let entry = registry.credentials.find((entry) => sameCredentialsInfo(entry.info, info));
    if (!entry) {
      entry = { id: crypto.randomUUID(), info };
      registry.credentials.push(entry);
    }
    registry.activeCredentialsId = entry.id;
  } else {
    registry.activeCredentialsId = registry.credentials[0]?.id ?? null;
  }
  return migrateCredentialsRegistry(registry);
};

const decodeCredentialsRegistry = async (
  registry: CredentialsRegistry,
): Promise<CredentialsSnapshot> => {
  const snapshot: CredentialsSnapshot = {
    credentials: [],
    failedCredentials: [],
    activeCredentialsIds: registry.activeCredentialsIds,
  };
  for (const entry of registry.credentials) {
    try {
      const credentials = await deserializeCredentials(credentialsInfoSchema.parse(entry.info));
      snapshot.credentials.push({ id: entry.id, credentials });
    } catch {
      // Parser errors may contain remote secrets or credential bytes. Keep UI errors generic.
      snapshot.failedCredentials.push({ id: entry.id, error: 'Unable to read credentials' });
    }
  }
  return snapshot;
};

const saveCredentialsRegistry = async (registry: CredentialsRegistry) => {
  // Build the snapshot before committing; unreadable entries remain stored for explicit repair.
  const snapshot = await decodeCredentialsRegistry(registry);
  await credentialsRegistry.setValue(registry);
  return snapshot;
};

const addCredentials = (credentials: Credentials, enablePlayback = false) =>
  withCredentialsLock(async () => {
    const registry = await readCredentialsRegistry();
    const info = await serializeCredentials(credentials);
    await deserializeCredentials(credentialsInfoSchema.parse(info));
    if (registry.credentials.some((entry) => sameCredentialsInfo(entry.info, info))) {
      throw new Error('These credentials are already imported');
    }
    if (registry.credentials.length >= 10)
      throw new Error('You can add a maximum of 10 credentials');
    const isFirstCredentials = registry.credentials.length === 0;
    const entry = { id: crypto.randomUUID(), info };
    registry.credentials.push(entry);
    registry.activeCredentialsIds[getCredentialsSystem(credentials)] ??= entry.id;
    if (enablePlayback && isFirstCredentials) {
      const snapshot = await decodeCredentialsRegistry(registry);
      const settings = await settingsStorage.patch(
        { emeInterception: true, spoofing: true, clientPlayback: true },
        [{ key: credentialsRegistry.key, value: registry }],
      );
      return { ...snapshot, settings };
    }
    return saveCredentialsRegistry(registry);
  });

const credentialsStorage = {
  getSnapshot: () =>
    withCredentialsLock(async () => {
      const registry = await readCredentialsRegistry();
      const stored = await credentialsRegistry.getValue();
      if (!stored || typeof stored !== 'object' || !('activeCredentialsIds' in stored))
        return saveCredentialsRegistry(registry);
      return decodeCredentialsRegistry(registry);
    }),
  getValue: async () =>
    (await credentialsStorage.getSnapshot()).credentials.map((entry) => entry.credentials),
  add: (credentials: Credentials) => addCredentials(credentials),
  import: (credentials: Credentials) => addCredentials(credentials, true),
  replace: (id: string, credentials: Credentials) =>
    withCredentialsLock(async () => {
      const registry = await readCredentialsRegistry();
      const entry = registry.credentials.find((entry) => entry.id === id);
      if (!entry) throw new Error('Credentials are no longer available');
      const snapshot = await decodeCredentialsRegistry(registry);
      if (!snapshot.failedCredentials.some((entry) => entry.id === id))
        throw new Error('These credentials no longer need re-importing');
      const info = await serializeCredentials(credentials);
      await deserializeCredentials(credentialsInfoSchema.parse(info));
      if (
        registry.credentials.some(
          (entry) => entry.id !== id && sameCredentialsInfo(entry.info, info),
        )
      )
        throw new Error('These credentials are already imported');
      const system = getCredentialsSystem(credentials);
      const otherSystem = system === 'widevine' ? 'playready' : 'widevine';
      if (registry.activeCredentialsIds[otherSystem] === id) {
        registry.activeCredentialsIds[otherSystem] = null;
        registry.activeCredentialsIds[system] ??= id;
      }
      entry.info = info;
      return saveCredentialsRegistry(registry);
    }),
  select: (id: string) =>
    withCredentialsLock(async () => {
      const registry = await readCredentialsRegistry();
      const entry = (await decodeCredentialsRegistry(registry)).credentials.find(
        (entry) => entry.id === id,
      );
      if (!entry) throw new Error('Credentials are no longer available');
      registry.activeCredentialsIds[getCredentialsSystem(entry.credentials)] = id;
      return saveCredentialsRegistry(registry);
    }),
  remove: (credentials: string | Credentials) =>
    withCredentialsLock(async () => {
      const registry = await readCredentialsRegistry();
      const info = typeof credentials === 'string' ? null : await serializeCredentials(credentials);
      const id =
        typeof credentials === 'string'
          ? credentials
          : registry.credentials.find((entry) => info && sameCredentialsInfo(entry.info, info))?.id;
      const remainingCredentials = registry.credentials.filter((entry) => entry.id !== id);
      const snapshot = await decodeCredentialsRegistry({
        ...registry,
        credentials: remainingCredentials,
      });
      for (const system of ['widevine', 'playready'] as const) {
        if (registry.activeCredentialsIds[system] === id)
          registry.activeCredentialsIds[system] =
            snapshot.credentials.find((entry) => getCredentialsSystem(entry.credentials) === system)
              ?.id ?? null;
      }
      return saveCredentialsRegistry({ ...registry, credentials: remainingCredentials });
    }),
  active: {
    getInfo: (keySystem: string) =>
      withCredentialsLock(async () => {
        try {
          const registry = await readCredentialsRegistry();
          const entry = registry.credentials.find(
            (entry) => entry.id === registry.activeCredentialsIds[getKeySystemSlot(keySystem)],
          );
          if (!entry) return null;
          const info = credentialsInfoSchema.parse(entry.info);
          const selectedSystem =
            info.type === 'remote'
              ? info.config.keySystem
              : CLIENT_KEY_SYSTEMS[info.type === 'wvd' ? 'widevine' : 'playready'];
          if (normalizeKeySystem(selectedSystem) !== normalizeKeySystem(keySystem))
            throw new Error('Credential system does not match its slot');
          return info;
        } catch {
          // Background diagnostics persist these errors, so omit parser details and causes.
          throw new Error('Unable to read active credentials');
        }
      }),
    getValue: async (keySystem: string): Promise<Credentials | null> => {
      try {
        const info = await credentialsStorage.active.getInfo(keySystem);
        return info ? await deserializeCredentials(info) : null;
      } catch {
        throw new Error('Unable to read active credentials');
      }
    },
    // Library-side callers may supply credentials before adding it to the popup list.
    setValue: (credentials: Credentials | null) =>
      withCredentialsLock(async () => {
        const registry = await readCredentialsRegistry();
        if (!credentials)
          return saveCredentialsRegistry({
            ...registry,
            activeCredentialsIds: { widevine: null, playready: null },
          });
        const info = await serializeCredentials(credentials);
        await deserializeCredentials(credentialsInfoSchema.parse(info));
        let entry = registry.credentials.find((entry) => sameCredentialsInfo(entry.info, info));
        if (!entry) {
          entry = { id: crypto.randomUUID(), info };
          registry.credentials.push(entry);
        }
        registry.activeCredentialsIds[getCredentialsSystem(credentials)] = entry.id;
        return saveCredentialsRegistry(registry);
      }),
  },
};

type PrivateSession = { generation: string; windowIds: number[] };
const privateSession = storage.defineItem<PrivateSession>('session:incognito:history-session');
const PRIVATE_HISTORY_LOCK = 'okova:incognito-key-history';
const PRIVATE_HISTORY_KEYS = [
  'session:incognito:capture-history',
  'session:incognito:capture-history-runtime-id',
  'session:incognito:all-keys',
  'session:incognito:recent-keys',
  'session:incognito:recent-keys-by-domain',
] as const;

// Queue the observation immediately, before awaiting the window snapshot. Window events,
// capture binding, and writes must observe session transitions in the same lock order.
const withPrivateSession = <T>(operation: (session: PrivateSession | null) => Promise<T>) => {
  const observedSession = privateSession.getValue();
  const windows = browser.windows.getAll();
  return navigator.locks.request(PRIVATE_HISTORY_LOCK, async () => {
    const observedGeneration = (await observedSession)?.generation;
    const previous = await privateSession.getValue();
    // Another extension context may have advanced the generation before this lock.
    // Its records cannot be cleared using a window snapshot from the old generation.
    const snapshot = await windows;
    const currentWindows =
      previous?.generation === observedGeneration ? snapshot : await browser.windows.getAll();
    const windowIds = currentWindows
      .filter((window) => window.incognito)
      .flatMap((window) => (window.id === undefined ? [] : [window.id]));
    const isSameSession = previous?.windowIds.some((id) => windowIds.includes(id));
    let session = previous;
    if (!isSameSession) {
      // Only this generation can own the shared history keys while the lock is held.
      await storage.removeItems([...PRIVATE_HISTORY_KEYS]);
      session = windowIds.length ? { generation: crypto.randomUUID(), windowIds } : null;
    } else if (session) {
      session = { ...session, windowIds };
    }
    if (session) await privateSession.setValue(session);
    else await privateSession.removeValue();
    return operation(session);
  });
};

// Both contexts share extension storage, so private records need their own session keys.
const createKeyHistory = (isIncognito: boolean, generation?: string) => {
  const prefix = isIncognito ? 'session:incognito:' : 'local:';
  const lockName = isIncognito ? PRIVATE_HISTORY_LOCK : 'okova:key-history';
  const mutateKeyHistory = (mutation: () => Promise<void>) => {
    if (!isIncognito) return navigator.locks.request(lockName, mutation);
    const expectedGeneration =
      generation === undefined
        ? withPrivateSession(async (session) => session?.generation)
        : Promise.resolve(generation);
    return withPrivateSession(async (session) => {
      if (!session || session.generation !== (await expectedGeneration)) return;
      await mutation();
    });
  };
  return createCaptureHistory(prefix, mutateKeyHistory);
};

export const regularHistory = createKeyHistory(false);
export const privateHistory = createKeyHistory(true);
// Bind before asynchronous capture work, so an old request cannot join a replacement session.
export const getKeyHistory = async (isIncognito: boolean, windowId?: number) => {
  if (!isIncognito) return regularHistory;
  return withPrivateSession(async (session) =>
    createKeyHistory(
      true,
      session && (windowId === undefined || session.windowIds.includes(windowId))
        ? session.generation
        : crypto.randomUUID(),
    ),
  );
};

export const clearClosedPrivateHistory = () => withPrivateSession(async () => {});

export const { prepareKeyDeletion, deleteKeySnapshot } = regularHistory;
export const appStorage = {
  settings: settingsStorage,
  ...regularHistory,
  credentials: credentialsStorage,
};
