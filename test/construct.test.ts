import { describe, expect, test } from 'vitest';
import {
  Int16ub,
  Int32ub,
  Bytes,
  Const,
  Struct,
  List,
  GreedyRange,
  Switch,
} from '../src/lib/construct';

describe('Construct Library', () => {
  test('Int16ub parses and builds correctly', () => {
    const value = 0x1234;
    const buffer = new Uint8Array([0x12, 0x34]);
    expect(Int16ub.parse(buffer)).toBe(value);
    expect(Int16ub.build(value)).toEqual(buffer);
  });

  test('Int32ub parses and builds correctly', () => {
    const value = 0x12345678;
    const buffer = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
    expect(Int32ub.parse(buffer)).toBe(value);
    expect(Int32ub.build(value)).toEqual(buffer);
  });

  test('Bytes with fixed length', () => {
    const fixedBytes = Bytes(3);
    const data = new Uint8Array([1, 2, 3]);
    expect(fixedBytes.parse(data)).toEqual(data);
    expect(fixedBytes.build(data)).toEqual(data);

    expect(() => fixedBytes.build(new Uint8Array([1, 2]))).toThrow(
      'Bytes length mismatch',
    );
  });

  test('Bytes with dynamic length', () => {
    const dynamicBytes = Bytes((ctx) => ctx.length);
    const input = new Uint8Array([0x00, 0x04, 1, 2, 3, 4]);
    const expectedData = new Uint8Array([1, 2, 3, 4]);

    const result = Struct({
      length: Int16ub,
      data: dynamicBytes,
    }).parse(input);

    expect(result).toEqual({
      length: 4,
      data: expectedData,
    });
  });

  test('Const validates constant values', () => {
    const magic = Const(new Uint8Array([0x4d, 0x5a]));
    const validData = new Uint8Array([0x4d, 0x5a]);
    const invalidData = new Uint8Array([0x41, 0x42]);

    expect(magic.parse(validData)).toBeNull();
    expect(() => magic.parse(invalidData)).toThrow('Constant mismatch');
    expect(magic.build(null)).toEqual(validData);
  });

  test('Struct handles nested structures', () => {
    const person = Struct({
      id: Int32ub,
      name: Bytes(5),
      age: Int16ub,
    });

    const data = new Uint8Array([
      0x00,
      0x01,
      0x02,
      0x03, // id: 0x010203
      0x4a,
      0x6f,
      0x68,
      0x6e,
      0x00, // name: "John\x00"
      0x00,
      0x21, // age: 33
    ]);

    const obj = {
      id: 0x010203,
      name: new Uint8Array([0x4a, 0x6f, 0x68, 0x6e, 0x00]),
      age: 33,
    };

    expect(person.parse(data)).toEqual(obj);
    expect(person.build(obj)).toEqual(data);
  });

  test('List with fixed count', () => {
    const list = List(3, Int16ub);
    const data = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03]);
    const expected = [1, 2, 3];

    expect(list.parse(data)).toEqual(expected);
    expect(list.build(expected)).toEqual(data);
    expect(() => list.build([1, 2])).toThrow('List length mismatch');
  });

  test('List with dynamic count', () => {
    const list = List((ctx) => ctx.count, Int16ub);
    const structure = Struct({
      count: Int16ub,
      values: list,
    });

    const data = new Uint8Array([
      0x00,
      0x03, // count: 3
      0x00,
      0x01, // value 1
      0x00,
      0x02, // value 2
      0x00,
      0x03, // value 3
    ]);

    const obj = {
      count: 3,
      values: [1, 2, 3],
    };

    expect(structure.parse(data)).toEqual(obj);
    expect(structure.build(obj)).toEqual(data);
  });

  test('GreedyRange parses until end of data', () => {
    const range = GreedyRange(Int16ub);
    const data = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03]);
    expect(range.parse(data)).toEqual([1, 2, 3]);
    expect(range.build([1, 2, 3])).toEqual(data);
  });

  test('Switch handles different cases', () => {
    // Define the parser with proper context handling
    const parser = Struct({
      type: Int16ub,
      data: Switch(
        (ctx) => ctx.type,
        {
          1: Struct({
            value: Int16ub,
          }),
          2: Struct({
            value: Int32ub,
          }),
        },
        Struct({}), // Empty struct for default case
      ),
    });

    const type1 = new Uint8Array([0x00, 0x01, 0xca, 0xfe]);
    const type2 = new Uint8Array([0x00, 0x02, 0xca, 0xfe, 0xba, 0xbe]);
    const unknown = new Uint8Array([0x00, 0x03]);

    // Parsing tests
    expect(parser.parse(type1)).toEqual({
      type: 1,
      data: { value: 0xcafe },
    });

    expect(parser.parse(type2)).toEqual({
      type: 2,
      data: { value: 0xcafebabe },
    });

    expect(parser.parse(unknown)).toEqual({
      type: 3,
      data: {},
    });

    // Building tests
    expect(
      parser.build({
        type: 1,
        data: { value: 0xcafe },
      }),
    ).toEqual(type1);

    expect(
      parser.build({
        type: 2,
        data: { value: 0xcafebabe },
      }),
    ).toEqual(type2);

    expect(
      parser.build({
        type: 3,
        data: {},
      }),
    ).toEqual(unknown);
  });

  test('Context propagation in nested structs', () => {
    const parser = Struct({
      header: Struct({
        type: Int16ub,
        length: Int16ub,
      }),
      data: Switch(
        (ctx) => ctx.header.type, // Access type through header
        {
          1: Struct({
            value: Int32ub,
            extra: Bytes((ctx) => ctx.header.length - 4), // Access length through header
          }),
          2: Struct({
            count: Int16ub,
            items: List((ctx) => ctx.count, Int16ub),
          }),
        },
      ),
    });

    // Type 1
    const type1Data = new Uint8Array([
      0x00,
      0x01, // type = 1
      0x00,
      0x08, // length = 8
      0x12,
      0x34,
      0x56,
      0x78, // value
      0xaa,
      0xbb,
      0xcc,
      0xdd, // extra (4 bytes)
    ]);

    expect(parser.parse(type1Data)).toEqual({
      header: { type: 1, length: 8 },
      data: {
        value: 0x12345678,
        extra: new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]),
      },
    });

    // Type 2
    const type2Data = new Uint8Array([
      0x00,
      0x02, // type = 2
      0x00,
      0x06, // length = 6
      0x00,
      0x02, // count = 2
      0x00,
      0x0a, // item1 = 10
      0x00,
      0x14, // item2 = 20
    ]);

    expect(parser.parse(type2Data)).toEqual({
      header: { type: 2, length: 6 },
      data: {
        count: 2,
        items: [10, 20],
      },
    });
  });
});
