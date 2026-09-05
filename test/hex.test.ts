import { expect, test } from 'vitest';
import { fromBuffer, fromHex } from '../src/lib/utils';

test.each(['z0', '0z', 'zz', 'a', 'abc', '00 00', '0x12', '-1', '00\n'])(
  'rejects invalid hex %j',
  (input) => {
    expect(() => fromHex(input)).toThrow('even number of hexadecimal digits');
  },
);

test.each(['', '00', 'aAbBcC', '0041ff'])('converts hex %j consistently', (input) => {
  const expected = Buffer.from(input, 'hex');
  const converted = fromHex(input);
  expect(converted.toBuffer()).toEqual(new Uint8Array(expected));
  expect(converted.toBase64()).toBe(expected.toString('base64'));
  expect(converted.toText()).toBe(expected.toString('utf8'));
  expect(fromBuffer(converted.toBuffer()).toHex()).toBe(input.toLowerCase());
});

test('hex conversion handles large buffers without spreading bytes onto the stack', () => {
  expect(fromHex('ab'.repeat(200_000)).toBase64()).toBe(
    Buffer.alloc(200_000, 0xab).toString('base64'),
  );
});
