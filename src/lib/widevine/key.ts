import { fromBuffer } from '../utils';
import { decryptWithAesCbc, importAesCbcKeyForDecrypt } from '../crypto/common';
import { License } from './proto';

export class Key {
  id: string;
  value: string;
  type: string;
  level?: string;
  trackLabel?: string;
  permissions: string[];

  constructor(
    id: string,
    value: string,
    type: string = 'CONTENT',
    level?: string,
    trackLabel?: string,
    permissions: string[] = [],
  ) {
    this.id = id;
    this.value = value;
    this.type = type;
    this.level = level;
    this.trackLabel = trackLabel;
    this.permissions = permissions;
  }

  toString() {
    let message = 'Key: ';
    if (this.id) message += `${this.id}`;
    if (this.value) message += `:${this.value}`;
    if (this.type) message += ` ∙ Type: ${this.type}`;
    if (this.level) message += ` ∙ Level: ${this.level}`;
    if (this.trackLabel) message += ` ∙ Label: ${this.trackLabel}`;
    return message;
  }

  static async fromContainer(
    container: License.IKeyContainer,
    encKey: Uint8Array,
  ) {
    if (!container.key || !container.iv) throw new Error('Key not found');
    const decryptionKey = await importAesCbcKeyForDecrypt(
      encKey as BufferSource,
    );
    const keyValue = await decryptWithAesCbc(
      container.key as BufferSource,
      decryptionKey,
      container.iv as BufferSource,
    );
    const id = container.id ? fromBuffer(container.id).toHex() : 'UNKNOWN';
    const value = fromBuffer(keyValue).toHex();
    const type = License.KeyContainer.KeyType[container.type!];
    return new Key(
      id,
      value,
      type,
      String(container.level),
      container.trackLabel as string,
      container.operatorSessionKeyPermissions as string[],
    );
  }
}
