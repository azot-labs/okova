import * as protobufjs from 'protobufjs/minimal.js';

/*
 * Keep Widevine protobuf writes on protobufjs' plain Writer implementation.
 *
 * protobufjs/minimal is published as CommonJS. In Node ESM, `import * as protobufjs` exposes
 * the CJS module under `default`, while bundled/browser-like builds can expose the same API
 * directly on the namespace object. Resolve that shape once here so callers do not have to care
 * which loader/bundler produced the module object.
 *
 * More importantly, do not call generated `Message.encode(message).finish()` without passing a
 * writer. protobufjs then creates its default writer with `$Writer.create()`. When a Buffer global
 * is detected, that can be a BufferWriter. Cloudflare Workers' Node compatibility Buffer polyfill
 * currently fails on several Widevine protobuf byte/string fields with out-of-range writes such as
 * "length must be <= 396, received 1871". The message data is valid; the failure is in the writer
 * chosen for re-encoding.
 *
 * Passing `new Writer()` forces the portable Uint8Array-backed writer path. Use this helper for
 * every Widevine protobuf encode that runs at runtime, including exact decode validation,
 * license-request creation, signed-message creation, service-certificate serialization, and PSSH
 * normalization.
 */
const runtimeProtobuf = (
  (protobufjs as unknown as { default?: typeof protobufjs }).default ?? protobufjs
) as typeof protobufjs;

export type ProtobufWriter = protobufjs.Writer;

export const createProtoWriter = () => new runtimeProtobuf.Writer();
