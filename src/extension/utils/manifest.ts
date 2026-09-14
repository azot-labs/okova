import { z } from 'zod/mini';

export const MAX_MANIFESTS = 50;
export const MAX_CHILD_PLAYLISTS = 50;
export const MAX_INIT_DATA_ENTRIES = 50;
export const MAX_MANIFEST_REQUEST_URLS = 50;
export const MAX_MANIFEST_METADATA_BYTES = 16 * 1024;
export const manifestLabels = {
  dash: 'DASH',
  'hls-master': 'HLS master',
  'hls-media': 'HLS media',
  mss: 'MSS',
};

const manifestUrlSchema = z.string().check(
  z.maxLength(8192),
  z.refine((value) => isManifestUrl(value)),
);
const manifestKindSchema = z.enum(['dash', 'hls-master', 'hls-media', 'mss']);
const manifestSchema = z.object({
  url: manifestUrlSchema,
  kind: manifestKindSchema,
  matched: z.boolean(),
});
export type Manifest = z.infer<typeof manifestSchema>;

const detectedManifestSchema = z.object({
  url: manifestUrlSchema,
  kind: manifestKindSchema,
  initData: z
    .array(z.string().check(z.maxLength(1024 * 1024)))
    .check(z.maxLength(MAX_INIT_DATA_ENTRIES)),
  keyIds: z.optional(
    z.array(z.string().check(z.regex(/^[0-9a-f]{32}$/))).check(z.maxLength(MAX_INIT_DATA_ENTRIES)),
  ),
  children: z.array(manifestUrlSchema).check(z.maxLength(MAX_CHILD_PLAYLISTS)),
  requestUrls: z.optional(z.array(manifestUrlSchema).check(z.maxLength(MAX_MANIFEST_REQUEST_URLS))),
});
export type DetectedManifest = z.infer<typeof detectedManifestSchema>;

export const parseDetectedManifest = (value: unknown) => {
  try {
    const result = detectedManifestSchema.safeParse(value);
    return result.success ? result.data : undefined;
  } catch {
    // Page-owned properties can throw from getters. Manifest discovery must not stop EME.
    return undefined;
  }
};

const encoder = new TextEncoder();
const serializedSize = (value: unknown) => encoder.encode(JSON.stringify(value)).byteLength;

// Bound the complete serialized metadata, including the duplicated preferred URL.
// Keep URLs intact; truncating a signed URL would make it unusable.
export const getManifestMetadata = (record: { mpd?: unknown; manifests?: unknown }) => {
  const preferred = manifestUrlSchema.safeParse(record.mpd);
  let mpd = preferred.success ? preferred.data : undefined;
  let sizeBytes = serializedSize({ mpd, manifests: [] });
  if (sizeBytes > MAX_MANIFEST_METADATA_BYTES) {
    mpd = undefined;
    sizeBytes = serializedSize({ manifests: [] });
  }
  const candidates: Manifest[] = [];
  if (Array.isArray(record.manifests)) {
    for (const value of record.manifests.slice(0, MAX_MANIFESTS)) {
      const result = manifestSchema.safeParse(value);
      if (result.success && !candidates.some((item) => item.url === result.data.url))
        candidates.push(result.data);
    }
  }
  candidates.sort(
    (left, right) =>
      Number(right.url === mpd) - Number(left.url === mpd) ||
      Number(right.matched) - Number(left.matched),
  );
  const manifests: Manifest[] = [];
  for (const candidate of candidates) {
    const addedBytes = serializedSize(candidate) + (manifests.length ? 1 : 0);
    if (sizeBytes + addedBytes > MAX_MANIFEST_METADATA_BYTES) continue;
    manifests.push(candidate);
    sizeBytes += addedBytes;
  }
  return { mpd, ...(manifests.length ? { manifests } : {}) };
};

// Match the original box bytes without decoding DRM-specific payloads.
export const splitPssh = (initData: string): string[] => {
  try {
    const binary = atob(initData.replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const view = new DataView(bytes.buffer);
    const boxes: string[] = [];
    let offset = 0;
    while (offset < bytes.length) {
      if (bytes.length - offset < 8 || view.getUint32(offset + 4) !== 0x70737368) return [];
      const size = view.getUint32(offset);
      let length = size || bytes.length - offset;
      let headerLength = 8;
      if (size === 1) {
        if (bytes.length - offset < 16) return [];
        const extendedSize = view.getBigUint64(offset + 8);
        if (extendedSize > BigInt(bytes.length - offset)) return [];
        length = Number(extendedSize);
        headerLength = 16;
      }
      if (length < headerLength + 24 || length > bytes.length - offset) return [];
      boxes.push(btoa(binary.slice(offset, offset + length)));
      offset += length;
    }
    return boxes;
  } catch {
    return [];
  }
};

// This validates the URL scheme. Response inspection identifies the manifest format;
// extensionless and signed endpoints must also work in the manual command builder.
export const isManifestUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const findManifest = (initData: string | undefined) => {
  try {
    const manifests = window.MPD_LIST;
    if (!initData || !(manifests instanceof Map)) return undefined;
    const exact = manifests.get(initData);
    if (isManifestUrl(exact)) return exact;
    for (const pssh of splitPssh(initData)) {
      const url = manifests.get(pssh);
      if (isManifestUrl(url)) return url;
    }
  } catch {
    // Page-owned accessors and maps must not interrupt EME observation.
  }
  return undefined;
};
