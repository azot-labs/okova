import type { CaptureDiagnostic } from '@/utils/session-diagnostics';
import { isManifestUrl } from '@/utils/manifest';
import type { KeyInfo } from '@/utils/storage';
import type { StreamRecord } from '@/utils/streams';

export type CaptureGroup = {
  id: string;
  url: string;
  manifestUrl: string | undefined;
  stream: StreamRecord | undefined;
  sessionIds: string[];
  recordIndexes: number[];
  createdAt: number;
  diagnostics?: CaptureDiagnostic[];
};

// Groups display metadata only. Individual stored records remain unchanged.
export const groupCaptureRecords = (
  records: (Pick<KeyInfo, 'id' | 'url' | 'mpd' | 'captureId' | 'createdAt'> &
    Partial<Pick<KeyInfo, 'value' | 'pssh'>>)[],
  streams: StreamRecord[] = [],
  diagnostics: CaptureDiagnostic[] = [],
) => {
  const groups = new Map<string, CaptureGroup>();
  for (const stream of streams) {
    groups.set(stream.id, {
      id: stream.id,
      url: stream.frameUrl,
      manifestUrl: stream.manifest.url,
      stream,
      sessionIds: [],
      recordIndexes: [],
      createdAt: 0,
    });
  }
  const sessionManifests = new Map<string, Set<string>>();
  for (const record of records) {
    if (!record.captureId || !isManifestUrl(record.mpd)) continue;
    const session = JSON.stringify([record.url, record.captureId]);
    const manifests = sessionManifests.get(session) ?? new Set<string>();
    manifests.add(record.mpd);
    sessionManifests.set(session, manifests);
  }
  for (const [index, record] of records.entries()) {
    const session = JSON.stringify([record.url, record.captureId]);
    const known = record.captureId ? sessionManifests.get(session) : undefined;
    const manifestUrl = isManifestUrl(record.mpd)
      ? record.mpd
      : known?.size === 1
        ? [...known][0]
        : undefined;
    const matches = manifestUrl
      ? streams.filter(
          (stream) =>
            stream.frameUrl === record.url &&
            [stream.manifest, ...stream.playlists].some(
              (manifest) =>
                manifest.url === manifestUrl || manifest.requestUrls.includes(manifestUrl),
            ),
        )
      : [];
    const matched = matches.length === 1 ? matches[0] : undefined;
    const id =
      matched?.id ??
      JSON.stringify(
        manifestUrl
          ? ['manifest', record.url, manifestUrl]
          : record.captureId
            ? ['session', record.url, record.captureId]
            : ['legacy', record.url, record.id, record.createdAt, record.value, record.pssh],
      );
    const group = groups.get(id) ?? {
      id,
      url: record.url,
      manifestUrl,
      stream: undefined,
      sessionIds: [],
      recordIndexes: [],
      createdAt: record.createdAt,
    };
    group.recordIndexes.push(index);
    group.createdAt = Math.max(group.createdAt, record.createdAt);
    if (record.captureId && !group.sessionIds.includes(record.captureId))
      group.sessionIds.push(record.captureId);
    groups.set(id, group);
  }
  for (const diagnostic of diagnostics) {
    const matches = [...groups.values()].filter((group) =>
      group.sessionIds.includes(diagnostic.captureId),
    );
    if (matches.length === 1) {
      const group = matches[0];
      if (group) group.diagnostics = [...(group.diagnostics ?? []), diagnostic];
      continue;
    }
    const url = diagnostic.frameOrigin ?? diagnostic.origin ?? '';
    const id = JSON.stringify(['diagnostic', diagnostic.captureId]);
    groups.set(id, {
      id,
      url,
      manifestUrl: undefined,
      stream: undefined,
      sessionIds: [diagnostic.captureId],
      recordIndexes: [],
      createdAt: diagnostic.createdAt,
      diagnostics: [diagnostic],
    });
  }
  return [...groups.values()];
};
