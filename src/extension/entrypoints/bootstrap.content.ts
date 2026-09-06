import { installManifestInspection } from '@/utils/manifest-inspection';

export default defineContentScript({
  matches: ['https://*/*', 'http://*/*'],
  runAt: 'document_start',
  allFrames: true,
  matchOriginAsFallback: true,
  matchAboutBlank: true,
  world: 'MAIN',
  main: installManifestInspection,
});
