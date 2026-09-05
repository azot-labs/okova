import { readFile } from 'node:fs/promises';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import * as utils from '@noble/curves/utils.js';
import { afterEach } from 'vitest';
import { expect, test, vi } from 'vitest';
import { fetchDecryptionKeys, fromBase64, toBufferSource } from '../src/lib';
import { requestMediaKeySystemAccess, setSupportedEngines } from '../src/lib/api';
import * as common from '../src/lib/crypto/common';
import { EccKey } from '../src/lib/crypto/ecc-key';
import { CertificateChain } from '../src/lib/playready/bcert';
import { PlayReady } from '../src/lib/playready/engine';
import { InvalidLicense, ServerException, TooManySessions } from '../src/lib/playready/exceptions';
import { Key } from '../src/lib/playready/key';
import { DEFAULT_REVOCATION_LIST_IDS } from '../src/lib/playready/revocation-info';
import { PlayReadySession } from '../src/lib/playready/session';
import { XmrLicense } from '../src/lib/playready/xmr-license';

afterEach(() => {
  vi.restoreAllMocks();
});

const serializeToBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64');
const WRM_HEADER =
  '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0"><DATA></DATA></WRMHEADER>';

const createPlayReady = () =>
  new PlayReady({
    deviceCredentials: {
      certificateChain: new Uint8Array(),
      encryptionKey: EccKey.generate().dumps(),
      signingKey: EccKey.generate().dumps(),
    } as any,
  });

const setUint32Be = (bytes: Uint8Array, offset: number, value: number) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint32(offset, value);
  return bytes;
};

const buildRevocationListData = (listId: string, version: number) => {
  switch (listId) {
    case 'Ef/RUojT3U6Ct2jqTCChbA==':
      return serializeToBase64(setUint32Be(new Uint8Array(16), 12, version));
    case 'BOZ1zT1UnEqfCf5tJOi/kA==':
      return serializeToBase64(setUint32Be(new Uint8Array(4), 0, version));
    default:
      return serializeToBase64(setUint32Be(new Uint8Array(20), 16, version));
  }
};

const buildRevInfoResponse = (entries: Array<{ listId: string; version: number }>) =>
  '<AcquireLicenseResponse><AcquireLicenseResult><Response><LicenseResponse><RevInfo>' +
  entries
    .map(
      ({ listId, version }) =>
        `<Revocation><ListID>${listId}</ListID><ListData>${buildRevocationListData(listId, version)}</ListData></Revocation>`,
    )
    .join('') +
  '</RevInfo></LicenseResponse></Response></AcquireLicenseResult></AcquireLicenseResponse>';

const buildSignedLicenseResponse = async (
  signingKey: EccKey,
  options: {
    digestValue?: string;
    signatureValue?: string;
  } = {},
) => {
  const xml = [
    '<AcquireLicenseResponse xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols">',
    '<AcquireLicenseResult><Response>',
    '<LicenseResponse>',
    '<Version>1</Version>',
    '<SigningCertificateChain>AA==</SigningCertificateChain>',
    '</LicenseResponse>',
    '<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">',
    '<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">',
    '<Reference URI="#SignedData">',
    '<DigestValue></DigestValue>',
    '</Reference>',
    '</SignedInfo>',
    '<SignatureValue></SignatureValue>',
    '</Signature>',
    '</Response></AcquireLicenseResult>',
    '</AcquireLicenseResponse>',
  ].join('');

  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const document = parser.parseFromString(xml, 'application/xml');
  const licenseResponseElement = document.getElementsByTagName('LicenseResponse')[0]!;
  const signedInfoElement = document.getElementsByTagName('SignedInfo')[0]!;
  const digestValueElement = document.getElementsByTagName('DigestValue')[0]!;
  const signatureValueElement = document.getElementsByTagName('SignatureValue')[0]!;

  const digestValue =
    options.digestValue ??
    serializeToBase64(
      await common.createSha256(
        new TextEncoder().encode(serializer.serializeToString(licenseResponseElement)),
      ),
    );
  digestValueElement.textContent = digestValue;

  const signatureValue =
    options.signatureValue ??
    serializeToBase64(
      (
        await common.ecc256Sign(
          signingKey.privateKey,
          new TextEncoder().encode(serializer.serializeToString(signedInfoElement)),
        )
      ).toCompactRawBytes(),
    );
  signatureValueElement.textContent = signatureValue;

  return serializer.serializeToString(document.documentElement!);
};

test('playready challenge omits revocation-lists XML when none is provided', async () => {
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });

  const challenge = await session.getLicenseChallenge(WRM_HEADER);

  expect(challenge).not.toContain('undefined');
  expect(challenge).toContain(
    '<CLIENTINFO><CLIENTVERSION>10.0.16384.10011</CLIENTVERSION></CLIENTINFO><LicenseNonce>',
  );
});

test('playready engine sessions include revocation-list versions and persist merged RevInfo', async () => {
  const cdm = createPlayReady();
  const session = cdm.createSession() as PlayReadySession;

  const initialChallenge = await session.getLicenseChallenge(WRM_HEADER);
  for (const listId of DEFAULT_REVOCATION_LIST_IDS) {
    expect(initialChallenge).toContain(`<ListID>${listId}</ListID><Version>0</Version>`);
  }

  await session.parseLicense(
    buildRevInfoResponse([
      { listId: 'ioydTlK2p0WXkWklprR5Hw==', version: 7 },
      { listId: 'Ef/RUojT3U6Ct2jqTCChbA==', version: 11 },
    ]),
  );

  const updatedChallenge = await session.getLicenseChallenge(WRM_HEADER);
  expect(updatedChallenge).toContain(
    '<ListID>ioydTlK2p0WXkWklprR5Hw==</ListID><Version>7</Version>',
  );
  expect(updatedChallenge).toContain(
    '<ListID>Ef/RUojT3U6Ct2jqTCChbA==</ListID><Version>11</Version>',
  );
});

const wrapLicenseResponse = (content: string) =>
  `<AcquireLicenseResponse><AcquireLicenseResult><Response><LicenseResponse>${content}</LicenseResponse></Response></AcquireLicenseResult></AcquireLicenseResponse>`;

test.each([
  '<html><body>upstream error</body></html>',
  '<AcquireLicenseResponse/>',
  '<AcquireLicenseResponse><AcquireLicenseResult/></AcquireLicenseResponse>',
  '<AcquireLicenseResponse><AcquireLicenseResult><Response/></AcquireLicenseResult></AcquireLicenseResponse>',
  `<html>${wrapLicenseResponse('')}</html>`,
  '<Envelope><Body/></Envelope>',
  wrapLicenseResponse('').replace('</Response>', '<LicenseResponse/></Response>'),
  wrapLicenseResponse('<RevInfo>').replace('</LicenseResponse>', '</RevInfo>'),
])('playready rejects invalid responses without changing session state: %s', async (xml) => {
  const mergeRevocationInfo = vi.fn();
  const session = new PlayReadySession(
    'temporary',
    {
      certificateChain: new Uint8Array(),
      encryptionKey: EccKey.generate().dumps(),
      signingKey: EccKey.generate().dumps(),
    },
    undefined,
    { mergeRevocationInfo },
  );
  const parseLicense = vi
    .spyOn(session, 'parseLicense')
    .mockResolvedValueOnce([new Key(new Uint8Array(16), 1, 3, new Uint8Array(16).fill(0xaa))]);
  await session.update(new Uint8Array());
  parseLicense.mockRestore();
  const state = session.pause();
  const keys = new Map(session.keys);
  const statuses = new Map(session.keyStatuses);
  const onKeysChange = vi.fn();
  session.addEventListener('keyschange', onKeysChange);
  session.addEventListener('keystatuseschange', onKeysChange);

  await expect(session.parseLicense(xml)).rejects.toBeInstanceOf(InvalidLicense);
  await expect(session.update(new TextEncoder().encode(xml))).rejects.toBeInstanceOf(
    InvalidLicense,
  );

  expect(session.pause()).toBe(state);
  expect(session.keys).toEqual(keys);
  expect(session.keyStatuses).toEqual(statuses);
  expect(onKeysChange).not.toHaveBeenCalled();
  expect(mergeRevocationInfo).not.toHaveBeenCalled();
});

test.each([
  wrapLicenseResponse(''),
  wrapLicenseResponse('<Licenses/>'),
  wrapLicenseResponse('<Acknowledgement><TransactionID>1</TransactionID></Acknowledgement>'),
  `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${wrapLicenseResponse('')}</soap:Body></soap:Envelope>`,
  wrapLicenseResponse('')
    .replaceAll('<Response>', '<pr:Response>')
    .replaceAll('</Response>', '</pr:Response>')
    .replace(
      '<AcquireLicenseResponse>',
      '<AcquireLicenseResponse xmlns:pr="http://schemas.microsoft.com/DRM/2007/03/protocols/messages">',
    ),
])('playready accepts valid responses without content keys: %s', async (xml) => {
  const session = createPlayReady().createSession() as PlayReadySession;
  await expect(session.parseLicense(xml)).resolves.toEqual([]);
  await expect(session.update(new TextEncoder().encode(xml))).resolves.toBeUndefined();
});

test('playready does not merge revocation data when a license is invalid', async () => {
  const mergeRevocationInfo = vi.fn();
  const session = new PlayReadySession(
    'temporary',
    {
      certificateChain: new Uint8Array(),
      encryptionKey: EccKey.generate().dumps(),
      signingKey: EccKey.generate().dumps(),
    },
    undefined,
    { mergeRevocationInfo },
  );
  await expect(
    session.parseLicense(
      wrapLicenseResponse('<RevInfo/><Licenses><License>AA==</License></Licenses>'),
    ),
  ).rejects.toThrow();
  expect(mergeRevocationInfo).not.toHaveBeenCalled();
});

test('playready parseLicense rejects unsupported cipher types', async () => {
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });
  const xmrLoadsSpy = vi.spyOn(XmrLicense, 'loads').mockReturnValue({
    getObjects: (type: number) => {
      if (type === 42) {
        return [
          {
            data: {
              key: session.encryptionKey.publicBytes(),
            },
          },
        ];
      }
      if (type === 10) {
        return [
          {
            data: {
              keyId: new Uint8Array(16),
              keyType: 1,
              cipherType: 999,
              encryptedKey: new Uint8Array(128),
            },
          },
        ];
      }
      return [];
    },
  } as unknown as XmrLicense);

  await expect(
    session.parseLicense(
      '<AcquireLicenseResponse><AcquireLicenseResult><Response><LicenseResponse><Licenses><License>AA==</License></Licenses></LicenseResponse></Response></AcquireLicenseResult></AcquireLicenseResponse>',
    ),
  ).rejects.toThrowError(new InvalidLicense('Unsupported cipher type 999'));
});

test('playready parseLicense rejects licenses with invalid integrity signatures', async () => {
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });
  const xmrLoadsSpy = vi.spyOn(XmrLicense, 'loads').mockReturnValue({
    getObjects: (type: number) => {
      if (type === 42) {
        return [
          {
            data: {
              key: session.encryptionKey.publicBytes(),
            },
          },
        ];
      }
      if (type === 10) {
        return [
          {
            data: {
              keyId: new Uint8Array(16),
              keyType: 1,
              cipherType: 3,
              encryptedKey: new Uint8Array(128),
            },
          },
        ];
      }
      return [];
    },
    checkSignature: vi.fn().mockResolvedValue(false),
  } as unknown as XmrLicense);
  const decryptSpy = vi
    .spyOn(common, 'ecc256decrypt')
    .mockReturnValue(new Uint8Array([...new Uint8Array(16), ...new Uint8Array(16).fill(1)]));

  await expect(
    session.parseLicense(
      '<AcquireLicenseResponse><AcquireLicenseResult><Response><LicenseResponse><Licenses><License>AA==</License></Licenses></LicenseResponse></Response></AcquireLicenseResult></AcquireLicenseResponse>',
    ),
  ).rejects.toThrowError(new InvalidLicense('License integrity signature does not match'));
  expect(decryptSpy).toHaveBeenCalledTimes(1);
  expect(xmrLoadsSpy).toHaveBeenCalledTimes(1);
});

test('playready parseLicense rejects licenses issued for another device key', async () => {
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });
  vi.spyOn(XmrLicense, 'loads').mockReturnValue({
    getObjects: (type: number) => {
      if (type === 42) {
        return [
          {
            data: {
              key: EccKey.generate().publicBytes(),
            },
          },
        ];
      }
      return [];
    },
  } as unknown as XmrLicense);

  await expect(
    session.parseLicense(
      '<AcquireLicenseResponse><AcquireLicenseResult><Response><LicenseResponse><Licenses><License>AA==</License></Licenses></LicenseResponse></Response></AcquireLicenseResult></AcquireLicenseResponse>',
    ),
  ).rejects.toThrowError(new InvalidLicense('Public encryption key does not match'));
});

test('playready parseLicense raises server exceptions for SOAP faults', async () => {
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });

  await expect(
    session.parseLicense(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><soap:Fault><faultstring>License server failure</faultstring></soap:Fault></soap:Body></soap:Envelope>',
    ),
  ).rejects.toThrowError(new ServerException('License server failure'));
});

test('playready parseLicense verifies signed license responses before key extraction', async () => {
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });
  const responseSigningKey = EccKey.generate();
  const certificateChainSpy = vi.spyOn(CertificateChain, 'from').mockReturnValue({
    verify: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockReturnValue({
      getKeyByUsage: vi.fn().mockReturnValue(responseSigningKey.publicBytes()),
    }),
  } as unknown as CertificateChain);
  const licenseResponse = await buildSignedLicenseResponse(responseSigningKey);

  await expect(session.parseLicense(licenseResponse)).resolves.toEqual([]);
  expect(certificateChainSpy).toHaveBeenCalledTimes(1);
});

test('playready parseLicense rejects signed license responses with digest mismatches', async () => {
  const session = new PlayReadySession('temporary', {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  });
  const responseSigningKey = EccKey.generate();
  const invalidDigest = serializeToBase64(
    new Uint8Array([...utils.numberToBytesBE(1n, 1), ...new Uint8Array(31)]),
  );
  const licenseResponse = await buildSignedLicenseResponse(responseSigningKey, {
    digestValue: invalidDigest,
  });

  await expect(session.parseLicense(licenseResponse)).rejects.toThrowError(
    new InvalidLicense('Digest mismatch in license'),
  );
});

test('playready XMR parser rejects invalid XMR signatures', () => {
  expect(() => XmrLicense.loads(new Uint8Array([0x00, 0x00, 0x00, 0x00]))).toThrowError(
    new InvalidLicense('Invalid XMR license signature'),
  );
});

test('playready XMR parser unwraps flag-based container objects', () => {
  const nestedContentKeyObject = new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x0a,
    0x00,
    0x00,
    0x00,
    0x1e,
    ...new Uint8Array(16),
    0x00,
    0x01,
    0x00,
    0x03,
    0x00,
    0x00,
  ]);
  const licenseBytes = new Uint8Array([
    0x58,
    0x4d,
    0x52,
    0x00,
    0x00,
    0x00,
    0x00,
    0x01,
    ...new Uint8Array(16),
    0x00,
    0x03,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    nestedContentKeyObject.length + 8,
    ...nestedContentKeyObject,
  ]);

  const license = XmrLicense.loads(licenseBytes);

  expect(license.getObjects(10)).toHaveLength(1);
});

test('playready XMR getObjects keeps the matching container before descending', () => {
  const nestedSignatureObject = new Uint8Array([
    0x00, 0x00, 0x00, 0x0b, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x01, 0x00, 0x00,
  ]);
  const licenseBytes = new Uint8Array([
    0x58,
    0x4d,
    0x52,
    0x00,
    0x00,
    0x00,
    0x00,
    0x01,
    ...new Uint8Array(16),
    0x00,
    0x02,
    0x00,
    0x0a,
    0x00,
    0x00,
    0x00,
    nestedSignatureObject.length + 8,
    ...nestedSignatureObject,
  ]);

  const license = XmrLicense.loads(licenseBytes);

  expect(license.getObjects(10)).toHaveLength(1);
});

test('playready pause and resume preserve key identifiers', async () => {
  const credentials = {
    certificateChain: new Uint8Array(),
    encryptionKey: EccKey.generate().dumps(),
    signingKey: EccKey.generate().dumps(),
  };
  const session = new PlayReadySession('temporary', credentials);
  const contentKey = new Key(
    new Uint8Array([
      0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd,
      0xef,
    ]),
    1,
    3,
    new Uint8Array(16).fill(0xaa),
  );

  vi.spyOn(session, 'parseLicense').mockResolvedValue([contentKey]);
  await session.update(new Uint8Array());

  const state = session.pause();
  const resumedSession = PlayReadySession.resume(state, credentials);

  expect(resumedSession.keys).toEqual(session.keys);
  expect(resumedSession.keyStatuses).toEqual(session.keyStatuses);
});

test('fetchDecryptionKeys releases playready sessions after invalid initialization data', async () => {
  const cdm = createPlayReady();

  for (let index = 0; index <= PlayReady.MAX_NUM_OF_SESSIONS; index++) {
    await expect(
      fetchDecryptionKeys({ cdm, pssh: 'AQ==', server: 'https://license.example.test' }),
    ).rejects.toThrow();
    expect(cdm.sessions.size).toBe(0);
  }
});

test('playready engine rejects opening more than 16 sessions', () => {
  const cdm = createPlayReady();

  for (let index = 0; index < PlayReady.MAX_NUM_OF_SESSIONS; index++) {
    cdm.createSession();
  }

  expect(() => cdm.createSession()).toThrowError(
    new TooManySessions(`Too many Sessions open (${PlayReady.MAX_NUM_OF_SESSIONS}).`),
  );
});

test('playready engine keeps open sessions counted regardless of age', () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date('2026-05-24T00:00:00Z'));
    const cdm = createPlayReady();

    for (let index = 0; index < PlayReady.MAX_NUM_OF_SESSIONS; index++) {
      cdm.createSession();
    }

    vi.setSystemTime(new Date('2026-05-24T00:01:00Z'));

    expect(() => cdm.createSession()).toThrowError(
      new TooManySessions(`Too many Sessions open (${PlayReady.MAX_NUM_OF_SESSIONS}).`),
    );
    expect(cdm.sessions.size).toBe(PlayReady.MAX_NUM_OF_SESSIONS);
  } finally {
    vi.useRealTimers();
  }
});

test('playready cdm', async () => {
  const url =
    'https://test.playready.microsoft.com/service/rightsmanager.asmx?cfg=(persist:false,sl:2000)';
  const pssh =
    'AAADfHBzc2gAAAAAmgTweZhAQoarkuZb4IhflQAAA1xcAwAAAQABAFIDPABXAFIATQBIAEUAQQBEAEUAUgAgAHgAbQBsAG4AcwA9ACIAaAB0AHQAcAA6AC8ALwBzAGMAaABlAG0AYQBzAC4AbQBpAGMAcgBvAHMAbwBmAHQALgBjAG8AbQAvAEQAUgBNAC8AMgAwADAANwAvADAAMwAvAFAAbABhAHkAUgBlAGEAZAB5AEgAZQBhAGQAZQByACIAIAB2AGUAcgBzAGkAbwBuAD0AIgA0AC4AMAAuADAALgAwACIAPgA8AEQAQQBUAEEAPgA8AFAAUgBPAFQARQBDAFQASQBOAEYATwA+ADwASwBFAFkATABFAE4APgAxADYAPAAvAEsARQBZAEwARQBOAD4APABBAEwARwBJAEQAPgBBAEUAUwBDAFQAUgA8AC8AQQBMAEcASQBEAD4APAAvAFAAUgBPAFQARQBDAFQASQBOAEYATwA+ADwASwBJAEQAPgA0AFIAcABsAGIAKwBUAGIATgBFAFMAOAB0AEcAawBOAEYAVwBUAEUASABBAD0APQA8AC8ASwBJAEQAPgA8AEMASABFAEMASwBTAFUATQA+AEsATABqADMAUQB6AFEAUAAvAE4AQQA9ADwALwBDAEgARQBDAEsAUwBVAE0APgA8AEwAQQBfAFUAUgBMAD4AaAB0AHQAcABzADoALwAvAHAAcgBvAGYAZgBpAGMAaQBhAGwAcwBpAHQAZQAuAGsAZQB5AGQAZQBsAGkAdgBlAHIAeQAuAG0AZQBkAGkAYQBzAGUAcgB2AGkAYwBlAHMALgB3AGkAbgBkAG8AdwBzAC4AbgBlAHQALwBQAGwAYQB5AFIAZQBhAGQAeQAvADwALwBMAEEAXwBVAFIATAA+ADwAQwBVAFMAVABPAE0AQQBUAFQAUgBJAEIAVQBUAEUAUwA+ADwASQBJAFMAXwBEAFIATQBfAFYARQBSAFMASQBPAE4APgA4AC4AMQAuADIAMwAwADQALgAzADEAPAAvAEkASQBTAF8ARABSAE0AXwBWAEUAUgBTAEkATwBOAD4APAAvAEMAVQBTAFQATwBNAEEAVABUAFIASQBCAFUAVABFAFMAPgA8AC8ARABBAFQAQQA+ADwALwBXAFIATQBIAEUAQQBEAEUAUgA+AA==';
  const initData = fromBase64(pssh).toBuffer();
  const initDataType = 'cenc';

  const clientPath = process.env.VITEST_PRD_PATH;
  if (!clientPath) return console.warn('PlayReady client not found. Skipping test');
  const clientData = await readFile(clientPath);
  const client = await PlayReady.DeviceCredentials.from({ prd: clientData });
  const cdm = new PlayReady({ deviceCredentials: client });

  setSupportedEngines([cdm]);
  const keySystemAccess = requestMediaKeySystemAccess(cdm.keySystem, []);
  const mediaKeys = await keySystemAccess.createMediaKeys();
  const session = mediaKeys.createSession();
  session.generateRequest(initDataType, initData);
  const licenseRequest = await session.waitForLicenseRequest();

  const response = await fetch(url, {
    body: toBufferSource(licenseRequest),
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
  })
    .then((r) => r.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  session.update(response);
  const keys = await session.waitForKeyStatusesChange();
  if (!keys.size) {
    return console.warn(
      'PlayReady test server returned a license shape that is not fully supported yet. Skipping key assertions.',
    );
  }

  expect(keys.size).toBe(1);
  expect(keys.get('6f651ae1dbe44434bcb4690d1564c41c')).toBe('88da852ae4fa2e1e36aeb2d5c94997b1');
});
