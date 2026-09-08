import { DOMParser } from '@xmldom/xmldom';
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
import { InvalidLicense } from '../src/lib/playready/exceptions';
import { C14N_ALGORITHM, canonicalizeXml } from '../src/lib/playready/xml-c14n';
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

const createSignedSession = () => {
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
  vi.spyOn(certificate, 'getKeyByUsage').mockReturnValue(Buffer.from(signatures.publicKey, 'hex'));
  vi.spyOn(chain, 'get').mockReturnValue(certificate);
  vi.spyOn(CertificateChain, 'from').mockReturnValue(chain);
  return new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });
};

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

  const session = createSignedSession();
  const document = new DOMParser().parseFromString(fixture.xml, 'application/xml');
  const response = document.getElementsByTagName('LicenseResponse')[0]!;
  const signedInfo = document.getElementsByTagName('SignedInfo')[0]!;

  expect(canonicalizeXml(response)).toBe(fixture.canonicalResponse);
  expect(canonicalizeXml(signedInfo)).toBe(fixture.canonicalSignedInfo);
  await expect(session.parseLicense(fixture.xml)).resolves.toEqual([]);
  await expect(
    session.parseLicense(fixture.xml.replace('<Version>', '<Version>2')),
  ).rejects.toThrow('Digest mismatch in license');
  await expect(
    session.parseLicense(
      fixture.xml.replace(fixture.signature, Buffer.alloc(64).toString('base64')),
    ),
  ).rejects.toThrow('Signature mismatch in license');
});

const baseline = signatures.cases[0]!;

test.each([
  ['canonicalization algorithm', 'CanonicalizationMethod', 'Algorithm', 'urn:unsupported'],
  ['signature algorithm', 'SignatureMethod', 'Algorithm', 'urn:unsupported'],
  ['digest algorithm', 'DigestMethod', 'Algorithm', 'urn:unsupported'],
  ['wrong reference', 'Reference', 'URI', '#Other'],
  ['external reference', 'Reference', 'URI', 'https://example.invalid/license'],
  ['empty reference', 'Reference', 'URI', ''],
  ['missing response Id', 'LicenseResponse', 'Id', ''],
])('rejects %s', async (_name, tag, attribute, value) => {
  const document = new DOMParser().parseFromString(baseline.xml, 'application/xml');
  document.getElementsByTagName(tag)[0]!.setAttribute(attribute, value);
  await expect(createSignedSession().parseLicense(document.toString())).rejects.toThrow(
    InvalidLicense,
  );
});

test.each([
  [
    'duplicate Id',
    baseline.xml.replace('<Version>', '<Version Id="SignedData">'),
    'Reference must identify',
  ],
  [
    'duplicate signature',
    baseline.xml.replace(
      '</Response>',
      baseline.xml.match(/<Signature .*?<\/Signature>/)![0] + '</Response>',
    ),
    'Expected one Signature',
  ],
  [
    'duplicate reference',
    baseline.xml.replace(
      '</SignedInfo>',
      baseline.xml.match(/<Reference .*?<\/Reference>/)![0] + '</SignedInfo>',
    ),
    'Expected one Reference',
  ],
  [
    'missing method',
    baseline.xml.replace(/<CanonicalizationMethod .*?<\/CanonicalizationMethod>/, ''),
    'Expected one CanonicalizationMethod',
  ],
  [
    'missing signature value',
    baseline.xml.replace(/<SignatureValue>.*?<\/SignatureValue>/, ''),
    'Expected one SignatureValue',
  ],
  [
    'missing certificate chain',
    baseline.xml.replace(/<SigningCertificateChain>.*?<\/SigningCertificateChain>/, ''),
    'Expected one SigningCertificateChain',
  ],
  [
    'empty signature value',
    baseline.xml.replace(baseline.signature, ''),
    'Incomplete license response signature',
  ],
  [
    'wrong signature namespace',
    baseline.xml.replace('http://www.w3.org/2000/09/xmldsig#', 'urn:wrong'),
    'Invalid namespace',
  ],
  [
    'unsupported transform',
    baseline.xml.replace(
      '<DigestMethod',
      '<Transforms><Transform Algorithm="urn:unsupported"/></Transforms><DigestMethod',
    ),
    'Unsupported Transform',
  ],
  [
    'empty transforms',
    baseline.xml.replace('<DigestMethod', '<Transforms/><DigestMethod'),
    'Expected one Transform',
  ],
  [
    'transform parameters',
    baseline.xml.replace(
      '<DigestMethod',
      `<Transforms><Transform Algorithm="${C14N_ALGORITHM}"><Parameter/></Transform></Transforms><DigestMethod`,
    ),
    'Unsupported Transform',
  ],
  [
    'multiple transforms',
    baseline.xml.replace(
      '<DigestMethod',
      `<Transforms><Transform Algorithm="${C14N_ALGORITHM}"/><Transform Algorithm="${C14N_ALGORITHM}"/></Transforms><DigestMethod`,
    ),
    'Expected one Transform',
  ],
  ['DTD', '<!DOCTYPE AcquireLicenseResponse>' + baseline.xml, 'DTD is not supported'],
])('rejects %s before certificate verification', async (_name, xml, error) => {
  const session = createSignedSession();
  await expect(session.parseLicense(xml)).rejects.toThrow(error);
  expect(CertificateChain.from).not.toHaveBeenCalled();
});
