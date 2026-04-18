import { bitShiftLeftBuffer } from '../buffer';
import { toBytes, type Bytes, type BytesLike } from '../utils';
import { encryptWithAesCbc, importAesCbcKeyForEncrypt } from './common';

const xorBuffer = (a: BytesLike, b: BytesLike): Bytes => {
  const left = toBytes(a);
  const right = toBytes(b);
  const result = new Uint8Array(left.length);
  for (let i = 0; i < left.length; i++) {
    result[i] = left[i] ^ right[i];
  }
  return result;
};

const hexToBytes = (hex: string): Bytes => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

const const_Zero = new Uint8Array(16);
const const_Rb = hexToBytes('00000000000000000000000000000087');
const const_blockSize = 16;

const generateSubkeys = async (key: CryptoKey) => {
  const l = await aes(key, const_Zero);

  let subkey1 = bitShiftLeftBuffer(l);
  if (l[0] & 0x80) {
    subkey1 = xorBuffer(subkey1, const_Rb);
  }

  let subkey2 = bitShiftLeftBuffer(subkey1);
  if (subkey1[0] & 0x80) {
    subkey2 = xorBuffer(subkey2, const_Rb);
  }

  return { subkey1, subkey2 };
};

const getMessageBlock = (message: BytesLike, blockIndex: number): Bytes => {
  const bytes = toBytes(message);
  const start = blockIndex * const_blockSize;
  const end = start + const_blockSize;
  return new Uint8Array(bytes.slice(start, end));
};

const getPaddedMessageBlock = (
  message: BytesLike,
  blockIndex: number,
): Bytes => {
  const bytes = toBytes(message);
  const block = new Uint8Array(const_blockSize);
  const start = blockIndex * const_blockSize;
  const end = bytes.length;
  block.set(bytes.slice(start, end), 0);
  block[end - start] = 0x80;
  return block;
};

const aes = async (key: CryptoKey, message: BytesLike): Promise<Bytes> => {
  const aesCipher = await encryptWithAesCbc(message, key, const_Zero);
  return new Uint8Array(aesCipher.slice(0, 16));
};

type KeyLength = 16 | 24 | 32;

const aesCmac = async (
  keyData: BytesLike,
  message: BytesLike,
): Promise<Bytes> => {
  const keyBytes = toBytes(keyData);
  const messageBytes = toBytes(message);
  const keyLengthToCipher: { [key in KeyLength]: string } = {
    16: 'aes-128-cbc',
    24: 'aes-192-cbc',
    32: 'aes-256-cbc',
  };

  if (!keyLengthToCipher[keyBytes.length as KeyLength]) {
    throw new Error('Keys must be 128, 192, or 256 bits in length.');
  }

  const key = await importAesCbcKeyForEncrypt(keyBytes);
  const subkeys = await generateSubkeys(key);
  let blockCount = Math.ceil(messageBytes.length / const_blockSize);
  let lastBlockCompleteFlag: boolean;
  let lastBlock: Bytes;

  if (blockCount === 0) {
    blockCount = 1;
    lastBlockCompleteFlag = false;
  } else {
    lastBlockCompleteFlag = messageBytes.length % const_blockSize === 0;
  }

  const lastBlockIndex = blockCount - 1;

  if (lastBlockCompleteFlag) {
    lastBlock = xorBuffer(
      getMessageBlock(messageBytes, lastBlockIndex),
      subkeys.subkey1,
    );
  } else {
    lastBlock = xorBuffer(
      getPaddedMessageBlock(messageBytes, lastBlockIndex),
      subkeys.subkey2,
    );
  }

  let x: Bytes = new Uint8Array(16);
  let y: Bytes;

  for (let index = 0; index < lastBlockIndex; index++) {
    y = xorBuffer(x, getMessageBlock(messageBytes, index));
    x = await aes(key, y);
  }
  y = xorBuffer(lastBlock, x);
  return aes(key, y);
};

export { aesCmac };
