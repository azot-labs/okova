import { isIP } from 'node:net';
import { createMiddleware } from 'hono/factory';
import { cors } from 'hono/cors';
import { config } from './state';

// Validate the authority before comparing Origin, so rebinding cannot supply both.
export const requestBoundary = createMiddleware(async (c, next) => {
  const url = new URL(c.req.url);
  const hostname =
    isIP(config.host) === 6
      ? new URL(`http://[${config.host}]`).hostname
      : config.host.toLowerCase();
  const hosts = config.allowedHosts.length
    ? config.allowedHosts
    : ['127.0.0.1', '[::1]', 'localhost'].includes(hostname)
      ? ['127.0.0.1', '[::1]', 'localhost']
      : [hostname];
  const host = c.req.header('host');
  if (!hosts.includes(url.hostname) || !host || host.toLowerCase() !== url.host) {
    return c.json({ error: 'Host is not allowed' }, 403);
  }
  const origin = c.req.header('origin');
  if (
    config.allowedOrigins !== null &&
    origin !== undefined &&
    origin !== url.origin &&
    !config.allowedOrigins.includes(origin)
  ) {
    return c.json({ error: 'Origin is not allowed' }, 403);
  }
  return cors({
    origin: config.allowedOrigins === null ? '*' : (origin ?? ''),
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'X-Secret-Key'],
  })(c, next);
});

// Attach only to JSON routes; close and delete must not wait for unused uploads.
// Count actual bytes, including chunked bodies, before JSON parsing or device work.
export const requestBody = createMiddleware(async (c, next) => {
  if (!/^application\/json(?:\s*;|$)/i.test(c.req.header('content-type') ?? '')) {
    return c.json({ error: 'Content-Type must be application/json' }, 415);
  }
  const contentEncoding = c.req.header('content-encoding');
  if (contentEncoding && contentEncoding.toLowerCase() !== 'identity') {
    return c.json({ error: 'Content-Encoding is not supported' }, 415);
  }
  const limit = config.maxRequestBodyBytes;
  const length = c.req.header('content-length');
  if (length !== undefined && (!/^\d+$/.test(length) || Number(length) > limit)) {
    return c.json({ error: 'Request body is too large or Content-Length is invalid' }, 413);
  }
  if (c.req.raw.body) {
    const reader = c.req.raw.body.getReader();
    const chunks: Uint8Array[] = [];
    let sizeBytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sizeBytes += value.byteLength;
        if (sizeBytes > limit) {
          void reader.cancel().catch(() => {});
          return c.json({ error: 'Request body is too large' }, 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    c.req.raw = new Request(c.req.raw, { body: Buffer.concat(chunks, sizeBytes) });
  }
  await next();
});
