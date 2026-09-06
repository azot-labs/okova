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
