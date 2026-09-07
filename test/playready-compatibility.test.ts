import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { afterEach, assert, expect, test, vi } from 'vitest';
import { createSha256, ecc256Verify } from '../src/lib/crypto/common';
import { EccKey } from '../src/lib/crypto/ecc-key';
import {
  BCertObjType,
  Certificate,
  CertificateChain,
  ExtDataHwidRecord,
} from '../src/lib/playready/bcert';
import { PlayReadySession } from '../src/lib/playready/session';
import extdata from './fixtures/playready/extdata.json';
import signatures from './fixtures/playready/xml-signatures.json';

afterEach(() => vi.restoreAllMocks());

test.each(extdata.cases)(
  'independent ExtData fixture: data=$data, tampered=$tampered',
  async (fixture) => {
    const bytes = Buffer.from(fixture.certificate, 'base64');
    const certificate = Certificate.loads(bytes);
    expect(certificate.dumps()).toEqual(new Uint8Array(bytes));
    const container = certificate.getAttribute(BCertObjType.EXTDATACONTAINER)?.attribute;
    assert(container && 'record' in container);
    expect(ExtDataHwidRecord.build(container.record)).toEqual(
      new Uint8Array(Buffer.from(fixture.record, 'hex')),
    );
    expect(container.record.record_data).toEqual(new Uint8Array(Buffer.from(fixture.data, 'hex')));
    const verification = certificate.verify(Buffer.from(extdata.issuer, 'hex'), 0);
    if (fixture.tampered) {
      await expect(verification).rejects.toThrow(
        'Signature of certificate extdata 0 is not authentic',
      );
    } else {
      await expect(verification).resolves.toBeUndefined();
    }
  },
);

test.each(signatures.cases)('independent C14N signature: $name', async (fixture) => {
  const publicKey = Buffer.from(signatures.publicKey, 'hex');
  // Verify the stored lxml canonical bytes using real SHA-256 and ECDSA in Okova.
  expect(
    Buffer.from(await createSha256(new TextEncoder().encode(fixture.canonicalResponse))).toString(
      'base64',
    ),
  ).toBe(fixture.digest);
  await expect(
    ecc256Verify(
      new Uint8Array([4, ...publicKey]),
      new TextEncoder().encode(fixture.canonicalSignedInfo),
      Buffer.from(fixture.signature, 'base64'),
    ),
  ).resolves.toBe(true);

  const chain = new CertificateChain({
    signature: new TextEncoder().encode('CHAI'),
    version: 1,
    total_length: 20,
    flags: 0,
    certificate_count: 0,
    certificates: [],
  });
  vi.spyOn(chain, 'verify').mockResolvedValue(true);
  const certificate = Certificate.loads(Buffer.from(extdata.cases[0]!.certificate, 'base64'));
  vi.spyOn(certificate, 'getKeyByUsage').mockReturnValue(publicKey);
  vi.spyOn(chain, 'get').mockReturnValue(certificate);
  vi.spyOn(CertificateChain, 'from').mockReturnValue(chain);
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });
  const document = new DOMParser().parseFromString(fixture.xml, 'application/xml');
  const serializer = new XMLSerializer();
  const response = document.getElementsByTagName('LicenseResponse')[0]!;
  const signedInfo = document.getElementsByTagName('SignedInfo')[0]!;

  // Characterize the current compatibility boundary. These are valid C14N signatures;
  // serializer-only verification rejects the cases that require canonicalization.
  if (fixture.name === 'canonical') {
    expect(serializer.serializeToString(response)).toBe(fixture.canonicalResponse);
    expect(serializer.serializeToString(signedInfo)).toBe(fixture.canonicalSignedInfo);
    await expect(session.parseLicense(fixture.xml)).resolves.toEqual([]);
  } else if (fixture.name === 'signed-info-empty-element') {
    expect(serializer.serializeToString(response)).toBe(fixture.canonicalResponse);
    expect(serializer.serializeToString(signedInfo)).not.toBe(fixture.canonicalSignedInfo);
    await expect(session.parseLicense(fixture.xml)).rejects.toThrow(
      'Signature mismatch in license',
    );
  } else {
    expect(serializer.serializeToString(response)).not.toBe(fixture.canonicalResponse);
    await expect(session.parseLicense(fixture.xml)).rejects.toThrow('Digest mismatch in license');
  }
});
