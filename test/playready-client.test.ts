import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import * as common from '../src/lib/crypto/common';
import { EccKey } from '../src/lib/crypto/ecc-key';
import { fromBuffer } from '../src/lib';
import {
  BCert,
  BCertBody,
  BCertFlag,
  BCertObjFlag,
  BCertObjType,
  Certificate,
  CertificateChain,
  ExtDataRecordSet,
} from '../src/lib/playready/bcert';
import { PlayReadyDeviceCredentials } from '../src/lib/playready/device-credentials';
import { InvalidCertificate, InvalidCertificateChain } from '../src/lib/playready/exceptions';

const WORKDIR = join(process.cwd(), '');

const loadPlayReadyClientData = async () => {
  const clientPath = process.env.VITEST_PRD_PATH ?? join(WORKDIR, 'clients', 'client.prd');
  return readFile(clientPath);
};

test('roundtrips playready device credentials', async () => {
  const prd = await loadPlayReadyClientData();
  const client = await PlayReadyDeviceCredentials.from({ prd });
  const repacked = client.pack();
  const unpacked = client.unpack();

  expect(fromBuffer(repacked).toBase64()).toBe(fromBuffer(prd).toBase64());
  expect(client.securityLevel).toBeGreaterThan(0);
  expect(client.label).toBeTruthy();
  expect(client.filename).toMatch(/^[a-z0-9_-]+$/);
  expect(Object.keys(unpacked).sort()).toEqual(['bgroupcert.dat', 'zgpriv.dat']);
  expect(unpacked['zgpriv.dat'].length).toBe(32);
  expect(unpacked['bgroupcert.dat'].length).toBeGreaterThan(0);
});

test('creates playready device credentials from unpacked fixtures', async () => {
  const prd = await loadPlayReadyClientData();
  const original = await PlayReadyDeviceCredentials.from({ prd });
  const unpacked = original.unpack();

  const recreated = await PlayReadyDeviceCredentials.from({
    groupKey: unpacked['zgpriv.dat'],
    groupCertificate: unpacked['bgroupcert.dat'],
  });

  expect(recreated.securityLevel).toBe(original.securityLevel);
  expect(recreated.label).toBe(original.label);
  expect(recreated.pack().length).toBeGreaterThan(0);
});

test('rejects unpacked playready credentials when the group key does not match the certificate', async () => {
  const prd = await loadPlayReadyClientData();
  const original = await PlayReadyDeviceCredentials.from({ prd });
  const unpacked = original.unpack();
  const mismatchedGroupKey = new Uint8Array(unpacked['zgpriv.dat']);
  mismatchedGroupKey[mismatchedGroupKey.length - 1] ^= 0x01;

  await expect(
    PlayReadyDeviceCredentials.from({
      groupKey: mismatchedGroupKey,
      groupCertificate: unpacked['bgroupcert.dat'],
    }),
  ).rejects.toBeInstanceOf(InvalidCertificateChain);
});

test('rejects already provisioned playready certificate chains when creating unpacked credentials', async () => {
  const prd = await loadPlayReadyClientData();
  const original = await PlayReadyDeviceCredentials.from({ prd });

  await expect(
    PlayReadyDeviceCredentials.from({
      groupKey: original.groupKey.dumps(true),
      groupCertificate: original.groupCertificate.dumps(),
    }),
  ).rejects.toThrowError(new InvalidCertificateChain('Device has already been provisioned'));
});

test('verifies certificate extdata signatures when EXTDATA is present', async () => {
  const prd = await loadPlayReadyClientData();
  const original = await PlayReadyDeviceCredentials.from({ prd });
  const unpacked = original.unpack();
  const issuerChain = CertificateChain.from(unpacked['bgroupcert.dat']);
  const leafCertificate = await Certificate.newLeafCert({
    certId: new Uint8Array(16).fill(1),
    securityLevel: issuerChain.getSecurityLevel(),
    clientId: new Uint8Array(16).fill(2),
    signingKey: EccKey.generate(),
    encryptionKey: EccKey.generate(),
    groupKey: original.groupKey,
    parent: issuerChain,
  });

  const basicInfo = leafCertificate.getAttribute(BCertObjType.BASIC)! as any;
  basicInfo.attribute.flags |= BCertFlag.EXTDATA_PRESENT;

  const extDataSigningKey = EccKey.generate();
  const extDataRecord = {
    record_count: 1,
    records: [{ data_size: 4, data: new Uint8Array([1, 2, 3, 4]) }],
  };
  const extDataSignature = (
    await common.ecc256Sign(extDataSigningKey.privateKey, ExtDataRecordSet.build(extDataRecord))
  ).toCompactRawBytes();

  const extDataSignKeyAttribute = {
    flags: BCertObjFlag.MUST_UNDERSTAND,
    tag: BCertObjType.EXTDATASIGNKEY,
    length: 80,
    attribute: {
      key_type: 0x0001,
      key_length: 512,
      flags: 0,
      key: extDataSigningKey.publicBytes(),
    },
  };
  const extDataContainerAttribute = {
    flags: BCertObjFlag.MUST_UNDERSTAND,
    tag: BCertObjType.EXTDATACONTAINER,
    length: 88,
    attribute: {
      record: extDataRecord,
      signature: {
        signature_type: 0x0001,
        signature_size: extDataSignature.length,
        signature: extDataSignature,
      },
    },
  };

  const signatureAttribute = leafCertificate.getAttribute(BCertObjType.SIGNATURE)! as any;
  const unsignedAttributes = leafCertificate.parsed.attributes.filter(
    (attribute) => attribute.tag !== BCertObjType.SIGNATURE,
  );
  leafCertificate.parsed.attributes = [
    ...unsignedAttributes,
    extDataSignKeyAttribute as any,
    extDataContainerAttribute as any,
  ];

  const payloadLength = BCertBody.build(leafCertificate.parsed as any).length;
  leafCertificate.parsed.certificate_length = payloadLength;
  leafCertificate.parsed.total_length = payloadLength + signatureAttribute.length;

  const signPayload = BCert.build(leafCertificate.parsed as any).subarray(0, payloadLength);
  signatureAttribute.attribute.signature = (
    await common.ecc256Sign(original.groupKey.privateKey, signPayload)
  ).toCompactRawBytes();
  leafCertificate.parsed.attributes.push(signatureAttribute);

  await expect(leafCertificate.verify(original.groupKey.publicBytes(), 0)).resolves.toBeUndefined();

  const tampered = Certificate.loads(leafCertificate.dumps());
  const tamperedContainer = tampered.getAttribute(BCertObjType.EXTDATACONTAINER)! as any;
  tamperedContainer.attribute.signature.signature[0] ^= 0xff;
  const tamperedSignatureAttribute = tampered.getAttribute(BCertObjType.SIGNATURE)! as any;
  tampered.parsed.attributes = tampered.parsed.attributes.filter(
    (attribute) => attribute.tag !== BCertObjType.SIGNATURE,
  );
  tampered.parsed.certificate_length = BCertBody.build(tampered.parsed as any).length;
  tampered.parsed.total_length =
    tampered.parsed.certificate_length + tamperedSignatureAttribute.length;
  tamperedSignatureAttribute.attribute.signature = (
    await common.ecc256Sign(
      original.groupKey.privateKey,
      BCert.build(tampered.parsed as any).subarray(0, tampered.parsed.certificate_length),
    )
  ).toCompactRawBytes();
  tampered.parsed.attributes.push(tamperedSignatureAttribute);

  await expect(tampered.verify(original.groupKey.publicBytes(), 0)).rejects.toThrowError(
    new InvalidCertificate('Signature of certificate extdata 0 is not authentic'),
  );
});
