import { parsePsshBoxes, PSSH_SYSTEM_IDS } from '@okova/lib/pssh';
import type { BadgeDrmSystem } from '@/utils/storage';

const systemLabels = {
  W: 'Widevine',
  P: 'PlayReady',
  C: 'ClearKey',
} satisfies Record<BadgeDrmSystem, string>;

export const getSessionSystemLabels = (systems: (BadgeDrmSystem | undefined)[]) => {
  const known = systems.flatMap((system) => (system ? [systemLabels[system]] : []));
  return known.length ? [...new Set(known)] : ['Unknown'];
};

export const getPsshSystemLabels = (pssh: string) => {
  try {
    return [
      ...new Set(
        parsePsshBoxes(pssh).map((box) => {
          switch (box.systemId) {
            case PSSH_SYSTEM_IDS.widevine:
              return 'Widevine';
            case PSSH_SYSTEM_IDS.playready:
              return 'PlayReady';
            default:
              return 'Unknown';
          }
        }),
      ),
    ];
  } catch {
    return ['Unknown'];
  }
};

export const getPsshBadgeLabels = (
  pssh: string,
  sessionSystems: (BadgeDrmSystem | undefined)[],
) => {
  const labels = getPsshSystemLabels(pssh);
  const sessionLabels = getSessionSystemLabels(sessionSystems);
  const matches =
    labels.length === 1 &&
    sessionLabels.length === 1 &&
    labels[0] !== 'Unknown' &&
    labels[0] === sessionLabels[0];
  return matches ? [] : labels;
};
