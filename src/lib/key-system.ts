export const CLIENT_KEY_SYSTEMS = {
  widevine: 'com.widevine.alpha',
  playready: 'com.microsoft.playready.recommendation',
} as const;

export type ClientKeySystem = (typeof CLIENT_KEY_SYSTEMS)[keyof typeof CLIENT_KEY_SYSTEMS];

/** Normalize the supported EME names without accepting arbitrary vendor suffixes. */
export const normalizeKeySystem = (keySystem: string) => {
  switch (keySystem) {
    case 'com.widevine.alpha':
      return CLIENT_KEY_SYSTEMS.widevine;
    case 'com.microsoft.playready':
    case 'com.microsoft.playready.recommendation':
    case 'com.microsoft.playready.recommendation.3000':
    case 'com.microsoft.playready.hardware':
      return CLIENT_KEY_SYSTEMS.playready;
    default:
      throw new Error(`Unsupported DRM key system: ${keySystem}`);
  }
};
