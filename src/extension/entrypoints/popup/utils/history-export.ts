import type { CaptureGroup } from '@/utils/capture-groups';
import { groupCaptureSessions } from './capture-sessions';
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

export const serializeCaptures = (captures: CaptureGroup[], records: KeyInfo[]) =>
  `${JSON.stringify(
    {
      version: 2,
      captures: captures.map((capture) => {
        const rows = capture.recordIndexes.flatMap((index) => {
          const key = records[index];
          return key ? [{ identity: index, key, visible: true }] : [];
        });
        return {
          url: capture.url,
          manifestUrl: capture.manifestUrl,
          manifest: capture.stream?.manifest,
          playlists: capture.stream?.playlists ?? [],
          createdAt: capture.createdAt,
          sessions: groupCaptureSessions(rows, capture.diagnostics).map((session) => {
            const diagnostic: unknown = session.diagnostic
              ? JSON.parse(formatCaptureTrace(session.diagnostic))
              : undefined;
            return {
              captureId: session.id,
              pssh: session.psshValues,
              records: session.entries.map((entry) => entry.key),
              diagnostic,
            };
          }),
        };
      }),
    },
    null,
    2,
  )}\n`;
