import { z } from 'zod/mini';
import {
  isManifestUrl,
  splitPssh,
  MAX_MANIFESTS,
  MAX_CHILD_PLAYLISTS,
  MAX_INIT_DATA_ENTRIES,
  MAX_MANIFEST_REQUEST_URLS,
  parseDetectedManifest,
  type DetectedManifest,
} from '@/utils/manifest';

const DASH_NAMESPACE = 'urn:mpeg:dash:schema:mpd:2011';
const CENC_NAMESPACE = 'urn:mpeg:cenc:2013';
const responseSchema = z.object({
  namespace: z.literal('okova:network'),
  method: z.literal('response'),
  params: z.object({
    url: z.string().check(z.refine(isManifestUrl)),
    requestUrl: z.optional(z.string().check(z.maxLength(8192), z.refine(isManifestUrl))),
    text: z.string().check(z.maxLength(1024 * 1024)),
  }),
});

declare global {
  interface Window {
    MPD_LIST: Map<string, string>;
    MANIFEST_LIST: Map<string, unknown>;
  }
}

// Smooth Streaming carries a raw PlayReady Object; EME usually wraps it in a PSSH.
const playreadyInitData = (value: string) => {
  try {
    const binary = atob(value.replace(/\s/g, ''));
    if (!binary.length) return [];
    const box = new Uint8Array(32 + binary.length);
    const view = new DataView(box.buffer);
    view.setUint32(0, box.length);
    box.set([0x70, 0x73, 0x73, 0x68], 4);
    box.set(
      [
        0x9a, 0x04, 0xf0, 0x79, 0x98, 0x40, 0x42, 0x86, 0xab, 0x92, 0xe6, 0x5b, 0xe0, 0x88, 0x5f,
        0x95,
      ],
      12,
    );
    view.setUint32(28, binary.length);
    for (let index = 0; index < binary.length; index++) box[32 + index] = binary.charCodeAt(index);
    return [btoa(binary), btoa(Array.from(box, (byte) => String.fromCharCode(byte)).join(''))];
  } catch {
    return [];
  }
};

const hlsAttributes = (line: string) =>
  new Map(
    Array.from(
      line
        .slice(line.indexOf(':') + 1)
        .matchAll(/(?:^|,)([A-Z0-9-]+)=(?:"([^"\r\n]*)"|([^,\r\n]*))/g),
      (match) => [match[1], match[2] ?? match[3]],
    ),
  );

const inspectManifest = (url: string, text: string): DetectedManifest | undefined => {
  const initData: string[] = [];
  if (/^#EXTM3U(?:\r?\n|$)/.test(text.trimStart())) {
    const children: string[] = [];
    let isMaster = false;
    let nextIsPlaylist = false;
    for (const rawLine of text.trimStart().split(/\r?\n/)) {
      const line = rawLine.trim();
      const attributes = hlsAttributes(line);
      if (line.startsWith('#EXT-X-SESSION-KEY:')) isMaster = true;
      if (/^#EXT-X-(?:SESSION-KEY|KEY):/.test(line) && attributes.get('METHOD') !== 'NONE') {
        const uri = attributes.get('URI');
        const data = uri?.match(/^data:[^,]*;base64,(.*)$/i)?.[1];
        if (data) {
          try {
            const decoded = decodeURIComponent(data);
            initData.push(...splitPssh(decoded));
            if (attributes.get('KEYFORMAT') === 'com.microsoft.playready')
              initData.push(...playreadyInitData(decoded));
          } catch {
            // Ignore malformed embedded data without losing the playlist URL.
          }
        }
      }
      let child: string | undefined;
      if (line.startsWith('#EXT-X-STREAM-INF:')) {
        isMaster = true;
        nextIsPlaylist = true;
      } else if (/^#EXT-X-(?:MEDIA|I-FRAME-STREAM-INF):/.test(line)) {
        isMaster = true;
        child = attributes.get('URI');
      } else if (nextIsPlaylist && line && !line.startsWith('#')) {
        child = line;
        nextIsPlaylist = false;
      }
      if (child && children.length < MAX_CHILD_PLAYLISTS) {
        try {
          const resolved = new URL(child, url).href;
          if (isManifestUrl(resolved)) children.push(resolved);
        } catch {
          // Invalid playlist references do not affect other variants.
        }
      }
    }
    return { url, kind: isMaster ? 'hls-master' : 'hls-media', initData, children };
  }
  const document = new DOMParser().parseFromString(text, 'text/xml');
  if (document.getElementsByTagNameNS('*', 'parsererror').length) return;
  const root = document.documentElement;
  if (root?.localName === 'MPD' && root.namespaceURI === DASH_NAMESPACE) {
    for (const protection of Array.from(
      document.getElementsByTagNameNS(DASH_NAMESPACE, 'ContentProtection'),
    )) {
      for (const child of Array.from(protection.getElementsByTagNameNS(CENC_NAMESPACE, 'pssh'))) {
        if (child.parentNode === protection) initData.push(...splitPssh(child.textContent ?? ''));
      }
    }
    return { url, kind: 'dash', initData, children: [] };
  }
  if (root?.localName === 'SmoothStreamingMedia' && !root.namespaceURI) {
    for (const header of Array.from(document.getElementsByTagName('ProtectionHeader'))) {
      const systemId = header.getAttribute('SystemID')?.replace(/[{}-]/g, '').toLowerCase();
      if (
        header.parentNode?.nodeName === 'Protection' &&
        systemId === '9a04f07998404286ab92e65be0885f95'
      )
        initData.push(...playreadyInitData(header.textContent ?? ''));
    }
    return { url, kind: 'mss', initData, children: [] };
  }
};

export const installManifestInspection = () => {
  if (!(window.MPD_LIST instanceof Map)) window.MPD_LIST = new Map();
  try {
    if (!(window.MANIFEST_LIST instanceof Map)) window.MANIFEST_LIST = new Map();
  } catch {
    try {
      Object.defineProperty(window, 'MANIFEST_LIST', {
        value: new Map(),
        writable: true,
        configurable: true,
      });
    } catch {
      // A non-configurable page property must not prevent listener registration.
    }
  }

  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (event.source !== window) return;
    const parsed = responseSchema.safeParse(event.data);
    if (!parsed.success) return;
    const { url, text, requestUrl } = parsed.data.params;
    try {
      const manifest = inspectManifest(url, text);
      if (!manifest) return;
      manifest.initData = [...new Set(manifest.initData)].slice(0, MAX_INIT_DATA_ENTRIES);
      const previous = parseDetectedManifest(window.MANIFEST_LIST.get(url));
      manifest.requestUrls = [
        ...new Set([...(requestUrl ? [requestUrl] : []), ...(previous?.requestUrls ?? [])]),
      ].slice(0, MAX_MANIFEST_REQUEST_URLS);
      window.MANIFEST_LIST.delete(url);
      window.MANIFEST_LIST.set(url, manifest);
      while (window.MANIFEST_LIST.size > MAX_MANIFESTS) {
        const oldest = window.MANIFEST_LIST.keys().next();
        if (!oldest.done) window.MANIFEST_LIST.delete(oldest.value);
      }
      for (const data of manifest.initData) {
        window.MPD_LIST.set(data, url);
        while (window.MPD_LIST.size > 1_000) {
          const oldest = window.MPD_LIST.keys().next();
          if (!oldest.done) window.MPD_LIST.delete(oldest.value);
        }
      }
    } catch {
      // An unrelated or malformed response must not break page message dispatch.
    }
  });
};
