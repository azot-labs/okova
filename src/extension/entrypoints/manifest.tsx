import { z } from 'zod/mini';
import { splitPssh } from '@/utils/manifest';

const DASH_NAMESPACE = 'urn:mpeg:dash:schema:mpd:2011';
const CENC_NAMESPACE = 'urn:mpeg:cenc:2013';
const responseSchema = z.object({
  namespace: z.literal('okova:network'),
  method: z.literal('response'),
  params: z.object({ url: z.string(), text: z.string().check(z.maxLength(1024 * 1024)) }),
});

declare global {
  interface Window {
    MPD_LIST: Map<string, string>;
  }
}

export default defineUnlistedScript(() => {
  window.MPD_LIST ??= new Map();

  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (event.source !== window) return;
    const parsed = responseSchema.safeParse(event.data);
    if (!parsed.success) return;
    const { url, text } = parsed.data.params;
    try {
      const mpd = new DOMParser().parseFromString(text, 'text/xml');
      if (mpd.getElementsByTagNameNS('*', 'parsererror').length) return;
      if (
        mpd.documentElement?.localName !== 'MPD' ||
        mpd.documentElement.namespaceURI !== DASH_NAMESPACE
      )
        return;
      for (const protection of Array.from(
        mpd.getElementsByTagNameNS(DASH_NAMESPACE, 'ContentProtection'),
      )) {
        for (const child of Array.from(protection.getElementsByTagNameNS(CENC_NAMESPACE, 'pssh'))) {
          if (child.parentNode !== protection) continue;
          for (const pssh of splitPssh(child.textContent ?? '')) window.MPD_LIST.set(pssh, url);
        }
      }
    } catch {
      // An unrelated or malformed response must not break page message dispatch.
    }
  });
});
