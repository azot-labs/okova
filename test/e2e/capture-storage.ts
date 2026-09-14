import { z } from 'zod';
import type { Worker } from 'playwright';
import type { KeyInfo } from '../../src/extension/utils/storage';
import type { StoredCapture } from '../../src/extension/utils/storage/capture-history';

const capturesSchema = z.array(
  z.object({
    id: z.string(),
    source: z.object({ url: z.string() }),
    manifest: z.object({ url: z.string(), kind: z.string() }).optional(),
    sessions: z.array(
      z.object({
        id: z.string(),
        pssh: z.array(z.string()),
        drmSystem: z.enum(['W', 'P', 'C']).optional(),
        createdAt: z.number(),
        updatedAt: z.number(),
        records: z.array(
          z.object({ kind: z.enum(['key', 'status']), id: z.string(), value: z.string() }),
        ),
        diagnostic: z
          .object({ sessionId: z.string().nullable(), outcome: z.string() })
          .passthrough()
          .optional(),
      }),
    ),
  }),
);
export const readStoredCaptures = async (worker: Worker) => {
  const raw = await worker.evaluate(
    async () => (await browser.storage.local.get('capture-history'))['capture-history'],
  );
  if (!raw) return [];
  const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return z.object({ captures: capturesSchema }).parse(value).captures;
};
export const readKeyRecords = async (worker: Worker) =>
  (await readStoredCaptures(worker)).flatMap((capture) =>
    capture.sessions.flatMap((session) =>
      session.records.map((record) => ({
        ...record,
        captureId: session.id,
        url: capture.source.url,
        mpd: capture.manifest?.url,
        pssh: session.pssh[0] ?? '',
        drmSystem: session.drmSystem,
        createdAt: session.updatedAt,
      })),
    ),
  );

// Explicit fixture conversion: tests seed the public capture model, never obsolete key stores.
export const capturesForRecords = (records: KeyInfo[]): StoredCapture[] => {
  const captures = new Map<string, StoredCapture>();
  for (const record of records) {
    const id = JSON.stringify([record.url, record.mpd ?? record.captureId ?? record.id]);
    const capture = captures.get(id) ?? {
      id,
      aliases: [],
      source: { url: record.url },
      manifest:
        record.mpd && /^https?:\/\//.test(record.mpd)
          ? {
              url: record.mpd,
              kind: record.mpd.includes('.m3u8') ? 'hls-master' : 'dash',
              initData: [],
              children: [],
            }
          : undefined,
      playlists: [],
      sessions: [],
      createdAt: record.createdAt,
      updatedAt: record.createdAt,
    };
    const sessionId = record.captureId ?? JSON.stringify([record.url, record.id, record.pssh]);
    let session = capture.sessions.find((session) => session.id === sessionId);
    if (!session) {
      session = {
        id: sessionId,
        pssh: record.pssh ? [record.pssh] : [],
        drmSystem: record.drmSystem,
        createdAt: record.createdAt,
        updatedAt: record.createdAt,
        records: [],
      };
      capture.sessions.push(session);
    }
    session.records.push({
      kind: /^[0-9a-f]{32}$/i.test(record.value) ? 'key' : 'status',
      id: record.id,
      value: record.value,
    });
    session.updatedAt = Math.max(session.updatedAt, record.createdAt);
    capture.updatedAt = Math.max(capture.updatedAt, record.createdAt);
    captures.set(id, capture);
  }
  return [...captures.values()];
};
export const seedKeyRecords = async (worker: Worker, records: KeyInfo[]) =>
  worker.evaluate(async (captures) => {
    await navigator.locks.request('okova:key-history', async () => {
      await browser.storage.local.set({
        'capture-history': JSON.stringify({ version: 1, captures, retiredSessionIds: [] }),
      });
    });
  }, capturesForRecords(records));
