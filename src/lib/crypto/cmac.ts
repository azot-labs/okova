import { bitShiftLeftBuffer } from '../buffer';
import { encryptWithAesCbc, importAesCbcKeyForEncrypt } from './common';

const xorBuffer = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
};

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

const const_Zero = new Uint8Array(16);
const const_Rb = new Uint8Array(hexToBytes('00000000000000000000000000000087'));
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

const getMessageBlock = (
  message: Uint8Array,
  blockIndex: number,
): Uint8Array => {
  const start = blockIndex * const_blockSize;
  const end = start + const_blockSize;
  return message.slice(start, end);
};

const getPaddedMessageBlock = (
  message: Uint8Array,
  blockIndex: number,
): Uint8Array => {
  const block = new Uint8Array(const_blockSize);
  const start = blockIndex * const_blockSize;
  const end = message.length;
  block.set(message.slice(start, end), 0);
  block[end - start] = 0x80;
  return block;
};

const aes = async (
  key: CryptoKey,
  message: Uint8Array,
): Promise<Uint8Array> => {
  const aesCipher = await encryptWithAesCbc(message, key, const_Zero);
  return aesCipher.slice(0, 16);
};

type KeyLength = 16 | 24 | 32;

const aesCmac = async (
  keyData: Uint8Array,
  message: Uint8Array,
): Promise<Uint8Array> => {
  const keyLengthToCipher: { [key in KeyLength]: string } = {
    16: 'aes-128-cbc',
    24: 'aes-192-cbc',
    32: 'aes-256-cbc',
  };

  if (!keyLengthToCipher[keyData.length as KeyLength]) {
    throw new Error('Keys must be 128, 192, or 256 bits in length.');
  }

  const key = await importAesCbcKeyForEncrypt(keyData);
  const subkeys = await generateSubkeys(key);
  let blockCount = Math.ceil(message.length / const_blockSize);
  let lastBlockCompleteFlag: boolean;
  let lastBlock: Uint8Array;

  if (blockCount === 0) {
    blockCount = 1;
    lastBlockCompleteFlag = false;
  } else {
    lastBlockCompleteFlag = message.length % const_blockSize === 0;
  }

  const lastBlockIndex = blockCount - 1;

  if (lastBlockCompleteFlag) {
    lastBlock = xorBuffer(
      getMessageBlock(message, lastBlockIndex),
      subkeys.subkey1,
    );
  } else {
    lastBlock = xorBuffer(
      getPaddedMessageBlock(message, lastBlockIndex),
      subkeys.subkey2,
    );
  }

  let x = new Uint8Array(16);
  let y: Uint8Array;

  for (let index = 0; index < lastBlockIndex; index++) {
    y = xorBuffer(x, getMessageBlock(message, index));
    x = await aes(key, y);
  }
  y = xorBuffer(lastBlock, x);
  return aes(key, y);
};

export { aesCmac };
