import { KEYUTIL } from 'jsrsasign';
import { p256 } from '@noble/curves/nist';
import * as utils from '@noble/curves/utils';
import {
  fromBase64,
  fromBuffer,
  toBufferSource,
  type BytesLike,
} from '../utils';
import { ElGamal } from './elgamal';

export const toPKCS8 = (pkcs1pem: string) => {
  const keyobj = KEYUTIL.getKey(pkcs1pem);
  const pkcs8pem = KEYUTIL.getPEM(keyobj, 'PKCS8PRV');
  return pkcs8pem;
};

export const toPKCS1 = (pkcs8pem: string) => {
  const keyobj = KEYUTIL.getKey(pkcs8pem);
  const pkcs1pem = KEYUTIL.getPEM(keyobj, 'PKCS1PRV');
  return pkcs1pem;
};

export const parseSpkiFromCertificateKey = (publicKey: Uint8Array) => {
  const publicKeyDerHex = fromBuffer(publicKey).toHex();
  const keyResult = KEYUTIL.parsePublicRawRSAKeyHex(publicKeyDerHex);
  const key = KEYUTIL.getKey(keyResult);
  const pem = KEYUTIL.getPEM(key);
  const header = '-----BEGIN PUBLIC KEY-----';
  const footer = '-----END PUBLIC KEY-----';
  const body = pem.substring(header.length, pem.length - footer.length - 2);
  return fromBase64(body).toBuffer();
};

export const importSpkiKeyForEncrypt = async (keyData: BytesLike) => {
  return crypto.subtle.importKey(
    'spki',
    toBufferSource(keyData),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-1',
    },
    true,
    ['encrypt'],
  );
};

export const importSpkiKeyForVerify = async (keyData: BytesLike) => {
  return crypto.subtle.importKey(
    'spki',
    toBufferSource(keyData),
    {
      name: 'RSA-PSS',
      hash: 'SHA-1',
    },
    true,
    ['verify'],
  );
};

export const getRandomHex = (size = 16) => {
  const result = [];
  const hexRef = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
  ];
  for (let n = 0; n < size; n++)
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  return result.join('').toUpperCase();
};

export const getRandomBytes = (size = 16) => {
  return new Uint8Array(crypto.getRandomValues(new Uint8Array(size)));
};

export const getRandomInt = (start: number, end: number) => {
  // TODO: Use start value
  return Math.floor(Math.random() * end);
};

export const generateAesCbcKey = async (length = 128) =>
  crypto.subtle.generateKey({ name: 'AES-CBC', length }, true, ['encrypt']);

export const importAesCbcKeyForEncrypt = async (keyData: BytesLike) => {
  return crypto.subtle.importKey(
    'raw',
    toBufferSource(keyData),
    'AES-CBC',
    false,
    ['encrypt'],
  );
};

export const importAesCbcKeyForDecrypt = async (keyData: BytesLike) =>
  crypto.subtle.importKey(
    'raw',
    toBufferSource(keyData),
    { name: 'AES-CBC' },
    false,
    ['decrypt'],
  );

export const encryptWithAesCbc = async (
  data: BytesLike,
  key: CryptoKey,
  iv: BytesLike,
) => {
  const result = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: toBufferSource(iv) },
    key,
    toBufferSource(data),
  );
  return new Uint8Array(result);
};

export const decryptWithAesCbc = async (
  data: BytesLike,
  key: CryptoKey,
  iv: BytesLike,
) => {
  const result = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: toBufferSource(iv) },
    key,
    toBufferSource(data),
  );
  return new Uint8Array(result);
};

export const encryptWithRsaOaep = async (data: BytesLike, key: CryptoKey) => {
  const result = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    key,
    toBufferSource(data),
  );
  return new Uint8Array(result);
};

export const exportKey = (key: CryptoKey) =>
  crypto.subtle.exportKey('raw', key).then((value) => new Uint8Array(value));

export const importAesCtrKey = async (keyData: BytesLike) => {
  return crypto.subtle.importKey(
    'raw',
    toBufferSource(keyData),
    { name: 'AES-CTR' },
    true,
    ['decrypt'],
  );
};

export const decryptWithAesCtr = async (
  data: BytesLike,
  key: CryptoKey,
  iv: BytesLike,
) => {
  const result = await crypto.subtle.decrypt(
    { name: 'AES-CTR', counter: toBufferSource(iv) },
    key,
    toBufferSource(data),
  );
  return new Uint8Array(result);
};

export const createHmacSha256 = async (key: BytesLike, data: BytesLike) => {
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    toBufferSource(key),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    toBufferSource(data),
  );
  return new Uint8Array(signature);
};

export const createSha256 = async (data: BytesLike) => {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    toBufferSource(data),
  );
  const hashArray = new Uint8Array(hashBuffer);
  return hashArray;
};

export const ecc256Verify = async (
  publicKey: Uint8Array,
  data: Uint8Array,
  signature: Uint8Array,
) => {
  return p256.verify(signature, await createSha256(data), publicKey);
};

export const ecc256Sign = async (
  private_key: bigint | string | Uint8Array,
  data: Uint8Array,
) => {
  return p256.sign(await createSha256(data), private_key);
};

export const ecc256decrypt = (private_key: bigint, ciphertext: Uint8Array) => {
  const decrypted = ElGamal.decrypt(
    {
      point1: {
        x: utils.bytesToNumberBE(ciphertext.subarray(0, 32)),
        y: utils.bytesToNumberBE(ciphertext.subarray(32, 64)),
      },
      point2: {
        x: utils.bytesToNumberBE(ciphertext.subarray(64, 96)),
        y: utils.bytesToNumberBE(ciphertext.subarray(96, 128)),
      },
    },
    private_key,
  );

  return utils.numberToBytesBE(decrypted.x, 32);
};

export const aesEcbEncrypt = async (key: BytesLike, data: BytesLike) => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    toBufferSource(key),
    'AES-ECB',
    true,
    ['encrypt', 'decrypt'],
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-ECB' },
    cryptoKey,
    toBufferSource(data),
  );

  return new Uint8Array(encryptedBuffer);
};
