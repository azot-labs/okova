import { getPsshKeyIds, parsePsshBoxes } from '../../lib/pssh';
import {
  MAX_MANIFESTS,
  splitPssh,
  parseDetectedManifest,
  findManifest,
  getManifestMetadata,
  type DetectedManifest,
  type Manifest,
} from './manifest';

export const getManifestCapture = (initData: string | undefined) => {
  const tokens = new Set(initData ? [initData, ...splitPssh(initData)] : []);
  const detected: DetectedManifest[] = [];
  if (window.MANIFEST_LIST instanceof Map) {
    for (const value of window.MANIFEST_LIST.values()) {
      if (detected.length === MAX_MANIFESTS) break;
      const manifest = parseDetectedManifest(value);
      if (manifest) detected.push(manifest);
    }
  }
  const directUrls = new Set(
    detected
      .filter((item) => item.initData.some((data) => tokens.has(data)))
      .map((item) => item.url),
  );
  const legacyMatch = findManifest(initData);
  // A manifest may declare only default_KID, with PSSH supplied by an init segment.
  // Match the complete known KID set, and never choose between competing manifests.
  if (!directUrls.size && !legacyMatch && initData) {
    const keyIds = new Set<string>();
    try {
      for (const box of parsePsshBoxes(initData)) {
        try {
          for (const id of getPsshKeyIds(box)) keyIds.add(id);
        } catch {
          // Unsupported payloads must not prevent inspecting other PSSH boxes.
        }
      }
    } catch {
      // Non-PSSH initialization data has no KIDs available through this parser.
    }
    if (keyIds.size) {
      const matches = detected.filter((item) =>
        [...keyIds].every((id) => item.keyIds?.includes(id)),
      );
      if (matches.length === 1) directUrls.add(matches[0]!.url);
    }
  }
  const matchedUrls = new Set(directUrls);
  // A master playlist can identify the capture through an observed child playlist.
  for (let pass = 0; pass < detected.length; pass++) {
    const previousSize = matchedUrls.size;
    for (const item of detected) {
      if (item.children.some((url) => matchedUrls.has(url))) matchedUrls.add(item.url);
      if (matchedUrls.has(item.url)) {
        for (const requestUrl of item.requestUrls ?? []) matchedUrls.add(requestUrl);
      }
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
    mpd: preferred?.url ?? legacyMatch,
    manifests,
  });
};
