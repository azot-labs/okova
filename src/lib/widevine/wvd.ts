import { fromText } from '../utils';

const VERSION = 2;
const MAGIC = fromText('WVD').toBuffer();

export const WVD_DEVICE_TYPES = { chrome: 1, android: 2 } as const;

const areUint8ArraysEqual = (a: Uint8Array, b: Uint8Array) => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};

const readUint8 = (data: Uint8Array, offset: number) => {
  return data[offset];
};

const readUint16BE = (data: Uint8Array, offset: number) => {
  return (data[offset] << 8) | data[offset + 1];
};

const writeUint8 = (value: number) => {
  const buffer = new Uint8Array(1);
  buffer[0] = value;
  return buffer;
};

const writeUint16BE = (value: number) => {
  const buffer = new Uint8Array(2);
  buffer[0] = (value >> 8) & 0xff;
  buffer[1] = value & 0xff;
  return buffer;
};

export const parseWvd = (data: Uint8Array) => {
  let offset = 0;

  // Read and verify magic number
  const magic = data.subarray(offset, offset + 3);
  offset += 3;
  if (!areUint8ArraysEqual(magic, MAGIC)) {
    throw new Error('Invalid WVD file: Wrong magic number');
  }

  // Read version
  const version = readUint8(data, offset);
  offset += 1;

  if (version !== VERSION) {
    throw new Error(`Unsupported WVD version: ${version}`);
  }

  // Read device type
  const deviceType = readUint8(data, offset);
  offset += 1;

  // Read security level
  const securityLevel = readUint8(data, offset);
  offset += 1;

  // Skip flags for now
  offset += 1;

  // Read private key
  const privateKeyLen = readUint16BE(data, offset);
  offset += 2;
  const privateKey = data.subarray(offset, offset + privateKeyLen);
  offset += privateKeyLen;

  // Read client ID
  const clientIdLen = readUint16BE(data, offset);
  offset += 2;
  const clientId = data.subarray(offset, offset + clientIdLen);

  return {
    version,
    deviceType,
    securityLevel,
    privateKey,
    clientId,
  };
};

export const buildWvd = (wvdData: {
  deviceType: number;
  securityLevel: number;
  privateKey: Uint8Array;
  clientId: Uint8Array;
}) => {
  const { deviceType, securityLevel, privateKey, clientId } = wvdData;

  // Private key length and client ID length
  const privateKeyLen = privateKey.length;
  const clientIdLen = clientId.length;

  // Create an array to hold all parts
  const wvdArray = new Uint8Array(
    MAGIC.length + // Magic number (3 bytes)
      1 + // Version (1 byte)
      1 + // Device type (1 byte)
      1 + // Security level (1 byte)
      1 + // Flags (1 byte, padded as in the Python script)
      2 + // Private key length (2 bytes)
      privateKeyLen + // Private key
      2 + // Client ID length (2 bytes)
      clientIdLen, // Client ID
  );

  let offset = 0;

  // Write magic
  wvdArray.set(MAGIC, offset);
  offset += MAGIC.length;

  // Write version
  wvdArray.set(writeUint8(VERSION), offset);
  offset += 1;

  // Write device type
  wvdArray.set(writeUint8(deviceType), offset);
  offset += 1;

  // Write security level
  wvdArray.set(writeUint8(securityLevel), offset);
  offset += 1;

  // Write flags (padded to 1 byte)
  wvdArray.set(writeUint8(0), offset); // No flags used, just padding with 0
  offset += 1;

  // Write private key length (big-endian 16-bit)
  wvdArray.set(writeUint16BE(privateKeyLen), offset);
  offset += 2;

  // Write private key
  wvdArray.set(privateKey, offset);
  offset += privateKeyLen;

  // Write client ID length (big-endian 16-bit)
  wvdArray.set(writeUint16BE(clientIdLen), offset);
  offset += 2;

  // Write client ID
  wvdArray.set(clientId, offset);

  return wvdArray;
};
