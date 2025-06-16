import { describe, expect, it, test } from 'vitest';
import { b } from '../src/lib/construct';

describe('Construct Library', () => {
  test('Int16ub parses and builds correctly', () => {
    const value = 0x1234;
    const buffer = new Uint8Array([0x12, 0x34]);
    expect(b.uint16().parse(buffer)).toBe(value);
    expect(b.uint16().build(value)).toEqual(buffer);
  });

  test('Int32ub parses and builds correctly', () => {
    const value = 0x12345678;
    const buffer = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
    expect(b.uint32().parse(buffer)).toBe(value);
    expect(b.uint32().build(value)).toEqual(buffer);
  });

  test('Bytes with fixed length', () => {
    const fixedBytes = b.bytes(3);
    const data = new Uint8Array([1, 2, 3]);
    expect(fixedBytes.parse(data)).toEqual(data);
    expect(fixedBytes.build(data)).toEqual(data);

    expect(() => fixedBytes.build(new Uint8Array([1, 2]))).toThrow(
      'Bytes length mismatch',
    );
  });

  test('Bytes with dynamic length', () => {
    const dynamicBytes = b.bytes((ctx) => ctx.length);
    const input = new Uint8Array([0x00, 0x04, 1, 2, 3, 4]);
    const expectedData = new Uint8Array([1, 2, 3, 4]);

    const result = b
      .object({
        length: b.uint16(),
        data: dynamicBytes,
      })
      .parse(input);

    expect(result).toEqual({
      length: 4,
      data: expectedData,
    });
  });

  test('Const validates constant values', () => {
    const magic = b.literal(new Uint8Array([0x4d, 0x5a]));
    const invalidData = new Uint8Array([0x41, 0x42]);

    expect(() => magic.parse(invalidData)).toThrow('Constant mismatch');
  });

  test('Struct handles nested structures', () => {
    const person = b.object({
      id: b.uint32(),
      name: b.bytes(5),
      age: b.uint16(),
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
    const list = b.array(b.uint16(), 3);
    const data = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03]);
    const expected = [1, 2, 3];

    expect(list.parse(data)).toEqual(expected);
    expect(list.build(expected)).toEqual(data);
    expect(() => list.build([1, 2])).toThrow('List length mismatch');
  });

  test('List with dynamic count', () => {
    const list = b.array(b.uint16(), (ctx) => ctx.count);
    const structure = b.object({
      count: b.uint16(),
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
    const range = b.greedyRange(b.uint16());
    const data = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03]);
    expect(range.parse(data)).toEqual([1, 2, 3]);
    expect(range.build([1, 2, 3])).toEqual(data);
  });

  test('Switch handles different cases', () => {
    // Define the parser with proper context handling
    const parser = b.object({
      type: b.uint16(),
      data: b.switch(
        (ctx) => ctx.type,
        {
          1: b.object({
            value: b.uint16(),
          }),
          2: b.object({
            value: b.uint32(),
          }),
        },
        b.object({}), // Empty struct for default case
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
    const parser = b.object({
      header: b.object({
        type: b.uint16(),
        length: b.uint16(),
      }),
      data: b.switch(
        (ctx) => ctx.header.type, // Access type through header
        {
          1: b.object({
            value: b.uint32(),
            extra: b.bytes((ctx) => ctx.header.length - 4), // Access length through header
          }),
          2: b.object({
            count: b.uint16(),
            items: b.array(b.uint16(), (ctx) => ctx.count),
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

describe('Sized Construct with GreedyRange', () => {
  test('should correctly parse items with padding by respecting the item length', () => {
    // ARRANGE
    const PaddedItem = b.sized(
      b.object({
        total_length: b.uint32(),
        data: b.uint32(),
      }),
      (item) => item.total_length, // The function now receives the parsed item
    );

    const PaddedListParser = b.greedyRange(PaddedItem);

    const binaryData = new Uint8Array([
      // Item 1 (12 bytes total)
      0x00,
      0x00,
      0x00,
      0x0c, // total_length = 12
      0x00,
      0x00,
      0x04,
      0xd2, // data = 1234
      0xff,
      0xff,
      0xff,
      0xff, // 4 bytes of padding
      // Item 2 (8 bytes total)
      0x00,
      0x00,
      0x00,
      0x08, // total_length = 8
      0x00,
      0x00,
      0x16,
      0x2e, // data = 5678
    ]);

    // ACT
    const result = PaddedListParser.parse(binaryData, true);

    // ASSERT
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ total_length: 12, data: 1234 });
    expect(result[1]).toEqual({ total_length: 8, data: 5678 });
  });
});

describe('Sized Construct', () => {
  // Keep your existing happy path test!
  it('should correctly parse a sized item when used correctly', () => {
    const PaddedItem = b.sized(
      b.object({ total_length: b.uint32(), data: b.uint32() }),
      (item) => item.total_length,
    );
    const result = PaddedItem.parse(
      new Uint8Array([0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x16, 0x2e]),
    );
    expect(result).toEqual({ total_length: 8, data: 5678 });
  });

  // --- NEW "SAD PATH" TESTS ---
  it('should throw a helpful error if arguments are swapped', () => {
    const MyStruct = b.object({ total_length: b.uint32(), data: b.uint32() });
    const myLengthFunc = (item: any) => item.total_length;

    // We expect this to throw because the first argument is a function, not a construct.
    const action = () => b.sized(myLengthFunc as any, MyStruct as any);

    expect(action).toThrow(
      'Sized: Invalid sub-construct provided. The first argument must be a valid construct object (e.g., Struct, Bytes).',
    );
  });

  it('should throw a helpful error if the length function is not a function', () => {
    const MyStruct = b.object({ total_length: b.uint32(), data: b.uint32() });

    // We expect this to throw because the second argument is an object, not a function.
    const action = () => b.sized(MyStruct, { not: 'a function' } as any);

    expect(action).toThrow(
      'Sized: Invalid length function provided. The second argument must be a function that returns a number.',
    );
  });
});

describe('Construct Build and Symmetry Tests', () => {
  it('Int32ub should build and parse symmetrically', () => {
    // Arrange
    const parser = b.uint32();
    const obj = 123456789;
    const expectedBytes = new Uint8Array([0x07, 0x5b, 0xcd, 0x15]);

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(expectedBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);
  });

  it('Bytes should build and parse symmetrically', () => {
    // Arrange
    const parser = b.bytes(4);
    const obj = new Uint8Array([1, 2, 3, 4]);
    const expectedBytes = new Uint8Array([1, 2, 3, 4]);

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(expectedBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);
  });

  it('Const should build and parse symmetrically', () => {
    // Arrange
    const constantBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const parser = b.literal(constantBytes);
    const obj = constantBytes; // The object to build is the constant itself

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(constantBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);

    // Sad Path: Assert that building with the wrong value throws an error
    const wrongBytes = new Uint8Array([1, 2, 3, 4]);
    expect(() => parser.build(wrongBytes)).toThrow('Const build mismatch');
  });

  it('Struct should build and parse symmetrically', () => {
    // Arrange
    const parser = b.object({
      magic: b.uint16(),
      value: b.uint32(),
    });
    const obj = { magic: 0xcafe, value: 42 };
    const expectedBytes = new Uint8Array([0xca, 0xfe, 0x00, 0x00, 0x00, 0x2a]);

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(expectedBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);
  });

  it('List should build and parse symmetrically', () => {
    // Arrange
    const parser = b.array(b.uint16(), 3);
    const obj = [10, 20, 30];
    const expectedBytes = new Uint8Array([0x00, 0x0a, 0x00, 0x14, 0x00, 0x1e]);

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(expectedBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);

    // Sad Path: Assert that building with the wrong length throws
    expect(() => parser.build([1, 2])).toThrow('List length mismatch');
  });

  it('GreedyRange should build and parse symmetrically', () => {
    // Arrange
    const parser = b.greedyRange(b.uint16());
    const obj = [10, 20, 30];
    const expectedBytes = new Uint8Array([0x00, 0x0a, 0x00, 0x14, 0x00, 0x1e]);

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(expectedBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);
  });

  it('Prefixed should build and parse symmetrically', () => {
    // Arrange
    const innerStruct = b.object({ a: b.uint16(), b: b.uint16() });
    // The length function is only used for parsing.
    const parser = b.prefixed((ctx) => 4, innerStruct);
    const obj = { a: 1, b: 2 };
    // The build method for our Prefixed just builds the inner content.
    const expectedBytes = new Uint8Array([0x00, 0x01, 0x00, 0x02]);

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(expectedBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);
  });

  it('Sized should build and parse symmetrically', () => {
    // Arrange
    const parser = b.sized(
      b.object({
        total_length: b.uint32(),
        data: b.uint32(),
      }),
      (item) => item.total_length,
    );
    const obj = { total_length: 12, data: 1234 };
    const expectedBytes = new Uint8Array([
      0x00,
      0x00,
      0x00,
      0x0c, // total_length = 12
      0x00,
      0x00,
      0x04,
      0xd2, // data = 1234
      0x00,
      0x00,
      0x00,
      0x00, // 4 bytes of padding
    ]);

    // Act: Build
    const built = parser.build(obj);

    // Assert: Build
    expect(built).toEqual(expectedBytes);

    // Act & Assert: Parse (Symmetry)
    const parsed = parser.parse(built);
    expect(parsed).toEqual(obj);
  });

  it('Switch should build and parse symmetrically', () => {
    // Arrange
    const parser = b.object({
      type: b.uint16(),
      data: b.switch((ctx) => ctx.type, {
        1: b.uint32(),
        2: b.bytes(4),
      }),
    });

    // Case 1
    const obj1 = { type: 1, data: 9999 };
    const expectedBytes1 = new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x27, 0x0f]);

    // Case 2
    const obj2 = { type: 2, data: new Uint8Array([1, 2, 3, 4]) };
    const expectedBytes2 = new Uint8Array([0x00, 0x02, 1, 2, 3, 4]);

    // Act & Assert: Case 1
    const built1 = parser.build(obj1);
    expect(built1).toEqual(expectedBytes1);
    const parsed1 = parser.parse(built1);
    expect(parsed1).toEqual(obj1);

    // Act & Assert: Case 2
    const built2 = parser.build(obj2);
    expect(built2).toEqual(expectedBytes2);
    const parsed2 = parser.parse(built2);
    expect(parsed2).toEqual(obj2);
  });
});

describe('GreedyRange with Transactional Failure', () => {
  // Define a sub-construct that can fail partway through.
  // It reads 2 bytes of data, then expects a 2-byte signature.
  const FailableItem = b.object({
    data: b.uint16(),
    signature: b.literal(new Uint8Array([0xaa, 0xbb])),
  });

  it('should parse a simple list of valid items correctly', () => {
    // HAPPY PATH TEST
    // Arrange
    const parser = b.greedyRange(FailableItem);
    const binaryData = new Uint8Array([
      // Item 1
      0x00, 0x01, 0xaa, 0xbb,
      // Item 2
      0x00, 0x02, 0xaa, 0xbb,
    ]);
    const expectedSignature = new Uint8Array([0xaa, 0xbb]);

    // Act
    const result = parser.parse(binaryData);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ data: 1, signature: expectedSignature });
    expect(result[1]).toEqual({ data: 2, signature: expectedSignature });
  });

  it('should roll back the stream offset on a partial sub-parse failure', () => {
    // SAD PATH TEST (Bug Reproduction)
    // Arrange
    const parser = b.object({
      items: b.greedyRange(FailableItem),
      trailer: b.uint16(), // A field to parse *after* the range
    });

    const binaryData = new Uint8Array([
      // Item 1 (Valid)
      0x00, 0x01, 0xaa, 0xbb,
      // Trailer data that should be parsed correctly
      0xee, 0xff,
      // Garbage data that will cause the *next* FailableItem parse to fail
      // It will read 0x1122 as `data`, then fail the `Const` check.
      0x11, 0x22, 0xcc, 0xdd,
    ]);

    // Act
    const result = parser.parse(binaryData);

    // Assert
    // 1. It should have found only the one valid item.
    expect(result.items).toHaveLength(1);
    expect(result.items[0].data).toBe(1);

    // 2. This is the crucial check. If the offset was rolled back correctly
    //    after the failed attempt, the trailer should be parsed from the
    //    correct position (byte 4) and have the value 0xEEFF.
    //    If the bug existed, the offset would be left at byte 8, and the
    //    trailer would be parsed incorrectly as 0xCCDD.
    expect(result.trailer).toBe(0xeeff); // 61183 in decimal
  });
});
