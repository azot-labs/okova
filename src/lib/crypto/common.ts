import { unsafe as nobleAesUnsafe } from '@noble/ciphers/aes.js';
import { p256 } from '@noble/curves/nist.js';
import type { ECDSASignature } from '@noble/curves/abstract/weierstrass.js';
import * as utils from '@noble/curves/utils.js';
import { AsnConvert } from '@peculiar/asn1-schema';
import { PrivateKey, PrivateKeyInfo } from '@peculiar/asn1-pkcs8';
import { rsaEncryption, RSAPrivateKey, RSAPublicKey } from '@peculiar/asn1-rsa';
import { SubjectPublicKeyInfo } from '@peculiar/asn1-x509';
import { fromBase64, fromBuffer, toBufferSource, toBytes, type BytesLike } from '../utils';
import { ElGamal } from './elgamal';

const pemToDer = (pem: string, label: string) => {
  const normalizedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = pem.match(
    new RegExp(
      `-----BEGIN ${normalizedLabel}-----\\s*([A-Za-z0-9+/=\\r\\n]+?)\\s*-----END ${normalizedLabel}-----`,
    ),
  );

  if (!match?.[1]) {
    throw new Error(`Invalid ${label} PEM`);
  }

  return fromBase64(match[1].replace(/\s+/g, '')).toBuffer();
};

const derToPem = (der: Uint8Array, label: string) => {
  const body = fromBuffer(der)
    .toBase64()
    .match(/.{1,64}/g)
    ?.join('\n');

  if (!body) {
    throw new Error(`Invalid ${label} DER`);
  }

  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----\n`;
};

export const toPKCS8 = async (pkcs1pem: string) => {
  const pkcs1Der = pemToDer(pkcs1pem, 'RSA PRIVATE KEY');
  AsnConvert.parse(pkcs1Der, RSAPrivateKey);
  const privateKeyInfo = new PrivateKeyInfo({
    privateKeyAlgorithm: rsaEncryption,
    privateKey: new PrivateKey(pkcs1Der),
  });
  return derToPem(new Uint8Array(AsnConvert.serialize(privateKeyInfo)), 'PRIVATE KEY');
};

export const toPKCS1 = async (pkcs8pem: string) => {
  const pkcs8Der = pemToDer(pkcs8pem, 'PRIVATE KEY');
  const privateKeyInfo = AsnConvert.parse(pkcs8Der, PrivateKeyInfo);
  return derToPem(new Uint8Array(privateKeyInfo.privateKey.buffer), 'RSA PRIVATE KEY');
};

export const parseSpkiFromCertificateKey = async (publicKey: Uint8Array) => {
  const rsaPublicKey = AsnConvert.parse(publicKey, RSAPublicKey);
  const rsaPublicKeyDer = AsnConvert.serialize(rsaPublicKey);
  const subjectPublicKeyInfo = new SubjectPublicKeyInfo({
    algorithm: rsaEncryption,
    subjectPublicKey: rsaPublicKeyDer,
  });
  return new Uint8Array(AsnConvert.serialize(subjectPublicKeyInfo));
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
  const hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  for (let n = 0; n < size; n++) result.push(hexRef[Math.floor(Math.random() * 16)]);
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
  return crypto.subtle.importKey('raw', toBufferSource(keyData), 'AES-CBC', false, ['encrypt']);
};

export const importAesCbcKeyForDecrypt = async (keyData: BytesLike) =>
  crypto.subtle.importKey('raw', toBufferSource(keyData), { name: 'AES-CBC' }, false, ['decrypt']);

export const encryptWithAesCbc = async (data: BytesLike, key: CryptoKey, iv: BytesLike) => {
  const result = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: toBufferSource(iv) },
    key,
    toBufferSource(data),
  );
  return new Uint8Array(result);
};

export const decryptWithAesCbc = async (data: BytesLike, key: CryptoKey, iv: BytesLike) => {
  const result = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: toBufferSource(iv) },
    key,
    toBufferSource(data),
  );
  return new Uint8Array(result);
};

export const encryptWithRsaOaep = async (data: BytesLike, key: CryptoKey) => {
  const result = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, toBufferSource(data));
  return new Uint8Array(result);
};

export const exportKey = (key: CryptoKey) =>
  crypto.subtle.exportKey('raw', key).then((value) => new Uint8Array(value));

export const importAesCtrKey = async (keyData: BytesLike) => {
  return crypto.subtle.importKey('raw', toBufferSource(keyData), { name: 'AES-CTR' }, true, [
    'decrypt',
  ]);
};

export const decryptWithAesCtr = async (data: BytesLike, key: CryptoKey, iv: BytesLike) => {
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
  const signature = await crypto.subtle.sign('HMAC', hmacKey, toBufferSource(data));
  return new Uint8Array(signature);
};

export const createSha256 = async (data: BytesLike) => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', toBufferSource(data));
  const hashArray = new Uint8Array(hashBuffer);
  return hashArray;
};

export const createSha1 = async (data: BytesLike) => {
  const hashBuffer = await crypto.subtle.digest('SHA-1', toBufferSource(data));
  return new Uint8Array(hashBuffer);
};

export const ecc256Verify = async (
  publicKey: Uint8Array,
  data: Uint8Array,
  signature: Uint8Array,
) => {
  return p256.verify(signature, await createSha256(data), publicKey, {
    prehash: false,
    lowS: false,
  });
};

type CompactSignature = ECDSASignature & {
  toCompactRawBytes: () => Uint8Array;
};

export const ecc256Sign = async (private_key: bigint | string | Uint8Array, data: Uint8Array) => {
  const privateKeyBytes =
    typeof private_key === 'bigint'
      ? utils.numberToBytesBE(private_key, 32)
      : typeof private_key === 'string'
        ? utils.hexToBytes(private_key)
        : private_key;
  const signatureBytes = p256.sign(await createSha256(data), privateKeyBytes, { prehash: false });
  const signature = p256.Signature.fromBytes(signatureBytes, 'compact');
  return {
    get r() {
      return signature.r;
    },
    get s() {
      return signature.s;
    },
    get recovery() {
      return signature.recovery;
    },
    addRecoveryBit: signature.addRecoveryBit.bind(signature),
    hasHighS: signature.hasHighS.bind(signature),
    recoverPublicKey: signature.recoverPublicKey.bind(signature),
    toBytes: signature.toBytes.bind(signature),
    toHex: signature.toHex.bind(signature),
    toCompactRawBytes: () => signature.toBytes('compact'),
  } satisfies CompactSignature;
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
  const keyBytes = toBytes(key);
  const inputBytes = toBytes(data);

  if (inputBytes.length % 16 !== 0) {
    throw new Error('AES-ECB input length must be a multiple of 16 bytes');
  }

  const expandedKey = nobleAesUnsafe.expandKeyLE(keyBytes);
  const encrypted = new Uint8Array(inputBytes.length);

  for (let offset = 0; offset < inputBytes.length; offset += 16) {
    const block = new Uint8Array(16);
    block.set(inputBytes.subarray(offset, offset + 16));
    nobleAesUnsafe.encryptBlock(expandedKey, block);
    encrypted.set(block, offset);
  }

  return encrypted;
};
