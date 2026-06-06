import { fromBase64, toBufferSource } from '../utils';
import {
  importSpkiKeyForEncrypt,
  importSpkiKeyForVerify,
  parseSpkiFromCertificateKey,
} from '../crypto/common';
import { DrmCertificate, SignedDrmCertificate, SignedMessage } from './proto';
import { createProtoWriter, type ProtobufWriter } from './protobuf';

const areUint8ArraysEqual = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const tryDecodeExactly = <T extends object>(
  data: Uint8Array,
  codec: {
    decode(buffer: Uint8Array): T;
    encode(message: T, writer?: ProtobufWriter): { finish(): Uint8Array };
  },
) => {
  try {
    const decoded = codec.decode(data);
    const encoded = codec.encode(decoded, createProtoWriter()).finish();
    return areUint8ArraysEqual(encoded, data) ? decoded : null;
  } catch {
    return null;
  }
};

export const getRootCertificate = () => {
  const signedDrmCertificateBase64 = `
        CpwDCAASAQAY3ZSIiwUijgMwggGKAoIBgQC0/jnDZZAD2zwRlwnoaM3yw16b8udNI7EQ24dl39z7nzWgVwNTTPZtNX2meNuzNtI/nECplSZy
        f7i+Zt/FIZh4FRZoXS9GDkPLioQ5q/uwNYAivjQji6tTW3LsS7VIaVM+R1/9Cf2ndhOPD5LWTN+udqm62SIQqZ1xRdbX4RklhZxTmpfrhNfM
        qIiCIHAmIP1+QFAn4iWTb7w+cqD6wb0ptE2CXMG0y5xyfrDpihc+GWP8/YJIK7eyM7l97Eu6iR8nuJuISISqGJIOZfXIbBH/azbkdDTKjDOx
        +biOtOYS4AKYeVJeRTP/Edzrw1O6fGAaET0A+9K3qjD6T15Id1sX3HXvb9IZbdy+f7B4j9yCYEy/5CkGXmmMOROtFCXtGbLynwGCDVZEiMg1
        7B8RsyTgWQ035Ec86kt/lzEcgXyUikx9aBWE/6UI/Rjn5yvkRycSEbgj7FiTPKwS0ohtQT3F/hzcufjUUT4H5QNvpxLoEve1zqaWVT94tGSC
        UNIzX5ECAwEAARKAA1jx1k0ECXvf1+9dOwI5F/oUNnVKOGeFVxKnFO41FtU9v0KG9mkAds2T9Hyy355EzUzUrgkYU0Qy7OBhG+XaE9NVxd0a
        y5AeflvG6Q8in76FAv6QMcxrA4S9IsRV+vXyCM1lQVjofSnaBFiC9TdpvPNaV4QXezKHcLKwdpyywxXRESYqI3WZPrl3IjINvBoZwdVlkHZV
        dA8OaU1fTY8Zr9/WFjGUqJJfT7x6Mfiujq0zt+kw0IwKimyDNfiKgbL+HIisKmbF/73mF9BiC9yKRfewPlrIHkokL2yl4xyIFIPVxe9enz2F
        RXPia1BSV0z7kmxmdYrWDRuu8+yvUSIDXQouY5OcCwEgqKmELhfKrnPsIht5rvagcizfB0fbiIYwFHghESKIrNdUdPnzJsKlVshWTwApHQh7
        evuVicPumFSePGuUBRMS9nG5qxPDDJtGCHs9Mmpoyh6ckGLF7RC5HxclzpC5bc3ERvWjYhN0AqdipPpV2d7PouaAdFUGSdUCDA==`
    .split('\n')
    .map((s) => s.trim())
    .join('\n');

  const signedDrmCertificate = SignedDrmCertificate.decode(
    fromBase64(signedDrmCertificateBase64).toBuffer(),
  );

  const drmCertificate = DrmCertificate.decode(signedDrmCertificate.drmCertificate);

  return {
    signedDrmCertificateBase64,
    signedDrmCertificate,
    drmCertificate,
  };
};

export const importCertificateKey = async (publicKey: Uint8Array, usage: 'encrypt' | 'verify') => {
  const keyData = await parseSpkiFromCertificateKey(publicKey);
  if (usage === 'verify') {
    return importSpkiKeyForVerify(keyData);
  } else {
    return importSpkiKeyForEncrypt(keyData);
  }
};

export const verifyCertificate = async (signedDrmCertificate: SignedDrmCertificate) => {
  const publicKey = getRootCertificate().drmCertificate.publicKey;
  const signature = signedDrmCertificate.signature;
  const data = signedDrmCertificate.drmCertificate;
  const key = await importCertificateKey(publicKey, 'verify');
  const isValid = await crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: 20 },
    key,
    toBufferSource(signature),
    toBufferSource(data),
  );
  return isValid;
};

export const parseCertificate = async (data: Uint8Array | string) => {
  const certificate = ArrayBuffer.isView(data) ? data : fromBase64(data).toBuffer();

  const signedMessage = tryDecodeExactly(certificate, SignedMessage);
  const signedDrmCertificate =
    (signedMessage && tryDecodeExactly(signedMessage.msg, SignedDrmCertificate)) ||
    tryDecodeExactly(certificate, SignedDrmCertificate);
  if (!signedDrmCertificate) {
    throw new Error('Failed to parse service certificate as SignedDrmCertificate');
  }

  const drmCertificate = tryDecodeExactly(signedDrmCertificate.drmCertificate, DrmCertificate);
  if (!drmCertificate) {
    throw new Error('Failed to parse service certificate payload as DrmCertificate');
  }

  return { signedDrmCertificate, drmCertificate };
};
