import { installDrmPlayback } from '@/utils/drm-playback';
import { installEmeInterception } from './eme';

export default defineUnlistedScript(() => {
  installDrmPlayback();
  installEmeInterception();
});
