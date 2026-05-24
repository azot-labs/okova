import { cbc, ctr } from '@noble/ciphers/aes.js';
import type { MediaKeysMap } from './api';
import { fromHex } from './utils';

export type PsshBox = unknown;

export type EncryptionScheme = 'cenc' | 'cens' | 'cbcs';

export type SubsampleEncryption = {
  clearLen: number;
  protectedLen: number;
};

export type EncryptionPattern = {
  cryptByteBlock: number;
  skipByteBlock: number;
};

export type EncryptedPacket = {
  data: Uint8Array;
  keyId: string;
  psshBoxes: PsshBox[];
  scheme: EncryptionScheme;
  iv: Uint8Array;
  timestamp: number;
  subsamples: SubsampleEncryption[] | null;
  pattern: EncryptionPattern | null;
};

const AES_BLOCK_SIZE = 16;

const normalizeCounterBlock = (iv: Uint8Array) => {
  if (iv.byteLength === AES_BLOCK_SIZE) {
    return iv.slice();
  }

  if (iv.byteLength === 8) {
    const counterBlock = new Uint8Array(AES_BLOCK_SIZE);
    counterBlock.set(iv, 0);
    return counterBlock;
  }

  throw new Error(`Unsupported IV length ${iv.byteLength}. Expected 8 or 16 bytes.`);
};

const normalizeCbcIv = (iv: Uint8Array) => {
  if (iv.byteLength === AES_BLOCK_SIZE) {
    return iv.slice();
  }

  if (iv.byteLength === 8) {
    const cbcIv = new Uint8Array(AES_BLOCK_SIZE);
    cbcIv.set(iv, 0);
    return cbcIv;
  }

  throw new Error(`Unsupported IV length ${iv.byteLength}. Expected 8 or 16 bytes.`);
};

const normalizeKeyId = (keyId: string) => keyId.toLowerCase();

const getKeyCandidates = (keyId: string) => {
  const normalizedKeyId = normalizeKeyId(keyId);
  return normalizedKeyId === keyId ? [keyId] : [keyId, normalizedKeyId];
};

const findUsableKey = (
  keyId: string,
  keys: MediaKeysMap,
  keyStatuses: Map<string, MediaKeyStatus>,
) => {
  for (const candidate of getKeyCandidates(keyId)) {
    const key = keys.get(candidate);
    if (!key) {
      continue;
    }

    const keyStatus = keyStatuses.get(candidate);
    if (keyStatus && keyStatus !== 'usable') {
      throw new Error(`Key ${candidate} is not usable: ${keyStatus}`);
    }

    return key;
  }

  throw new Error(`No content key found for key ID ${keyId}`);
};

export const decryptPacketWithKey = async (packet: EncryptedPacket, keyHex: string) => {
  const keyBytes = fromHex(keyHex).toBuffer();
  return decryptPacketWithKeyBytes(packet, keyBytes);
};

export const decryptPacketWithKeyBytes = async (packet: EncryptedPacket, keyBytes: Uint8Array) => {
  if (![16, 24, 32].includes(keyBytes.byteLength)) {
    throw new Error(
      `Unsupported AES key length ${keyBytes.byteLength}. Expected 16, 24, or 32 bytes.`,
    );
  }

  if (packet.scheme === 'cbcs') {
    if (packet.data.byteLength % AES_BLOCK_SIZE !== 0) {
      throw new Error('CBCS encrypted packet length must be a multiple of 16 bytes.');
    }

    const cipher = cbc(keyBytes, normalizeCbcIv(packet.iv), { disablePadding: true });
    return cipher.decrypt(packet.data);
  }

  const cipher = ctr(keyBytes, normalizeCounterBlock(packet.iv));
  return cipher.decrypt(packet.data);
};

export const decryptPacketWithKeys = async (
  packet: EncryptedPacket,
  keys: MediaKeysMap,
  keyStatuses: Map<string, MediaKeyStatus>,
) => {
  const key = findUsableKey(packet.keyId, keys, keyStatuses);
  return decryptPacketWithKey(packet, key);
};
