import type { CaptureGroup } from '@/utils/capture-groups';
import { formatCaptureTrace } from '@/utils/session-diagnostics';
import { isCapturedKey, type KeyInfo } from '@/utils/storage';

export type HistoryExportFormat = 'json' | 'txt';

export const serializeHistory = (records: readonly KeyInfo[], format: HistoryExportFormat) => {
  if (format === 'json') return `${JSON.stringify({ version: 1, records }, null, 2)}\n`;

  const pairs = new Set(
    records
      .filter(isCapturedKey)
      .map((record) => `${record.id.toLowerCase()}:${record.value.toLowerCase()}`),
  );
  return pairs.size ? `${[...pairs].join('\n')}\n` : '';
};

export const serializeCaptures = (captures: CaptureGroup[]) =>
  `${JSON.stringify(
    {
      version: 3,
      captures: captures.map(({ stored: capture }) => ({
        id: capture.id,
        source: capture.source,
        manifest: capture.manifest,
        playlists: capture.playlists,
        createdAt: capture.createdAt,
        updatedAt: capture.updatedAt,
        sessions: capture.sessions.map((session) => ({
          ...session,
          diagnostic: session.diagnostic
            ? JSON.parse(formatCaptureTrace({ ...session.diagnostic, owner: '' }))
            : undefined,
        })),
      })),
    },
    null,
    2,
  )}\n`;
