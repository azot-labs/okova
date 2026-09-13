import { isManifestUrl } from './manifest';
import { z } from 'zod/mini';

export const requestHeaderSchema = z.object({
  name: z.string().check(z.maxLength(256), z.regex(/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/)),
  // Reject control characters to prevent header injection and shell NUL truncation.
  // oxlint-disable-next-line no-control-regex
  value: z.string().check(z.maxLength(16 * 1024), z.regex(/^[^\x00-\x1f\x7f]*$/)),
});
export const requestHeadersSchema = z.array(requestHeaderSchema).check(z.maxLength(100));
export const pageRequestHeadersSchema = z.object({
  url: z.string().check(z.maxLength(8192), z.refine(isManifestUrl)),
  headers: requestHeadersSchema,
  startedAt: z.number(),
  completedAt: z.number(),
});
export type RequestHeader = z.infer<typeof requestHeaderSchema>;

// Transport, compression, conditional and partial-response headers interfere with a fresh download.
export const getDownloadHeaders = (headers: unknown): RequestHeader[] => {
  const parsed = requestHeadersSchema.safeParse(headers);
  if (!parsed.success) return [];
  return parsed.data.filter(
    ({ name }) =>
      !/^(host|connection|content-length|transfer-encoding|accept-encoding|range|if-.*|proxy-.*|sec-.*|upgrade|te|trailer)$/i.test(
        name,
      ),
  );
};

export const isSensitiveHeader = (name: string) =>
  /cookie|authorization|token|secret|api[-_]?key/i.test(name);

type Observation = {
  requestId: string;
  tabId: number;
  frameId: number;
  url: string;
  headers: RequestHeader[];
  at: number;
};
type Capture = {
  token: string;
  tabId: number;
  frameId: number;
  incognito: boolean;
  at: number;
  manifests: { url: string; headers: RequestHeader[] }[];
};

// Memory only: secrets disappear on worker restart, navigation, tab close or expiry.
export const createRequestHeaderCache = (now = Date.now) => {
  const requests: (Observation & { redirected: boolean })[] = [];
  const captures: Capture[] = [];
  const ttlMs = 5 * 60_000;
  const prune = () => {
    for (const entries of [requests, captures]) {
      while (entries[0] && entries[0].at <= now() - ttlMs) entries.shift();
    }
  };
  return {
    observe: (
      observation: Omit<Observation, 'at' | 'headers'> & { headers: unknown },
      at = now(),
    ) => {
      prune();
      const headers = getDownloadHeaders(observation.headers);
      if (JSON.stringify(headers).length > 32 * 1024 || observation.url.length > 8192) return;
      // A redirect keeps its request ID, but each URL keeps its own headers.
      const previous = requests.findIndex(
        (entry) => entry.requestId === observation.requestId && entry.url === observation.url,
      );
      const redirected = requests.some(
        (entry) => entry.requestId === observation.requestId && entry.redirected,
      );
      if (previous >= 0) requests.splice(previous, 1);
      requests.push({ ...observation, headers, at, redirected });
      if (requests.length > 256) requests.shift();
    },
    fail: (requestId: string) => {
      for (let index = requests.length - 1; index >= 0; index--) {
        if (requests[index]?.requestId === requestId) requests.splice(index, 1);
      }
    },
    redirect: (requestId: string) => {
      for (const request of requests) {
        if (request.requestId === requestId) request.redirected = true;
      }
    },
    observePage: (value: unknown, tabId: number, frameId: number) => {
      prune();
      const parsed = pageRequestHeadersSchema.safeParse(value);
      if (!parsed.success) return;
      const page = parsed.data;
      if (
        page.startedAt > page.completedAt ||
        page.completedAt > now() + 1000 ||
        page.startedAt < now() - ttlMs
      )
        return;
      const candidates = requests.filter(
        (request) =>
          request.tabId === tabId &&
          request.frameId === frameId &&
          request.url === page.url &&
          request.at >= page.startedAt - 100 &&
          request.at <= page.completedAt,
      );
      // Page code has no webRequest ID. Refuse ambiguous concurrent requests to the same URL.
      if (candidates.length !== 1) return;
      const request = candidates[0];
      if (!request || request.redirected) return;
      const names = new Set(request.headers.map((header) => header.name.toLowerCase()));
      const additional = getDownloadHeaders(page.headers).filter(
        (header) => !names.has(header.name.toLowerCase()),
      );
      if (JSON.stringify([...request.headers, ...additional]).length <= 32 * 1024)
        request.headers.push(...additional);
    },
    capture: (capture: Omit<Capture, 'at' | 'manifests'>, urls: string[]) => {
      prune();
      const previous = captures.findIndex(
        (entry) => entry.token === capture.token && entry.incognito === capture.incognito,
      );
      if (previous >= 0) captures.splice(previous, 1);
      captures.push({
        ...capture,
        at: now(),
        manifests: urls.map((url) => ({
          url,
          headers:
            requests.findLast(
              (request) =>
                request.tabId === capture.tabId &&
                request.frameId === capture.frameId &&
                request.url === url,
            )?.headers ?? [],
        })),
      });
      if (captures.length > 100) captures.shift();
    },
    read: (token: string, url: string, incognito: boolean) => {
      prune();
      return (
        captures
          .findLast((entry) => entry.token === token && entry.incognito === incognito)
          ?.manifests.find((manifest) => manifest.url === url)?.headers ?? []
      );
    },
    clear: (tabId?: number, frameId?: number) => {
      for (const entries of [requests, captures]) {
        for (let index = entries.length - 1; index >= 0; index--) {
          const entry = entries[index];
          if (!entry) continue;
          if (
            tabId === undefined ||
            (entry.tabId === tabId && (frameId === undefined || entry.frameId === frameId))
          )
            entries.splice(index, 1);
        }
      }
    },
    expire: () => {
      prune();
      return requests.length > 0 || captures.length > 0;
    },
  };
};
