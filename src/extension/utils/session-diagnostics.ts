import { getShareableCredentialFingerprint } from './credential-fingerprint';
import { browser, storage } from '#imports';
import type { DrmStage } from './storage';

export type CaptureDiagnostic = {
  captureId: string;
  owner: string;
  createdAt: number;
  origin: string | null;
  frameOrigin: string | null;
  frameId: number | null;
  documentId: string | null;
  keySystem: string;
  credential: { type: string; fingerprint: string; name?: string; keySystem?: string } | null;
  sessionId: string | null;
  outcome:
    | 'observed'
    | 'pending'
    | 'keys-returned'
    | 'no-content-keys'
    | 'failed'
    | 'timed-out'
    | 'closed';
  keyCount: number;
  events: {
    stage: DrmStage | 'eme';
    status: 'started' | 'succeeded' | 'failed' | 'interrupted';
    at: number;
    completedAt?: number;
  }[];
};

export const diagnosticOrigin = (url?: string) => {
  try {
    const parsed = new URL(url ?? '');
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.origin : null;
  } catch {
    return null;
  }
};

export const getCaptureDiagnosticsStorage = (tabId: number) =>
  storage.defineItem<CaptureDiagnostic[]>(`session:capture-diagnostics:${tabId}`);

// Session identity outlives the bounded diagnostic event list within an open tab.
const captureOwnersStorage = (tabId: number) =>
  storage.defineItem<Record<string, string>>(`session:capture-owners:${tabId}`);
export const getCaptureIdForOwner = async (tabId: number, owner: string) =>
  (await captureOwnersStorage(tabId).getValue())?.[owner];

// Keep only owner identities so late events cannot recreate a replaced session.
const retiredOwnersStorage = (tabId: number) =>
  storage.defineItem<string[]>(`session:retired-capture-owners:${tabId}`);

export const isRetiredCaptureOwner = async (tabId: number, owner: string) =>
  ((await retiredOwnersStorage(tabId).getValue()) ?? []).includes(owner);

export const retireCaptureDiagnostics = async (captureIds: string[]) => {
  const items = await browser.storage.session.get(null);
  for (const key of Object.keys(items)) {
    if (!key.startsWith('capture-diagnostics:') && !key.startsWith('capture-owners:')) continue;
    const tabId = Number(key.slice(key.indexOf(':') + 1));
    if (!Number.isInteger(tabId)) continue;
    await navigator.locks.request(`okova:diagnostics:${tabId}`, async () => {
      const item = getCaptureDiagnosticsStorage(tabId);
      const records = (await item.getValue()) ?? [];
      const removed = records.filter((record) => captureIds.includes(record.captureId));
      const index = (await captureOwnersStorage(tabId).getValue()) ?? {};
      const retiredOwners = Object.entries(index)
        .filter(([, id]) => captureIds.includes(id))
        .map(([owner]) => owner);
      if (!removed.length && !retiredOwners.length) return;
      const owners = retiredOwnersStorage(tabId);
      await owners.setValue([
        ...new Set([
          ...((await owners.getValue()) ?? []),
          ...removed.map((record) => record.owner),
          ...retiredOwners,
        ]),
      ]);
      await item.setValue(records.filter((record) => !captureIds.includes(record.captureId)));
    });
  }
};

// Share the lock with tab cleanup so late writes cannot resurrect a closed tab's trace.
export const saveCaptureDiagnostic = (
  tabId: number,
  diagnostic: CaptureDiagnostic,
  isCurrent: () => boolean,
  isNewCapture = false,
) =>
  navigator.locks.request(`okova:diagnostics:${tabId}`, async () => {
    if (!isCurrent() || (await isRetiredCaptureOwner(tabId, diagnostic.owner))) return;
    const item = getCaptureDiagnosticsStorage(tabId);
    const records = (await item.getValue()) ?? [];
    const previous = records.find((record) => record.captureId === diagnostic.captureId);
    // Cleanup and retention decisions win over requests holding an older snapshot.
    if (previous?.outcome === 'closed' || (!previous && !isNewCapture)) return;
    if (isNewCapture) {
      const index = captureOwnersStorage(tabId);
      await index.setValue({
        ...(await index.getValue()),
        [diagnostic.owner]: diagnostic.captureId,
      });
    }
    await item.setValue(
      [...records.filter((record) => record.captureId !== diagnostic.captureId), diagnostic]
        .sort((left, right) => left.createdAt - right.createdAt)
        .slice(-20),
    );
  });

export const clearCaptureDiagnostics = (tabId: number) =>
  navigator.locks.request(`okova:diagnostics:${tabId}`, async () => {
    await getCaptureDiagnosticsStorage(tabId).removeValue();
    await retiredOwnersStorage(tabId).removeValue();
    await captureOwnersStorage(tabId).removeValue();
  });

export const closeCaptureDiagnostics = (tabId: number, owner?: string) =>
  navigator.locks.request(`okova:diagnostics:${tabId}`, async () => {
    const item = getCaptureDiagnosticsStorage(tabId);
    const records = await item.getValue();
    if (!records) return;
    for (const record of records) {
      const isActive =
        record.outcome === 'pending' ||
        (record.outcome === 'observed' && record.events.at(-1)?.status === 'started');
      if (!isActive || (owner !== undefined && record.owner !== owner)) continue;
      record.outcome = 'closed';
      const last = record.events.at(-1);
      if (last?.status === 'started') {
        last.status = 'interrupted';
        last.completedAt = Date.now();
      }
    }
    await item.setValue(records);
  });

// Deliberately omit bridge tokens, URLs, payloads, key material and arbitrary error messages.
export const formatCaptureTrace = (record: CaptureDiagnostic) =>
  JSON.stringify(
    {
      version: 1,
      captureId: record.captureId,
      createdAt: record.createdAt,
      origin: record.origin,
      frameOrigin: record.frameOrigin,
      frameId: record.frameId,
      documentId: record.documentId,
      keySystem: record.keySystem,
      credential: record.credential && {
        ...record.credential,
        fingerprint: getShareableCredentialFingerprint(record.credential),
      },
      sessionId: record.sessionId,
      outcome: record.outcome,
      keyCount: record.keyCount,
      events: record.events,
    },
    null,
    2,
  );
