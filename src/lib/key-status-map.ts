import { fromBuffer, fromHex, parseBufferSource } from './utils';

/** Read-only EME view; byte buffers returned to callers never own the stored KIDs. */
export class KeyStatusMap implements MediaKeyStatusMap {
  #statuses: ReadonlyMap<string, MediaKeyStatus>;

  constructor(statuses: ReadonlyMap<string, MediaKeyStatus>) {
    this.#statuses = statuses;
  }

  get size() {
    return this.#statuses.size;
  }

  get(keyId: BufferSource) {
    return this.#statuses.get(fromBuffer(parseBufferSource(keyId)).toHex());
  }

  has(keyId: BufferSource) {
    return this.#statuses.has(fromBuffer(parseBufferSource(keyId)).toHex());
  }

  *entries(): Generator<[BufferSource, MediaKeyStatus], undefined> {
    for (const [keyId, status] of this.#statuses) {
      yield [Uint8Array.from(fromHex(keyId).toBuffer()).buffer, status];
    }
  }

  *keys(): Generator<BufferSource, undefined> {
    for (const keyId of this.#statuses.keys()) {
      yield Uint8Array.from(fromHex(keyId).toBuffer()).buffer;
    }
  }

  values() {
    return this.#statuses.values();
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  forEach(
    callback: (value: MediaKeyStatus, key: BufferSource, parent: MediaKeyStatusMap) => void,
    thisArg?: unknown,
  ) {
    for (const [keyId, status] of this) {
      callback.call(thisArg, status, keyId, this);
    }
  }
}
