import { expect, test } from 'vitest';
import { isClearKeyRequest, parseClearKeyResponse } from '../src/extension/utils/clearkey';

const key = { kty: 'oct', kid: 'LwVHf8JLtPrv2GUXFW2v_A', k: 'tQ0bJVWb6b0KPL6KtZIy_A' };
const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));

test('decodes multiple ClearKey keys and respects response view bounds', () => {
  const response = encode({ keys: [key, { ...key, kid: '-_8' }], type: 'temporary' });
  const backing = new Uint8Array(response.length + 2);
  backing.set(response, 1);
  const expected = [
    { id: '2f05477fc24bb4faefd86517156daffc', value: 'b50d1b25559be9bd0a3cbe8ab59232fc' },
    { id: 'fbff', value: 'b50d1b25559be9bd0a3cbe8ab59232fc' },
  ];
  for (const input of [
    response.buffer,
    backing.subarray(1, -1),
    new DataView(backing.buffer, 1, response.length),
  ]) {
    expect(parseClearKeyResponse(input)).toEqual(expected);
  }
});

test.each([
  null,
  {},
  { kids: [key.kid] },
  { keys: [null] },
  ...[{ kty: 'RSA' }, { kid: 'a' }, { kid: '+/8=' }, { k: 'AA' }, { k: '' }, { k: 123 }].map(
    (invalid) => ({ keys: [{ ...key, ...invalid }] }),
  ),
  { keys: [key, { ...key, k: 'invalid' }] },
  { keys: [key], type: 'invalid' },
])('ignores malformed ClearKey response %j without partial results', (response) => {
  expect(parseClearKeyResponse(encode(response))).toBeUndefined();
});

test('ignores binary licenses, invalid JSON, and empty key sets', () => {
  expect(parseClearKeyResponse(new Uint8Array([8, 2, 255]))).toBeUndefined();
  expect(parseClearKeyResponse(new TextEncoder().encode('{'))).toBeUndefined();
  expect(parseClearKeyResponse(encode({ keys: [] }))).toEqual([]);
});

test('recognizes ClearKey requests without mistaking init data or binary challenges for them', () => {
  expect(isClearKeyRequest(encode({ kids: [key.kid], type: 'temporary' }))).toBe(true);
  expect(isClearKeyRequest(encode({ kids: [key.kid], type: 'persistent-license' }))).toBe(true);
  for (const data of [
    null,
    { kids: [key.kid] },
    { kids: [], type: 'temporary' },
    { kids: [123], type: 'temporary' },
    { keys: [key] },
  ]) {
    expect(isClearKeyRequest(encode(data))).toBe(false);
  }
  expect(isClearKeyRequest(new Uint8Array([8, 1, 255]))).toBe(false);
});
