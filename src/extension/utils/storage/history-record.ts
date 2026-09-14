import type { Manifest } from '../manifest';

export type BadgeDrmSystem = 'W' | 'P' | 'C';

export type KeyInfo = {
  captureId?: string;
  drmSystem?: BadgeDrmSystem;
  id: string;
  value: string;
  url: string;
  /** Preferred URL. The legacy field name also supports HLS and MSS. */
  mpd?: string;
  manifests?: Manifest[];
  pssh: string;
  createdAt: number;
};

// Session identity keeps header bindings stable when manifest metadata or timestamps change.
export const keyRecordToken = (key: KeyInfo) =>
  key.captureId
    ? JSON.stringify(['session-key', key.captureId, key.id, key.value])
    : JSON.stringify([
        key.id,
        key.value,
        key.url,
        key.pssh,
        key.createdAt,
        key.mpd,
        key.drmSystem,
        key.manifests,
        key.captureId,
      ]);

export type KeyDeletionScope =
  | { kind: 'all' }
  | { kind: 'site'; domain: string }
  | { kind: 'selected'; records: KeyInfo[] };

export type RecentKeysByDomain = Record<string, KeyInfo[]>;

// History also contains EME statuses, which cannot be reused as content keys.
export const isCapturedKey = (key: KeyInfo) => /^[0-9a-f]{32}$/i.test(key.value);

export const getWebsiteDomain = (url?: string | null) => {
  if (!url) return null;

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  } catch {
    return null;
  }
};

export const getRecentKeysForUrl = (
  url: string | undefined | null,
  recentKeysByDomain: RecentKeysByDomain | null | undefined,
  recentKeys: KeyInfo[] | null | undefined,
) => {
  const domain = getWebsiteDomain(url);
  if (!domain) return [];

  const scopedKeys = recentKeysByDomain?.[domain];
  if (scopedKeys) return scopedKeys;

  const legacyKeys = recentKeys ?? [];
  const legacyDomain = getWebsiteDomain(legacyKeys[0]?.url);
  return legacyDomain === domain ? legacyKeys : [];
};
