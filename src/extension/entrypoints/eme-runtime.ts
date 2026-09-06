import { installEmeInterception } from '@/utils/eme-interception';
import { installDrmPlayback, resolvePlaybackMethod } from '@/utils/drm-playback';
import type {} from '@/utils/eme-runtime';

// Loading the file only publishes the installer. The bootstrap decides whether
// this document is still waiting, so a late injection cannot change native playback.
export default defineUnlistedScript(() => {
  window.__okovaEmeInstaller = (playback) => {
    if (playback) installDrmPlayback();
    installEmeInterception();
    return resolvePlaybackMethod;
  };
});
