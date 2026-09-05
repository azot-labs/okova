/** Normalize the supported EME names without accepting arbitrary vendor suffixes. */
export const normalizeKeySystem = (keySystem: string) => {
  switch (keySystem) {
    case 'com.widevine.alpha':
      return 'com.widevine.alpha';
    case 'com.microsoft.playready':
    case 'com.microsoft.playready.recommendation':
    case 'com.microsoft.playready.recommendation.3000':
    case 'com.microsoft.playready.hardware':
      return 'com.microsoft.playready.recommendation';
    default:
      throw new Error(`Unsupported DRM key system: ${keySystem}`);
  }
};
