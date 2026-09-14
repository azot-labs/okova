import { browser, storage } from '#imports';
import { z } from 'zod';
import { asJson } from './json';
import {
  getWebsiteDomain,
  isCapturedKey,
  keyRecordToken,
  type KeyInfo,
  type KeyDeletionScope,
} from './history-record';
import {
  parseDetectedManifest,
  getManifestMetadata,
  isManifestUrl,
  splitPssh,
  type DetectedManifest,
} from '../manifest';
import { getPsshKeyIds, parsePsshBoxes } from '../../../lib/pssh';
import {
  retireCaptureDiagnostics,
  getCaptureDiagnosticsStorage,
  type CaptureDiagnostic,
} from '../session-diagnostics';
import { groupStreamManifests } from '../streams';
import { getBadgeDrmSystem } from '../badge';

export type CaptureSource = { url: string; tabId?: number; frameId?: number; documentId?: string };
export type SessionRecord = {
  id: string;
  pssh: string[];
  drmSystem?: KeyInfo['drmSystem'];
  createdAt: number;
  updatedAt: number;
  records: (
    | { kind: 'key'; id: string; value: string; status?: string }
    | { kind: 'status'; id: string; value: string }
  )[];
  diagnostic?: Omit<CaptureDiagnostic, 'owner'>;
};
export type StoredCapture = {
  id: string;
  aliases: string[];
  source: CaptureSource;
  manifest?: DetectedManifest;
  playlists: DetectedManifest[];
  sessions: SessionRecord[];
  createdAt: number;
  updatedAt: number;
};
type CaptureHistory = {
  version: 1;
  runtimeId?: string;
  captures: StoredCapture[];
  retiredSessionIds: string[];
  deletedManifests?: { source: CaptureSource; urls: string[] }[];
};
const emptyHistory = (): CaptureHistory => ({ version: 1, captures: [], retiredSessionIds: [] });
const MAX_CAPTURE_BYTES = 6 * 1024 * 1024;
const MAX_CAPTURES = 1000;
const encoder = new TextEncoder();
const legacyKey = z.object({
  id: z.string(),
  value: z.string(),
  url: z.string(),
  pssh: z.string(),
  createdAt: z.number(),
  captureId: z.string().optional(),
  drmSystem: z.enum(['W', 'P', 'C']).optional(),
  mpd: z.string().optional(),
  manifests: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum(['dash', 'hls-master', 'hls-media', 'mss']),
        matched: z.boolean(),
      }),
    )
    .optional(),
});
const sameSource = (left: CaptureSource, right: CaptureSource) =>
  left.url === right.url &&
  (left.documentId === undefined ||
    right.documentId === undefined ||
    left.documentId === right.documentId) &&
  (left.tabId === undefined || right.tabId === undefined || left.tabId === right.tabId) &&
  (left.frameId === undefined || right.frameId === undefined || left.frameId === right.frameId);
const urlsOf = (capture: StoredCapture) =>
  [capture.manifest, ...capture.playlists].flatMap((manifest) =>
    manifest ? [manifest.url, ...(manifest.requestUrls ?? [])] : [],
  );
const newCapture = (source: CaptureSource, at: number): StoredCapture => ({
  id: crypto.randomUUID(),
  aliases: [],
  source,
  playlists: [],
  sessions: [],
  createdAt: at,
  updatedAt: at,
});
const sessionKeyIds = (session: SessionRecord) => {
  const ids = new Set(session.records.map((record) => record.id.toLowerCase()));
  for (const pssh of session.pssh) {
    try {
      for (const box of parsePsshBoxes(pssh)) {
        try {
          for (const id of getPsshKeyIds(box)) ids.add(id);
        } catch {
          /* Unsupported PSSH payload. */
        }
      }
    } catch {
      /* Initialization data need not be PSSH. */
    }
  }
  return [...ids];
};

// Reconcile both event orders: manifest before session and manifest after session.
const associateSessions = (data: CaptureHistory) => {
  for (const capture of [...data.captures]) {
    if (capture.manifest) continue;
    for (const session of [...capture.sessions]) {
      const candidates = data.captures.filter(
        (candidate) => candidate.manifest && sameSource(candidate.source, capture.source),
      );
      const tokens = new Set(session.pssh.flatMap((pssh) => [pssh, ...splitPssh(pssh)]));
      let matches = candidates.filter((candidate) =>
        [candidate.manifest, ...candidate.playlists].some((manifest) =>
          manifest?.initData.some((pssh) => tokens.has(pssh)),
        ),
      );
      if (!matches.length) {
        const ids = sessionKeyIds(session);
        if (ids.length)
          matches = candidates.filter((candidate) =>
            ids.every((id) =>
              [candidate.manifest, ...candidate.playlists].some((manifest) =>
                manifest?.keyIds?.includes(id),
              ),
            ),
          );
      }
      if (matches.length !== 1) continue;
      const target = matches[0]!;
      // Preserve the session-only capture's identity when attaching its first manifest.
      if (
        capture.sessions.length === 1 &&
        !target.sessions.length &&
        capture.createdAt < target.createdAt
      ) {
        target.aliases.push(target.id, ...capture.aliases);
        target.id = capture.id;
      } else target.aliases.push(capture.id, ...capture.aliases);
      target.sessions.push(session);
      target.createdAt = Math.min(target.createdAt, capture.createdAt);
      target.updatedAt = Math.max(target.updatedAt, capture.updatedAt);
      capture.sessions = capture.sessions.filter((item) => item !== session);
    }
    if (!capture.sessions.length) data.captures = data.captures.filter((item) => item !== capture);
  }
};

export const captureRecords = (captures: readonly StoredCapture[]): KeyInfo[] =>
  captures.flatMap((capture) =>
    capture.sessions.flatMap((session) =>
      session.records.map((record) => ({
        captureId: session.id,
        drmSystem: session.drmSystem,
        id: record.id,
        value: record.value,
        url: capture.source.url,
        mpd: capture.manifest?.url,
        pssh: session.pssh[0] ?? '',
        createdAt: session.updatedAt,
      })),
    ),
  );
const addKeys = (data: CaptureHistory, keys: KeyInfo[], source?: CaptureSource) => {
  for (const input of keys) {
    const key = { ...input, mpd: isManifestUrl(input.mpd) ? input.mpd : undefined };
    if (key.captureId && data.retiredSessionIds.includes(key.captureId)) continue;
    const context = source ?? { url: key.url };
    // Older records carried the page's manifest list. Preserve observations without
    // treating every listed manifest as evidence of a session relationship.
    for (const metadata of getManifestMetadata(key).manifests ?? []) {
      if (
        data.deletedManifests?.some(
          (deleted) =>
            deleted.source.documentId === context.documentId &&
            deleted.source.tabId === context.tabId &&
            deleted.urls.includes(metadata.url),
        )
      )
        continue;
      if (
        data.captures.some(
          (capture) =>
            sameSource(capture.source, context) && urlsOf(capture).includes(metadata.url),
        )
      )
        continue;
      data.captures.push({
        ...newCapture(context, key.createdAt),
        manifest: { url: metadata.url, kind: metadata.kind, initData: [], children: [] },
      });
    }
    let capture = data.captures.find((item) =>
      item.sessions.some((session) => session.id === key.captureId),
    );
    if (!capture && key.mpd) {
      const matches = data.captures.filter(
        (item) => sameSource(item.source, context) && urlsOf(item).includes(key.mpd!),
      );
      if (matches.length === 1) capture = matches[0];
    }
    if (!capture) {
      capture = newCapture(context, key.createdAt);
      data.captures.push(capture);
    }
    if (key.mpd && !capture.manifest) {
      const matches = data.captures.filter(
        (item) =>
          item !== capture && sameSource(item.source, context) && urlsOf(item).includes(key.mpd!),
      );
      if (matches.length === 1) {
        const target = matches[0]!;
        if (!target.sessions.length && capture.createdAt < target.createdAt) {
          target.aliases.push(target.id);
          target.id = capture.id;
        } else target.aliases.push(capture.id);
        target.aliases.push(...capture.aliases);
        target.sessions.push(...capture.sessions);
        data.captures = data.captures.filter((item) => item !== capture);
        capture = target;
      }
    }
    if (key.mpd && !capture.manifest)
      capture.manifest = {
        url: key.mpd,
        kind: /m3u8?($|\?)/i.test(key.mpd) ? 'hls-media' : /\.ism/i.test(key.mpd) ? 'mss' : 'dash',
        initData: [],
        children: [],
      };
    let session = capture.sessions.find((item) => item.id === key.captureId);
    if (!session && !key.captureId)
      session = capture.sessions.find((item) => item.pssh.includes(key.pssh));
    if (!session) {
      session = {
        id: key.captureId || crypto.randomUUID(),
        pssh: [],
        drmSystem: key.drmSystem,
        createdAt: key.createdAt,
        updatedAt: key.createdAt,
        records: [],
      };
      capture.sessions.push(session);
    }
    const pssh = key.pssh.trim();
    if (pssh && !session.pssh.includes(pssh)) session.pssh.push(pssh);
    session.drmSystem ??= key.drmSystem;
    session.updatedAt = Math.max(session.updatedAt, key.createdAt);
    const previous = session.records.find((record) => record.id === key.id);
    if (isCapturedKey(key)) {
      if (!previous) session.records.push({ kind: 'key', id: key.id, value: key.value });
      else if (previous.kind === 'status')
        session.records.splice(session.records.indexOf(previous), 1, {
          kind: 'key',
          id: key.id,
          value: key.value,
          status: previous.value,
        });
      else if (previous.value === key.value) {
        /* Repeated result. */
      } else if (
        !session.records.some((record) => record.id === key.id && record.value === key.value)
      )
        session.records.push({ kind: 'key', id: key.id, value: key.value });
    } else if (previous?.kind === 'key') previous.status = key.value;
    else if (previous) previous.value = key.value;
    else session.records.push({ kind: 'status', id: key.id, value: key.value });
    capture.updatedAt = Math.max(capture.updatedAt, key.createdAt);
  }
  associateSessions(data);
};

const applyDiagnostic = (
  data: CaptureHistory,
  source: CaptureSource,
  diagnostic: CaptureDiagnostic,
  pssh?: string,
) => {
  if (data.retiredSessionIds.includes(diagnostic.captureId)) return;
  let capture = data.captures.find((item) =>
    item.sessions.some((session) => session.id === diagnostic.captureId),
  );
  if (!capture) {
    capture = newCapture(source, diagnostic.createdAt);
    data.captures.push(capture);
  }
  let session = capture.sessions.find((item) => item.id === diagnostic.captureId);
  if (!session) {
    session = {
      id: diagnostic.captureId,
      createdAt: diagnostic.createdAt,
      updatedAt: diagnostic.createdAt,
      pssh: [],
      records: [],
    };
    capture.sessions.push(session);
  }
  const { owner, ...summary } = diagnostic;
  void owner;
  session.diagnostic = summary;
  session.drmSystem ??= getBadgeDrmSystem(diagnostic.keySystem);
  if (pssh?.trim() && !session.pssh.includes(pssh.trim())) session.pssh.push(pssh.trim());
  session.updatedAt = Math.max(
    session.updatedAt,
    diagnostic.events.at(-1)?.completedAt ?? diagnostic.events.at(-1)?.at ?? diagnostic.createdAt,
  );
  capture.updatedAt = Math.max(capture.updatedAt, session.updatedAt);
  associateSessions(data);
};

const replaceSessions = (data: CaptureHistory, sessionId: string) => {
  const capture = data.captures.find((item) =>
    item.sessions.some((session) => session.id === sessionId),
  );
  if (!capture) return;
  const signatures = new Map<string, SessionRecord>();
  const retired: string[] = [];
  for (const session of [...capture.sessions].sort((a, b) => a.updatedAt - b.updatedAt)) {
    if (
      !session.pssh.length ||
      !session.records.length ||
      session.records.some((record) => record.kind !== 'key')
    )
      continue;
    const signature = JSON.stringify([
      session.drmSystem,
      [...session.pssh].sort(),
      session.records
        .map((record) => `${record.id.toLowerCase()}:${record.value.toLowerCase()}`)
        .sort(),
    ]);
    const previous = signatures.get(signature);
    if (previous) retired.push(previous.id);
    signatures.set(signature, session);
  }
  capture.sessions = capture.sessions.filter((session) => !retired.includes(session.id));
  data.retiredSessionIds = [...new Set([...data.retiredSessionIds, ...retired])];
};

const closePending = (session: SessionRecord) => {
  const diagnostic = session.diagnostic;
  if (
    !diagnostic ||
    (diagnostic.outcome !== 'pending' &&
      !(diagnostic.outcome === 'observed' && diagnostic.events.at(-1)?.status === 'started'))
  )
    return;
  diagnostic.outcome = 'closed';
  const last = diagnostic.events.at(-1);
  if (last?.status === 'started') {
    last.status = 'interrupted';
    last.completedAt = Date.now();
  }
};

export const createCaptureHistory = (
  prefix: 'local:' | 'session:incognito:',
  mutate: (operation: () => Promise<void>) => Promise<void>,
) => {
  const item = asJson(storage.defineItem<CaptureHistory>(`${prefix}capture-history`));
  const legacyNames = ['all-keys', 'recent-keys', 'recent-keys-by-domain'].map(
    (name) => `${prefix}${name}` as const,
  );
  const runtime = storage.defineItem<string>(
    prefix === 'local:'
      ? 'session:capture-history-runtime-id'
      : 'session:incognito:capture-history-runtime-id',
  );
  const read = async () => {
    let runtimeId = await runtime.getValue();
    if (!runtimeId) {
      runtimeId = crypto.randomUUID();
      await runtime.setValue(runtimeId);
    }
    const current = await item.getValue();
    if (current) {
      if (current.version !== 1) throw new Error('Unsupported capture history version');
      if (current.runtimeId !== runtimeId) {
        current.runtimeId = runtimeId;
        current.retiredSessionIds = [];
        current.deletedManifests = [];
        for (const capture of current.captures)
          for (const session of capture.sessions) closePending(session);
        await save(current);
      }
      return current;
    }
    const data = emptyHistory();
    data.runtimeId = runtimeId;
    const migratedKeys = new Map<string, KeyInfo>();
    for (const name of legacyNames) {
      const value = await asJson(storage.defineItem<unknown>(name)).getValue();
      const entries = Array.isArray(value)
        ? value
        : value && typeof value === 'object'
          ? Object.values(value).flat()
          : [];
      const keys = entries.flatMap((entry) => {
        const parsed = legacyKey.safeParse(entry);
        return parsed.success ? [parsed.data] : [];
      });
      for (const key of keys)
        migratedKeys.set(
          JSON.stringify([key.captureId, key.url, key.id, key.value, key.pssh, key.createdAt]),
          key,
        );
    }
    addKeys(data, [...migratedKeys.values()]);
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id === undefined || Boolean(tab.incognito) !== (prefix !== 'local:')) continue;
      for (const diagnostic of (await getCaptureDiagnosticsStorage(tab.id).getValue()) ?? []) {
        const existing = data.captures.find((capture) =>
          capture.sessions.some((session) => session.id === diagnostic.captureId),
        );
        applyDiagnostic(
          data,
          existing?.source ?? {
            url:
              diagnostic.frameId === 0
                ? (tab.url ?? diagnostic.origin ?? '')
                : (diagnostic.frameOrigin ?? ''),
            tabId: tab.id,
            frameId: diagnostic.frameId ?? undefined,
            documentId: diagnostic.documentId ?? undefined,
          },
          diagnostic,
        );
      }
    }
    await save(data);
    // Remove legacy copies only after the canonical record is safely written.
    await storage.removeItems(legacyNames);
    return data;
  };
  const save = async (data: CaptureHistory) => {
    data.captures.sort((left, right) => left.updatedAt - right.updatedAt);
    const newest = data.captures.at(-1);
    if (
      newest &&
      encoder.encode(JSON.stringify(JSON.stringify({ ...data, captures: [newest] }))).byteLength >
        MAX_CAPTURE_BYTES
    )
      throw new Error('Capture exceeds history storage budget');
    if (data.captures.length > MAX_CAPTURES)
      data.captures.splice(0, data.captures.length - MAX_CAPTURES);
    while (
      data.captures.length > MAX_CAPTURES ||
      encoder.encode(JSON.stringify(JSON.stringify(data))).byteLength > MAX_CAPTURE_BYTES
    ) {
      if (data.captures.length <= 1) throw new Error('Capture exceeds history storage budget');
      data.captures.shift();
    }
    await item.setValue(data);
  };
  const update = (operation: (data: CaptureHistory) => void | Promise<void>) =>
    mutate(async () => {
      const data = await read();
      const before = new Set(data.retiredSessionIds);
      await operation(data);
      await save(data);
      const retired = data.retiredSessionIds.filter((id) => !before.has(id));
      if (retired.length) await retireCaptureDiagnostics(retired).catch(() => {});
    });
  const getCaptures = async () => {
    let result: StoredCapture[] = [];
    await mutate(async () => {
      result = (await read()).captures;
    });
    return result;
  };
  const watchCaptures = (callback: (captures: StoredCapture[]) => void) =>
    item.watch((value) => callback(value?.captures ?? []));
  const upsertKeys = (keys: KeyInfo[], source?: CaptureSource, completed = false) =>
    update((data) => {
      addKeys(data, keys, source);
      if (completed && keys[0]?.captureId) replaceSessions(data, keys[0].captureId);
    });
  const deleteCaptures = (ids: string[]) =>
    update(async (data) => {
      const removed = data.captures.filter(
        (capture) => ids.includes(capture.id) || capture.aliases.some((id) => ids.includes(id)),
      );
      data.deletedManifests = [
        ...(data.deletedManifests ?? []),
        ...removed
          .filter((capture) => capture.manifest && capture.source.documentId)
          .map((capture) => ({ source: capture.source, urls: urlsOf(capture) })),
      ];
      const sessions = removed.flatMap((capture) => capture.sessions.map((session) => session.id));
      data.retiredSessionIds = [...new Set([...data.retiredSessionIds, ...sessions])];
      data.captures = data.captures.filter((capture) => !removed.includes(capture));
    });
  const observeManifest = (source: CaptureSource, input: unknown) =>
    update((data) => {
      const manifest = parseDetectedManifest(input);
      if (
        !manifest ||
        data.deletedManifests?.some(
          (deleted) =>
            deleted.source.documentId === source.documentId &&
            deleted.source.tabId === source.tabId &&
            deleted.urls.includes(manifest.url),
        )
      )
        return;
      const candidates = data.captures.filter((capture) => sameSource(capture.source, source));
      const observations = new Map(
        candidates.flatMap((capture) =>
          [capture.manifest, ...capture.playlists].flatMap((item) =>
            item ? [[item.url, item] as const] : [],
          ),
        ),
      );
      const previous = observations.get(manifest.url);
      if (previous && !manifest.initData.length) manifest.initData = previous.initData;
      if (previous && !manifest.keyIds?.length) manifest.keyIds = previous.keyIds;
      observations.set(manifest.url, manifest);
      const grouped = groupStreamManifests(
        [...observations.values()].map((item) => ({
          ...item,
          requestUrls: item.requestUrls ?? [],
        })),
      );
      for (const group of grouped) {
        const members = [group.manifest, ...group.playlists];
        const matching = candidates.filter((capture) => {
          if (!capture.manifest || !data.captures.includes(capture)) return false;
          if (capture.manifest.url === group.manifest.url) return true;
          // A shared child is not evidence that its parent masters are the same capture.
          const owners = grouped.filter((owner) =>
            owner.playlists.some((item) => item.url === capture.manifest?.url),
          );
          return owners.length === 1 && members.some((item) => item.url === capture.manifest?.url);
        });
        const capture = matching[0] ?? newCapture(source, Date.now());
        if (!matching.length) data.captures.push(capture);
        capture.source = source;
        capture.manifest = observations.get(group.manifest.url);
        capture.playlists = group.playlists.flatMap((item) => {
          const observed = observations.get(item.url);
          return observed ? [observed] : [];
        });
        if (
          members.some((item) => item.url === manifest.url) &&
          JSON.stringify(previous) !== JSON.stringify(manifest)
        )
          capture.updatedAt = Date.now();
        for (const duplicate of matching.slice(1)) {
          capture.sessions.push(...duplicate.sessions);
          capture.aliases.push(duplicate.id, ...duplicate.aliases);
          data.captures = data.captures.filter((item) => item !== duplicate);
        }
      }
      associateSessions(data);
    });
  const upsertDiagnostic = (source: CaptureSource, diagnostic: CaptureDiagnostic, pssh?: string) =>
    update((data) => applyDiagnostic(data, source, diagnostic, pssh));
  const replaceDuplicateSessions = (sessionId: string) =>
    update((data) => replaceSessions(data, sessionId));
  const getKeys = async () => captureRecords(await getCaptures());
  const watchKeys = (callback: (keys: KeyInfo[]) => void) =>
    watchCaptures((captures) => callback(captureRecords(captures)));
  const setKeys = (keys: KeyInfo[]) =>
    update((data) => {
      data.captures = [];
      addKeys(data, keys);
    });
  const domainsOf = (keys: KeyInfo[]) =>
    Object.groupBy(keys, (key) => getWebsiteDomain(key.url) ?? '');
  const getDomains = async () =>
    Object.fromEntries(
      Object.entries(domainsOf(await getKeys())).map(([domain, keys]) => [domain, keys ?? []]),
    );
  const clear = async () => deleteCaptures((await getCaptures()).map((capture) => capture.id));
  // Compatibility views for engine/header callers. They no longer own separate stored copies.
  const keyView = { key: item.key, getValue: getKeys, setValue: setKeys, watch: watchKeys };
  const domainView = {
    key: item.key,
    getValue: getDomains,
    setValue: (domains: Record<string, KeyInfo[]>) => setKeys(Object.values(domains).flat()),
    watch: (callback: (domains: Record<string, KeyInfo[]>) => void) =>
      watchKeys((keys) =>
        callback(
          Object.fromEntries(
            Object.entries(domainsOf(keys)).map(([domain, values]) => [domain, values ?? []]),
          ),
        ),
      ),
  };
  const prepareKeyDeletion = async (scope: KeyDeletionScope) => {
    const keys = (await getKeys()).filter(
      (key) =>
        scope.kind === 'all' ||
        (scope.kind === 'site'
          ? getWebsiteDomain(key.url) === scope.domain
          : scope.records.some(
              (record) =>
                record.captureId === key.captureId &&
                record.id === key.id &&
                record.value === key.value,
            )),
    );
    return { count: keys.length, tokens: keys.map(keyRecordToken) };
  };
  const deleteKeySnapshot = async (tokens: string[]) => {
    const captures = (await getCaptures()).filter((capture) =>
      captureRecords([capture]).some((key) => tokens.includes(keyRecordToken(key))),
    );
    await deleteCaptures(captures.map((capture) => capture.id));
  };
  const closePendingSessions = (tabId: number, sessionId?: string) =>
    update((data) => {
      for (const capture of data.captures) {
        if (capture.source.tabId !== tabId) continue;
        for (const session of capture.sessions) {
          if (!sessionId || session.id === sessionId) closePending(session);
        }
      }
    });
  return {
    captures: { getValue: getCaptures, watch: watchCaptures },
    observeManifest,
    upsertKeys,
    upsertDiagnostic,
    closePendingSessions,
    deleteCaptures,
    replaceDuplicateSessions,
    prepareKeyDeletion,
    deleteKeySnapshot,
    allKeys: {
      ...keyView,
      raw: keyView,
      add: (...keys: KeyInfo[]) => upsertKeys(keys),
      clear,
      remove: async (key: KeyInfo) => deleteKeySnapshot([keyRecordToken(key)]),
    },
    recentKeys: {
      ...keyView,
      setForUrl: (_url: string | undefined, keys: KeyInfo[]) => upsertKeys(keys),
    },
    recentKeysByDomain: {
      ...domainView,
      raw: domainView,
      clear,
      setForUrl: (_url: string | undefined, keys: KeyInfo[]) => upsertKeys(keys),
    },
  };
};
