import { z } from 'zod/mini';

export const MAX_MANIFESTS = 50;
export const manifestLabels = {
  dash: 'DASH',
  'hls-master': 'HLS master',
  'hls-media': 'HLS media',
  mss: 'MSS',
};

const manifestSchema = z.object({
  url: z.string().check(
    z.maxLength(8192),
    z.refine((value) => isManifestUrl(value)),
  ),
  kind: z.enum(['dash', 'hls-master', 'hls-media', 'mss']),
  matched: z.boolean(),
});
export type Manifest = z.infer<typeof manifestSchema>;

// Page messages and old history records both cross this boundary.
export const getManifestMetadata = (record: { mpd?: unknown; manifests?: unknown }) => {
  const manifests: Manifest[] = [];
  if (Array.isArray(record.manifests)) {
    for (const value of record.manifests.slice(0, MAX_MANIFESTS)) {
      const result = manifestSchema.safeParse(value);
      if (result.success && !manifests.some((item) => item.url === result.data.url))
        manifests.push(result.data);
    }
  }
  return {
    mpd: isManifestUrl(record.mpd) ? record.mpd : undefined,
    ...(manifests.length ? { manifests } : {}),
  };
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
  if (!initData || !(window.MPD_LIST instanceof Map)) return undefined;
  const exact = window.MPD_LIST.get(initData);
  if (isManifestUrl(exact)) return exact;
  for (const pssh of splitPssh(initData)) {
    const url = window.MPD_LIST.get(pssh);
    if (isManifestUrl(url)) return url;
  }
  return undefined;
};

export const getManifestCapture = (initData: string | undefined) => {
  const tokens = new Set(initData ? [initData, ...splitPssh(initData)] : []);
  const detected = window.MANIFEST_LIST instanceof Map ? [...window.MANIFEST_LIST.values()] : [];
  const directUrls = new Set(
    detected
      .filter((item) => item.initData.some((data) => tokens.has(data)))
      .map((item) => item.url),
  );
  const matchedUrls = new Set(directUrls);
  // A master playlist can identify the capture through an observed child playlist.
  for (let pass = 0; pass < detected.length; pass++) {
    const previousSize = matchedUrls.size;
    for (const item of detected) {
      if (item.children.some((url) => matchedUrls.has(url))) matchedUrls.add(item.url);
    }
    if (previousSize === matchedUrls.size) break;
  }
  const priority = (manifest: Manifest) => {
    if (!manifest.matched) return 0;
    if (directUrls.has(manifest.url) && manifest.kind !== 'hls-media') return 3;
    // Prefer an HLS master to its media playlist, but keep direct DASH/MSS matches first.
    return manifest.kind === 'hls-master' ? 2 : 1;
  };
  const manifests = detected
    .map(({ url, kind }) => ({ url, kind, matched: matchedUrls.has(url) }))
    .sort((left, right) => priority(right) - priority(left));
  const preferred = manifests.find((item) => item.matched);
  return getManifestMetadata({
    mpd: preferred?.url ?? findManifest(initData),
    manifests,
  });
};
