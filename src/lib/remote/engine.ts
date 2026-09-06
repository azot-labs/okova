import { z } from 'zod';
import { sha256 } from '@noble/hashes/sha2.js';
import { BaseMediaKeysEngine, BaseMediaKeysEngineSession } from '../api';
import { fromBase64, fromBuffer } from '../utils';
import { parseCertificate, verifyCertificate } from '../widevine/certificate';
import { normalizeKeySystem } from '../key-system';
import { createRemoteHeaders, remoteUrlSchema } from './http';
import { createOkovaApi, keysSchema, type OkovaRemoteParams, type RemoteApi } from './protocol';
import { createPywidevineApi, type PywidevineRemoteParams } from './pywidevine';
export type RemoteParams = OkovaRemoteParams | PywidevineRemoteParams;

const stateSchema = z.object({
  version: z.literal(1),
  protocol: z.enum(['okova', 'pywidevine', 'pyplayready']),
  keySystem: z.string(),
  connection: z.string(),
  sessionId: z.string().min(1),
  sessionType: z.enum(['temporary', 'persistent-license']),
  initData: z.base64().optional(),
  initDataType: z.string(),
  serverCertificate: z.base64().optional(),
  serviceCertificate: z.base64().optional(),
  keys: keysSchema,
});

class RemoteSession extends BaseMediaKeysEngineSession {
  #api: RemoteApi;
  #engine: Remote;
  #initData?: string;
  #initDataType = 'cenc';
  #serviceCertificate?: string;
  #closePromise: Promise<void> | null = null;
  #removeRequested = false;

  constructor(
    sessionId: string,
    sessionType: MediaKeySessionType,
    engine: Remote,
    api: RemoteApi,
    state?: z.infer<typeof stateSchema>,
  ) {
    super(sessionType, sessionId);
    this.#api = api;
    this.#engine = engine;
    if (state) {
      this.#initData = state.initData;
      this.#initDataType = state.initDataType;
      this.#serviceCertificate = state.serviceCertificate;
      this.#syncKeys(state.keys);
    }
  }

  protected override assertOpen() {
    super.assertOpen();
    if (this.#closePromise) throw new Error('Session is closing');
  }

  async generateRequest(initData: Uint8Array, initDataType = 'cenc') {
    this.assertOpen();
    const serverCertificate = this.#serviceCertificate ?? this.#engine.serverCertificate;
    const encoded = fromBuffer(initData).toBase64();
    const data = await this.#api.generate(this.sessionId, {
      initDataType,
      serverCertificate,
      initData: encoded,
    });
    this.assertOpen();
    if (serverCertificate !== undefined && data.serverCertificateAccepted !== true) {
      throw new Error(
        'Remote server did not acknowledge the server certificate; privacy mode may be unsupported',
      );
    }
    this.#initData = encoded;
    this.#initDataType = initDataType;
    this.emitMessage({
      message: fromBase64(data.message).toBuffer(),
      messageType: data.messageType,
    });
  }

  async update(response: Uint8Array) {
    this.assertOpen();
    // Adapters with separate certificate endpoints regenerate the pending challenge.
    if (this.#api.isServiceCertificate?.(response)) {
      if (!this.#initData)
        throw new Error('Generate a request before updating the service certificate');
      await validateCertificate(response);
      this.#serviceCertificate = fromBuffer(response).toBase64();
      await this.generateRequest(fromBase64(this.#initData).toBuffer(), this.#initDataType);
      return;
    }
    const data = await this.#api.update(this.sessionId, fromBuffer(response).toBase64());
    this.assertOpen();
    if ('message' in data) {
      this.emitMessage({
        message: fromBase64(data.message).toBuffer(),
        messageType: data.messageType,
      });
      return;
    }
    this.#syncKeys(data.keys);
    this.emitKeysChange();
    this.emitKeyStatusesChange();
  }

  close() {
    return this.#close(false);
  }
  remove() {
    return this.#close(true);
  }

  async #close(remove: boolean) {
    if (this.isClosed) return;
    this.#removeRequested ||= remove;
    // Both routes release the server session; concurrent calls share that cleanup.
    if (!this.#closePromise) {
      this.#closePromise = this.#api
        .close(this.sessionId, remove)
        .then(() => {
          this.isClosed = true;
          this.keys.clear();
          this.keyStatuses.clear();
          this.#engine.sessions.delete(this.sessionId);
          this.dispatchEvent(new Event('closed'));
          if (this.#removeRequested) this.dispatchEvent(new Event('removed'));
        })
        .catch((error: unknown) => {
          this.#closePromise = null;
          this.#removeRequested = false;
          throw error;
        });
    }
    return this.#closePromise;
  }

  // The server retains cryptographic state; resuming only reattaches its session ID.
  pause() {
    this.assertOpen();
    return JSON.stringify({
      version: 1,
      protocol: this.#engine.protocol,
      keySystem: this.#engine.keySystem,
      connection: this.#engine.connection,
      sessionId: this.sessionId,
      sessionType: this.sessionType,
      initData: this.#initData,
      initDataType: this.#initDataType,
      serverCertificate: this.#engine.serverCertificate,
      serviceCertificate: this.#serviceCertificate,
      keys: Object.fromEntries(this.keys),
    } satisfies z.infer<typeof stateSchema>);
  }

  #syncKeys(keys: z.infer<typeof keysSchema>) {
    this.keys.clear();
    this.keyStatuses.clear();
    for (const [keyId, key] of Object.entries(keys)) {
      this.keys.set(keyId.toLowerCase(), key.toLowerCase());
      this.keyStatuses.set(keyId.toLowerCase(), 'usable');
    }
  }
}

const validateCertificate = async (certificate: Uint8Array) => {
  const { signedDrmCertificate } = await parseCertificate(certificate);
  if (!(await verifyCertificate(signedDrmCertificate)))
    throw new Error('Certificate invalid: signature mismatch');
};

export class Remote extends BaseMediaKeysEngine {
  readonly keySystem: string;
  readonly connection: string;
  readonly protocol: 'okova' | 'pywidevine' | 'pyplayready';
  readonly sessions = new Map<string, RemoteSession>();
  #api: RemoteApi;
  #serverCertificate?: string;

  constructor(params: RemoteParams) {
    super();
    this.keySystem = normalizeKeySystem(params.keySystem);
    this.protocol = params.protocol ?? 'okova';
    // Headers iterates normalized names in sorted order, including secret overrides.
    // Store only a digest because custom headers may contain authentication tokens.
    const authentication = sha256(
      new TextEncoder().encode(JSON.stringify([...createRemoteHeaders(params)])),
    );
    this.connection = JSON.stringify([
      remoteUrlSchema.parse(params.baseUrl),
      'device' in params ? params.device : (params.client ?? null),
      fromBuffer(authentication).toHex(),
    ]);
    this.#api =
      params.protocol === 'pywidevine' || params.protocol === 'pyplayready'
        ? createPywidevineApi({ ...params, keySystem: this.keySystem })
        : createOkovaApi({ ...params, protocol: 'okova', keySystem: this.keySystem });
  }

  get serverCertificate() {
    return this.#serverCertificate;
  }

  async setServerCertificate(serverCertificate: Uint8Array): Promise<boolean> {
    if (this.keySystem !== 'com.widevine.alpha')
      throw new Error(`Server certificates are unsupported for ${this.keySystem}`);
    const certificate = new Uint8Array(serverCertificate);
    await validateCertificate(certificate);
    this.#serverCertificate = fromBuffer(certificate).toBase64();
    return true;
  }

  async createSession(sessionType: MediaKeySessionType = 'temporary') {
    const id = await this.#api.open(sessionType);
    const session = new RemoteSession(id, sessionType, this, this.#api);
    this.sessions.set(id, session);
    return session;
  }

  resumeSession(serialized: string) {
    const state = stateSchema.parse(JSON.parse(serialized));
    if (
      state.protocol !== this.protocol ||
      state.keySystem !== this.keySystem ||
      state.connection !== this.connection
    )
      throw new Error(
        'Remote session belongs to a different server, device, protocol, DRM system, or authentication',
      );
    if (this.sessions.has(state.sessionId)) throw new Error('Remote session is already attached');
    // Keep a newer engine certificate and preserve per-session overrides separately.
    this.#serverCertificate ??= state.serverCertificate;
    const session = new RemoteSession(state.sessionId, state.sessionType, this, this.#api, state);
    this.sessions.set(session.sessionId, session);
    return session;
  }
}
