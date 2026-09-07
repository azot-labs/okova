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

  if (!['cenc', 'cens', 'cbcs'].includes(packet.scheme)) {
    throw new Error(`Unsupported encryption scheme ${packet.scheme}.`);
  }

  const iv = normalizeCounterBlock(packet.iv);
  const subsamples = packet.subsamples?.length
    ? packet.subsamples
    : [{ clearLen: 0, protectedLen: packet.data.byteLength }];
  let packetOffset = 0;
  for (const { clearLen, protectedLen } of subsamples) {
    if (
      !Number.isSafeInteger(clearLen) ||
      clearLen < 0 ||
      !Number.isSafeInteger(protectedLen) ||
      protectedLen < 0
    ) {
      throw new Error('Subsample lengths must be non-negative safe integers.');
    }
    packetOffset += clearLen + protectedLen;
    if (packetOffset > packet.data.byteLength) {
      throw new Error('Subsamples exceed packet length.');
    }
  }
  if (packetOffset !== packet.data.byteLength) {
    throw new Error('Subsamples must cover the entire packet.');
  }

  const pattern = packet.scheme === 'cenc' ? null : packet.pattern;
  if (pattern) {
    for (const blocks of [pattern.cryptByteBlock, pattern.skipByteBlock]) {
      if (!Number.isInteger(blocks) || blocks < 0 || blocks > 15) {
        throw new Error('Pattern block counts must be integers between 0 and 15.');
      }
    }
  }
  const hasPattern =
    pattern !== null && (pattern.cryptByteBlock !== 0 || pattern.skipByteBlock !== 0);
  const cryptBytes = hasPattern ? pattern.cryptByteBlock * AES_BLOCK_SIZE : 0;
  const skipBytes = hasPattern ? pattern.skipByteBlock * AES_BLOCK_SIZE : 0;
  const output = new Uint8Array(packet.data);
  let ranges: { offset: number; length: number }[] = [];

  // Gather only encrypted bytes so skipped bytes never consume cipher state.
  const decryptRanges = () => {
    const length = ranges.reduce((total, range) => total + range.length, 0);
    if (length === 0) return;
    const encrypted = new Uint8Array(length);
    let offset = 0;
    for (const range of ranges) {
      encrypted.set(packet.data.subarray(range.offset, range.offset + range.length), offset);
      offset += range.length;
    }
    const cipher =
      packet.scheme === 'cbcs' ? cbc(keyBytes, iv, { disablePadding: true }) : ctr(keyBytes, iv);
    const decrypted = cipher.decrypt(encrypted);
    offset = 0;
    for (const range of ranges) {
      output.set(decrypted.subarray(offset, offset + range.length), range.offset);
      offset += range.length;
    }
  };

  packetOffset = 0;
  for (const { clearLen, protectedLen } of subsamples) {
    packetOffset += clearLen;
    const encryptedLength =
      packet.scheme === 'cenc'
        ? protectedLen
        : Math.floor(protectedLen / AES_BLOCK_SIZE) * AES_BLOCK_SIZE;
    if (!hasPattern) {
      ranges.push({ offset: packetOffset, length: encryptedLength });
    } else if (cryptBytes > 0) {
      // Each subsample starts a new pattern, including after a partial block.
      for (let offset = 0; offset < encryptedLength; offset += cryptBytes + skipBytes) {
        ranges.push({
          offset: packetOffset + offset,
          length: Math.min(cryptBytes, encryptedLength - offset),
        });
      }
    }
    packetOffset += protectedLen;
    if (packet.scheme === 'cbcs') {
      // CBCS restarts chaining with the packet IV for each subsample.
      decryptRanges();
      ranges = [];
    }
  }
  if (packet.scheme !== 'cbcs') decryptRanges();
  return output;
};

export const decryptPacketWithKeys = async (
  packet: EncryptedPacket,
  keys: MediaKeysMap,
  keyStatuses: Map<string, MediaKeyStatus>,
) => {
  const key = findUsableKey(packet.keyId, keys, keyStatuses);
  return decryptPacketWithKey(packet, key);
};
