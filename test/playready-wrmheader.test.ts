import { expect, test } from 'vitest';
import { bytesToBase64 } from '../src/lib/utils';
import { InvalidChecksum, InvalidWrmHeader } from '../src/lib/playready/exceptions';
import { WrmHeader } from '../src/lib/playready/wrmheader';
import { aesEcbEncrypt, createSha1 } from '../src/lib/crypto/common';

const CONTENT_KEY = new Uint8Array([
  0x88, 0xda, 0x85, 0x2a, 0xe4, 0xfa, 0x2e, 0x1e, 0x36, 0xae, 0xb2, 0xd5, 0xc9, 0x49, 0x97, 0xb1,
]);
const KEY_ID = new Uint8Array([
  0xe1, 0x1a, 0x65, 0x6f, 0xe4, 0xdb, 0x34, 0x44, 0xbc, 0xb4, 0x69, 0x0d, 0x15, 0x64, 0xc4, 0x1c,
]);

const buildWrmHeader = (version: string, keyClause: string) =>
  `<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="${version}">` +
  '<DATA>' +
  '<PROTECTINFO>' +
  keyClause +
  '</PROTECTINFO>' +
  '<LA_URL>https://example.com/license</LA_URL>' +
  '<LUI_URL>https://example.com/ui</LUI_URL>' +
  '<DS_ID>device-set</DS_ID>' +
  '<CUSTOMATTRIBUTES><Foo>Bar</Foo></CUSTOMATTRIBUTES>' +
  '<DECRYPTORSETUP>ONDEMAND</DECRYPTORSETUP>' +
  '</DATA>' +
  '</WRMHEADER>';

test('parses WRMHEADER v4.2 metadata and verifies AESCTR checksums', async () => {
  const checksum = bytesToBase64((await aesEcbEncrypt(CONTENT_KEY, KEY_ID)).subarray(0, 8));
  const header = new WrmHeader(
    buildWrmHeader(
      '4.2.0.0',
      `<KIDS><KID VALUE="${bytesToBase64(KEY_ID)}" ALGID="AESCTR" CHECKSUM="${checksum}"></KID></KIDS>`,
    ),
  );

  expect(header.version).toBe('4.2.0.0');
  expect(header.getProtocolVersion()).toBe(4);
  expect(header.laUrl).toBe('https://example.com/license');
  expect(header.luiUrl).toBe('https://example.com/ui');
  expect(header.dsId).toBe('device-set');
  expect(header.decryptorSetup).toBe('ONDEMAND');
  expect(header.customAttributes).toContain('<Foo>Bar</Foo>');
  expect(header.keyIds).toHaveLength(1);
  expect(await header.keyIds[0].verify(CONTENT_KEY)).toBe(true);
});

test('maps WRMHEADER v4.3 to PlayReady protocol version 5', () => {
  const header = new WrmHeader(
    buildWrmHeader(
      '4.3.0.0',
      `<KIDS><KID VALUE="${bytesToBase64(KEY_ID)}" ALGID="AESCTR"></KID></KIDS>`,
    ),
  );

  expect(header.getProtocolVersion()).toBe(5);
});

test('rejects invalid WRMHEADER roots', () => {
  expect(() => new WrmHeader('<NotWrmHeader />')).toThrowError(
    new InvalidWrmHeader('Data is not a valid WRMHEADER'),
  );
});

test('rejects WRMHEADER checksum verification without a checksum', async () => {
  const header = new WrmHeader(
    buildWrmHeader(
      '4.2.0.0',
      `<KIDS><KID VALUE="${bytesToBase64(KEY_ID)}" ALGID="AESCTR"></KID></KIDS>`,
    ),
  );

  await expect(header.keyIds[0].verify(CONTENT_KEY)).rejects.toThrowError(
    new InvalidChecksum('Checksum must not be empty'),
  );
});

test('verifies WRMHEADER COCKTAIL checksums without node-specific crypto', async () => {
  let checksumSource = new Uint8Array(21);
  checksumSource.set(CONTENT_KEY);
  for (let index = 0; index < 5; index++) {
    checksumSource = await createSha1(checksumSource);
  }

  const header = new WrmHeader(
    buildWrmHeader(
      '4.2.0.0',
      `<KIDS><KID VALUE="${bytesToBase64(KEY_ID)}" ALGID="COCKTAIL" CHECKSUM="${bytesToBase64(checksumSource.subarray(0, 7))}"></KID></KIDS>`,
    ),
  );

  expect(await header.keyIds[0].verify(CONTENT_KEY)).toBe(true);
});

test('decodes base64 UTF-8 and UTF-16LE headers after Unicode detection', () => {
  const xml =
    '<WRMHEADER version="4.0.0.0"><DATA><LA_URL>https://example.test/许可/😀</LA_URL></DATA></WRMHEADER>';
  for (const encoding of ['utf8', 'utf16le'] as const) {
    expect(new WrmHeader(Buffer.from(xml, encoding).toString('base64')).laUrl).toBe(
      'https://example.test/许可/😀',
    );
  }
});
