import { fromBase64, fromBuffer } from '../utils';
import { decryptWithAesCbc, importAesCbcKeyForDecrypt } from '../crypto/common';
import { License } from './proto';

const ZERO_KEY_ID = new Uint8Array(16);

const decimalStringToBytes = (value: string) => {
  let remaining = BigInt(value);
  const bytes = new Uint8Array(16);
  for (let index = 15; index >= 0; index--) {
    bytes[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return bytes;
};

const normalizeKeyId = (kid?: Uint8Array | string | null) => {
  let bytes =
    typeof kid === 'string' ? fromBase64(kid).toBuffer() : kid ? new Uint8Array(kid) : ZERO_KEY_ID;
  if (!bytes.length) bytes = ZERO_KEY_ID;

  const text = fromBuffer(bytes).toText();
  if (/^\d+$/.test(text)) {
    return fromBuffer(decimalStringToBytes(text)).toHex();
  }

  if (bytes.length === 32 && /^[0-9a-f]+$/i.test(text)) {
    return text.toLowerCase();
  }

  if (bytes.length < 16) {
    const padded = new Uint8Array(16);
    padded.set(bytes);
    bytes = padded;
  }

  return fromBuffer(bytes.subarray(0, 16)).toHex();
};

const getPermissions = (container: License.IKeyContainer) => {
  if (container.type !== License.KeyContainer.KeyType.OPERATOR_SESSION) return [];
  const permissions = container.operatorSessionKeyPermissions;
  if (!permissions) return [];

  return Object.entries(permissions)
    .filter(([, value]) => value === true)
    .map(([name]) => name);
};

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

  static async fromContainer(container: License.IKeyContainer, encKey: Uint8Array) {
    if (!container.key || !container.iv) throw new Error('Key not found');
    const decryptionKey = await importAesCbcKeyForDecrypt(encKey as BufferSource);
    const keyValue = await decryptWithAesCbc(
      container.key as BufferSource,
      decryptionKey,
      container.iv as BufferSource,
    );
    const id = normalizeKeyId(container.id);
    const value = fromBuffer(keyValue).toHex();
    const type = License.KeyContainer.KeyType[container.type!];
    return new Key(
      id,
      value,
      type,
      String(container.level),
      container.trackLabel as string,
      getPermissions(container),
    );
  }
}
