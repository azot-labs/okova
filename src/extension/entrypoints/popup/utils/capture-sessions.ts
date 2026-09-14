import type { CaptureDiagnostic } from '@/utils/session-diagnostics';
import type { HistoryRow } from './history-rows';

type CaptureSession = {
  id: string | undefined;
  entries: HistoryRow[];
  psshValues: string[];
  diagnostic?: CaptureDiagnostic;
};

// Missing identities share an explicitly unknown bucket, not an inferred session.
export const groupCaptureSessions = (
  rows: HistoryRow[],
  diagnostics: CaptureDiagnostic[] = [],
  stored: import('@/utils/storage/capture-history').SessionRecord[] = [],
) => {
  const sessions = new Map<string | undefined, CaptureSession>();
  for (const session of stored)
    sessions.set(session.id, { id: session.id, entries: [], psshValues: [...session.pssh] });
  for (const row of rows) {
    const id = row.key.captureId || undefined;
    const session = sessions.get(id) ?? { id, entries: [], psshValues: [] };
    session.entries.push(row);
    const pssh = row.key.pssh.trim();
    if (pssh && !session.psshValues.includes(pssh)) session.psshValues.push(pssh);
    sessions.set(id, session);
  }
  for (const diagnostic of diagnostics) {
    const session = sessions.get(diagnostic.captureId) ?? {
      id: diagnostic.captureId,
      entries: [],
      psshValues: [],
    };
    session.diagnostic = diagnostic;
    sessions.set(diagnostic.captureId, session);
  }
  return [...sessions.values()];
};
