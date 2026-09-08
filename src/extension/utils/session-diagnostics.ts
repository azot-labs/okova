import { storage } from '#imports';
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

// Share the lock with tab cleanup so late writes cannot resurrect a closed tab's trace.
export const saveCaptureDiagnostic = (
  tabId: number,
  diagnostic: CaptureDiagnostic,
  isCurrent: () => boolean,
) =>
  navigator.locks.request(`okova:diagnostics:${tabId}`, async () => {
    if (!isCurrent()) return;
    const item = getCaptureDiagnosticsStorage(tabId);
    const records = (await item.getValue()) ?? [];
    await item.setValue(
      [...records.filter((record) => record.captureId !== diagnostic.captureId), diagnostic]
        .sort((left, right) => left.createdAt - right.createdAt)
        .slice(-20),
    );
  });

export const clearCaptureDiagnostics = (tabId: number) =>
  navigator.locks.request(`okova:diagnostics:${tabId}`, () =>
    getCaptureDiagnosticsStorage(tabId).removeValue(),
  );

export const closeCaptureDiagnostics = (tabId: number, owner?: string) =>
  navigator.locks.request(`okova:diagnostics:${tabId}`, async () => {
    const item = getCaptureDiagnosticsStorage(tabId);
    const records = await item.getValue();
    if (!records) return;
    for (const record of records) {
      if (record.outcome !== 'pending' || (owner !== undefined && record.owner !== owner)) continue;
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
      credential: record.credential,
      sessionId: record.sessionId,
      outcome: record.outcome,
      keyCount: record.keyCount,
      events: record.events,
    },
    null,
    2,
  );
