import type { CaptureDiagnostic } from '@/utils/session-diagnostics';
import type { StoredCapture } from './storage/capture-history';
import type { StreamRecord } from '@/utils/streams';

export type CaptureGroup = {
  stored: StoredCapture;
  id: string;
  url: string;
  manifestUrl: string | undefined;
  stream: StreamRecord | undefined;
  sessionIds: string[];
  recordIndexes: number[];
  createdAt: number;
  diagnostics?: CaptureDiagnostic[];
};

// Projection only: persistent identities and relationships come from the capture store.
export const storedCaptureGroups = (captures: StoredCapture[]): CaptureGroup[] => {
  let offset = 0;
  return captures.map((capture) => {
    const count = capture.sessions.reduce((total, session) => total + session.records.length, 0);
    const recordIndexes = Array.from({ length: count }, (_, index) => offset + index);
    offset += count;
    return {
      id: capture.id,
      url: capture.source.url,
      manifestUrl: capture.manifest?.url,
      stream: capture.manifest
        ? {
            id: capture.id,
            frameId: capture.source.frameId ?? 0,
            documentId: capture.source.documentId,
            frameUrl: capture.source.url,
            manifest: { ...capture.manifest, requestUrls: capture.manifest.requestUrls ?? [] },
            playlists: capture.playlists.map((manifest) => ({
              ...manifest,
              requestUrls: manifest.requestUrls ?? [],
            })),
          }
        : undefined,
      sessionIds: capture.sessions.map((session) => session.id),
      recordIndexes,
      createdAt: capture.updatedAt,
      diagnostics: capture.sessions.flatMap((session) =>
        session.diagnostic ? [{ ...session.diagnostic, owner: '' }] : [],
      ),
      stored: capture,
    };
  });
};
