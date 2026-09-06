import { z } from 'zod';

export const remoteUrlSchema = z
  .url()
  .superRefine((value, context) => {
    const url = new URL(value);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Use an HTTP(S) server URL without credentials, query, or fragment',
      });
    }
  })
  .transform((value) => value.replace(/\/+$/, ''));

export const requestTimeoutSchema = z.number().int().positive().max(2_147_483_647);

export type RemoteHttpParams = {
  baseUrl: string;
  secret?: string;
  headers?: Record<string, string>;
  requestTimeoutMs?: number;
};

const errorBody = z.object({
  error: z.unknown().optional(),
  message: z.string().optional(),
});

export const createHttpClient = (params: RemoteHttpParams) => {
  const baseUrl = remoteUrlSchema.parse(params.baseUrl);
  const timeoutMs = requestTimeoutSchema.parse(params.requestTimeoutMs ?? 30_000);
  const headers = new Headers(params.headers);
  headers.set('content-type', 'application/json');
  if (params.secret) headers.set('x-secret-key', params.secret);

  const request = async (method: string, route: string, body?: object): Promise<unknown> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}${route}`, {
        method,
        headers,
        signal: controller.signal,
        // Redirects must not forward the API secret to another endpoint.
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store',
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const text = await response.text();
      let data: unknown;
      try {
        data = text.trim() ? JSON.parse(text) : undefined;
      } catch {
        throw new Error(`Remote CDM returned invalid JSON (HTTP ${response.status})`);
      }
      const parsed = errorBody.safeParse(data);
      const failure = parsed.success ? parsed.data : undefined;
      if (!response.ok || failure?.error) {
        const details = failure?.error
          ? typeof failure.error === 'string'
            ? failure.error
            : JSON.stringify(failure.error)
          : failure?.message;
        throw new Error(
          `${response.status} ${response.statusText}${details ? `: ${details}` : ''}`.trim(),
        );
      }
      return data;
    } catch (error) {
      if (controller.signal.aborted)
        throw new Error(`Remote CDM request timed out after ${timeoutMs}ms`, { cause: error });
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };
  return {
    get: (route: string) => request('GET', route),
    post: (route: string, body?: object) => request('POST', route, body),
    delete: (route: string) => request('DELETE', route),
  };
};
