import { storage } from '#imports';
import { isCapturedKey, type KeyInfo, type BadgeDrmSystem } from './storage';

const DRM_SYSTEMS = {
  W: 'Widevine',
  P: 'PlayReady',
  C: 'ClearKey',
} as const;

export type BadgeResult =
  | { kind: 'success'; system: BadgeDrmSystem | undefined; keys: string[] }
  | { kind: 'failure'; system: BadgeDrmSystem | undefined; error: string };

export const getBadgeStorage = (tabId: number) =>
  storage.defineItem<BadgeResult[]>(`session:badge-result:${tabId}`);

export const getBadgeDrmSystem = (keySystem: unknown): BadgeDrmSystem | undefined => {
  switch (keySystem) {
    case 'com.widevine.alpha':
      return 'W';
    case 'com.microsoft.playready':
    case 'com.microsoft.playready.recommendation':
    case 'com.microsoft.playready.recommendation.3000':
    case 'com.microsoft.playready.hardware':
      return 'P';
    case 'org.w3.clearkey':
      return 'C';
    default:
      return undefined;
  }
};

export const getBadgeKey = (key: KeyInfo) => `${key.id}:${key.value}`;

export const getBadgeAppearance = (keys: KeyInfo[], results: BadgeResult[] | null) => {
  const result = results?.at(-1);
  const captured = keys.filter(isCapturedKey);
  const displayed = captured.length ? captured : keys;
  const latest = displayed.reduce<KeyInfo | undefined>(
    (previous, key) => (!previous || key.createdAt >= previous.createdAt ? key : previous),
    undefined,
  );
  const isFresh =
    result?.kind === 'success' &&
    captured.some(
      (key) => key.drmSystem === result.system && result.keys.includes(getBadgeKey(key)),
    );
  const system = result?.kind === 'failure' || isFresh ? result?.system : latest?.drmSystem;
  const name = system ? DRM_SYSTEMS[system] : 'DRM';
  const breakdown = Object.entries(DRM_SYSTEMS)
    .map(([code, label]) => {
      const outcome = results?.find((entry) => entry.system === code);
      if (outcome?.kind === 'failure') return `${label}: retrieval failed`;
      if (outcome?.kind === 'success')
        return `${label}: ${outcome.keys.length} content keys retrieved this visit`;
      const count = displayed.filter((key) => key.drmSystem === code).length;
      return count ? `${label}: ${count} ${captured.length ? 'content keys' : 'key IDs'}` : '';
    })
    .filter(Boolean);
  const details = breakdown.length ? `\n${breakdown.join('\n')}` : '';
  if (result?.kind === 'failure') {
    return {
      text: `${system ?? ''}!`,
      color: '#C75300',
      title: `Okova: ${name} retrieval failed\n${result.error}${details}`,
    };
  }
  if (!displayed.length) return { text: '', color: '#666666', title: 'Okova' };
  const count = displayed.length > 99 ? '99+' : String(displayed.length);
  if (captured.length) {
    return {
      text: `${system ?? ''}${count}`,
      color: isFresh ? '#16803C' : '#2169EB',
      title: `Okova: ${captured.length} content keys ${isFresh ? 'retrieved this visit' : 'available from history'}${details}`,
    };
  }
  return {
    text: `${latest?.drmSystem ?? ''}${count}`,
    color: '#666666',
    title: `Okova: ${keys.length} key IDs observed; no content keys${details}`,
  };
};
