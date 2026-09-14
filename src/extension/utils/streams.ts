import { z } from 'zod';
import { isManifestUrl, MAX_MANIFESTS, type Manifest } from './manifest';

const urlSchema = z.string().max(8192).refine(isManifestUrl);
const observationSchema = z.object({
  url: urlSchema,
  kind: z.enum(['dash', 'hls-master', 'hls-media', 'mss']) satisfies z.ZodType<Manifest['kind']>,
  children: z.array(urlSchema).max(50),
  requestUrls: z.array(urlSchema).max(50),
});
export const frameStreamsSchema = z.object({
  url: z.string().max(8192),
  manifests: z
    .array(z.unknown())
    .max(MAX_MANIFESTS)
    .transform((values) =>
      values.flatMap((value) => {
        const result = observationSchema.safeParse(value);
        return result.success ? [result.data] : [];
      }),
    ),
  limited: z.boolean(),
});
export type ManifestObservation = z.infer<typeof observationSchema>;
export type StreamRecord = {
  documentId?: string;
  id: string;
  frameId: number;
  frameUrl: string;
  manifest: ManifestObservation;
  playlists: ManifestObservation[];
};

// Serialized by scripting.executeScript. Keep every dependency inside this function.
// Only URL metadata crosses out of the page, never bodies or initialization data.
export const readFrameStreams = () => {
  const manifests: { url: string; kind: string; children: string[]; requestUrls: string[] }[] = [];
  let limited = false;
  let sizeBytes = 0;
  const readUrls = (value: unknown) =>
    Array.isArray(value)
      ? value
          .slice(0, 50)
          .filter((url): url is string => typeof url === 'string' && url.length <= 8192)
      : [];
  try {
    const cache: unknown = window.MANIFEST_LIST;
    if (cache instanceof Map) {
      let inspected = 0;
      for (const entry of cache.values()) {
        if (++inspected > 50) {
          limited = true;
          break;
        }
        try {
          const value: unknown = entry;
          if (
            typeof value !== 'object' ||
            value === null ||
            !('url' in value) ||
            !('kind' in value) ||
            !('children' in value)
          )
            continue;
          const { url, kind, children } = value;
          const requestUrls = 'requestUrls' in value ? value.requestUrls : [];
          if (
            typeof url !== 'string' ||
            url.length > 8192 ||
            typeof kind !== 'string' ||
            kind.length > 20
          )
            continue;
          const manifest = {
            url,
            kind,
            children: readUrls(children),
            requestUrls: readUrls(requestUrls),
          };
          const bytes = new TextEncoder().encode(JSON.stringify(manifest)).byteLength;
          if (sizeBytes + bytes > 128 * 1024) {
            limited = true;
            continue;
          }
          sizeBytes += bytes;
          manifests.push(manifest);
        } catch {
          // Page-owned entries can contain throwing getters.
        }
      }
    }
  } catch {
    // The page can replace the global cache with an incompatible property.
  }
  return { url: window.location.href.slice(0, 8192), manifests, limited };
};

// Each top-level manifest owns its descendants. Shared children do not merge masters.
export const groupStreamManifests = (manifests: ManifestObservation[]) => {
  const unique = [...new Map(manifests.map((manifest) => [manifest.url, manifest])).values()];
  const childrenOf = (parent: ManifestObservation) =>
    parent.kind === 'hls-master'
      ? unique.filter(
          (child) =>
            child !== parent &&
            (child.kind === 'hls-master' || child.kind === 'hls-media') &&
            [child.url, ...child.requestUrls].some((url) => parent.children.includes(url)),
        )
      : [];
  const children = new Map(unique.map((manifest) => [manifest, childrenOf(manifest)]));
  const referenced = new Set([...children.values()].flat());
  const represented = new Set<ManifestObservation>();
  const groups: { manifest: ManifestObservation; playlists: ManifestObservation[] }[] = [];
  const addGroup = (manifest: ManifestObservation) => {
    const visited = new Set([manifest]);
    for (const parent of visited) {
      for (const child of children.get(parent) ?? []) visited.add(child);
    }
    for (const item of visited) represented.add(item);
    groups.push({ manifest, playlists: [...visited].filter((item) => item !== manifest) });
  };
  for (const manifest of unique) {
    if (!referenced.has(manifest)) addGroup(manifest);
  }
  // Malformed cyclic playlists must remain visible and cannot loop forever.
  for (const manifest of unique) {
    if (!represented.has(manifest)) addGroup(manifest);
  }
  return groups;
};
