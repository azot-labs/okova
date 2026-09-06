import { fromBuffer } from '@okova/lib/utils';
import { Remote } from '@okova/lib/remote/engine';
import { parseRemoteConfig, type RemoteConfig } from '@okova/lib/remote/config';

/** A stored remote connection, not a device provision or an open server session. */
export class RemoteClient {
  private constructor(
    readonly config: RemoteConfig,
    readonly filename: string,
  ) {}

  static async from(value: unknown) {
    const config = parseRemoteConfig(value);
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(config)),
    );
    return new RemoteClient(config, `remote-${fromBuffer(new Uint8Array(digest)).toHex()}.json`);
  }

  get label() {
    return (
      this.config.label ??
      `${this.device ?? 'Default client'} @ ${new URL(this.config.baseUrl).host}`
    );
  }
  get device() {
    return this.config.protocol === 'okova' ? this.config.client : this.config.device;
  }
  get protocolLabel() {
    return this.config.protocol === 'okova' ? 'Okova' : this.config.protocol;
  }
  get keySystem() {
    return this.config.keySystem;
  }
  getName() {
    return this.label;
  }
  async pack() {
    return new TextEncoder().encode(JSON.stringify(this.config, null, 2) + '\n');
  }
  createEngine() {
    // Leave time for multi-request operations inside the extension's 25s deadline.
    return new Remote({
      ...this.config,
      requestTimeoutMs: Math.min(this.config.requestTimeoutMs ?? 7_000, 7_000),
    });
  }
}
