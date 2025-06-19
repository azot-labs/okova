import { concatUint8Arrays } from '../buffer';
import { aesCmac } from '../crypto/cmac';

export const deriveContext = (message: Uint8Array) => {
  const textEncoder = new TextEncoder();

  const toBytes = (n: number, length = 4) => {
    const bytes = new Uint8Array(length);
    bytes[length - 2] = (n >> 8) & 0xff;
    bytes[length - 1] = n & 0xff;
    return bytes;
  };

  const getContext = (label: string, msg: Uint8Array, keySize: number) =>
    concatUint8Arrays(
      textEncoder.encode(label + '\x00'),
      msg,
      toBytes(keySize),
    );

  return {
    enc: getContext('ENCRYPTION', message, 16 * 8 /* 128-bit */),
    auth: getContext('AUTHENTICATION', message, 32 * 8 * 2 /* 512-bit */),
  };
};

export const deriveKeys = async (
  encContext: Uint8Array,
  macContext: Uint8Array,
  key: Uint8Array,
) => {
  const derive = async (
    sessionKey: Uint8Array,
    context: Uint8Array,
    counter: number,
  ) => {
    const message = concatUint8Arrays(new Uint8Array([counter]), context);
    return await aesCmac(sessionKey, message);
  };

  const encKey = await derive(key, encContext, 1);
  const macKeyServer = concatUint8Arrays(
    await derive(key, macContext, 1),
    await derive(key, macContext, 2),
  );
  const macKeyClient = concatUint8Arrays(
    await derive(key, macContext, 3),
    await derive(key, macContext, 4),
  );

  return { encKey, macKeyServer, macKeyClient };
};
