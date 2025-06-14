// construct.ts
type ContextData = { [key: string]: any };
type LengthFunc = (context: ContextData) => number;
type SwitchFunc = (context: ContextData) => any;

/**
 * The core interface for all construct objects.
 */
export type Construct<T> = {
  _name: string;
  parse(data: Uint8Array, debug?: boolean): T;
  build(obj: T): Uint8Array;
  _parse(context: ParsingContext): T;
  _build(value: T, context: BuildingContext): void;
};

function getContextStack(ctx: ParsingContext | BuildingContext): ContextData {
  return ctx.stack[ctx.stack.length - 1];
}

function checkBounds(ctx: ParsingContext, byteLength: number) {
  if (ctx.offset + byteLength > ctx.dataView.byteLength) {
    throw new Error(
      `Not enough data: needed ${byteLength} bytes, only ${
        ctx.dataView.byteLength - ctx.offset
      } available`,
    );
  }
}

class ParsingContext {
  public stack: ContextData[] = [{}];
  constructor(
    public dataView: DataView,
    public offset: number = 0,
    public debug: boolean = false,
    private logDepth: number = 0,
  ) {}

  get bytesRemaining(): number {
    return this.dataView.byteLength - this.offset;
  }

  log(message: string) {
    if (this.debug) {
      console.log(`${'  '.repeat(this.logDepth)}${message}`);
    }
  }

  enter(name: string) {
    if (!this.debug) return;
    this.log(
      `=> ${name} at offset ${this.offset} (0x${this.offset.toString(16)})`,
    );
    this.logDepth++;
  }

  leave(name: string, result?: any) {
    if (!this.debug) return;
    this.logDepth--;
    let resultStr = '';
    if (result !== undefined) {
      if (result instanceof Uint8Array) {
        const hex = Array.from(result.slice(0, 16), (byte) =>
          byte.toString(16).padStart(2, '0'),
        ).join(' ');
        resultStr = `parsed: Uint8Array(len=${result.length}) [${hex}${
          result.length > 16 ? '...' : ''
        }]`;
      } else {
        resultStr = `parsed: ${JSON.stringify(result)}`;
      }
    }
    this.log(
      `<= ${name} at new offset ${this.offset} (0x${this.offset.toString(
        16,
      )}) ${resultStr}`,
    );
  }

  get context(): ContextData {
    return getContextStack(this);
  }
}

class BuildingContext {
  public stack: ContextData[] = [{}];
  public buffers: Uint8Array[] = [];

  constructor(
    public initialObj?: ContextData,
    public debug: boolean = false,
    private logDepth: number = 0,
  ) {
    if (initialObj) {
      this.stack = [initialObj];
    }
  }

  get context(): ContextData {
    return getContextStack(this);
  }

  log(message: string) {
    if (this.debug) {
      console.log(`${'  '.repeat(this.logDepth)}${message}`);
    }
  }

  enter(name: string) {
    if (!this.debug) return;
    /* this.log(
      `=> ${name} at offset ${this.offset} (0x${this.offset.toString(16)})`,
    ); */
    this.logDepth++;
  }

  leave(name: string, result?: any) {
    if (!this.debug) return;
    this.logDepth--;
    let resultStr = '';
    if (result !== undefined) {
      if (result instanceof Uint8Array) {
        const hex = Array.from(result.slice(0, 16), (byte) =>
          byte.toString(16).padStart(2, '0'),
        ).join(' ');
        resultStr = `parsed: Uint8Array(len=${result.length}) [${hex}${
          result.length > 16 ? '...' : ''
        }]`;
      } else {
        resultStr = `parsed: ${JSON.stringify(result)}`;
      }
    }
    // this.log(
    //   `<= ${name} at new offset ${this.offset} (0x${this.offset.toString(
    //     16,
    //   )}) ${resultStr}`,
    // );
  }
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function createConstruct<T>(
  name: string,
  methods: Omit<Construct<T>, 'parse' | 'build' | '_name'>,
): Construct<T> {
  return {
    _name: name,
    ...methods,
    parse(data: Uint8Array, debug: boolean = false): T {
      const context = new ParsingContext(
        new DataView(data.buffer, data.byteOffset, data.byteLength),
        0,
        debug,
      );
      context.enter(`TopLevel<${name}>`);
      const result = this._parse(context);
      context.leave(`TopLevel<${name}>`, result);
      return result;
    },
    build(obj: T): Uint8Array {
      const context = new BuildingContext();
      this._build(obj, context);
      return concatUint8Arrays(context.buffers);
    },
  };
}

export const Int16ub = createConstruct<number>('Int16ub', {
  _parse: (ctx) => {
    ctx.enter('Int16ub');
    checkBounds(ctx, 2);
    const v = ctx.dataView.getUint16(ctx.offset, false);
    ctx.offset += 2;
    ctx.leave('Int16ub', v);
    return v;
  },
  _build: (v, ctx) => {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint16(0, v, false);
    ctx.buffers.push(new Uint8Array(buffer));
  },
});

export const Int32ub = createConstruct<number>('Int32ub', {
  _parse: (ctx) => {
    ctx.enter('Int32ub');
    checkBounds(ctx, 4);
    const v = ctx.dataView.getUint32(ctx.offset, false);
    ctx.offset += 4;
    ctx.leave('Int32ub', v);
    return v;
  },
  _build: (v, ctx) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, v, false);
    ctx.buffers.push(new Uint8Array(buffer));
  },
});

export const Bytes = (length: number | LengthFunc) =>
  createConstruct<Uint8Array>('Bytes', {
    _parse: (ctx) => {
      let len = typeof length === 'function' ? length(ctx.context) : length;
      if (typeof len !== 'number' || isNaN(len)) {
        throw new Error(
          `Invalid length for Bytes: ${len}, context: ${JSON.stringify(ctx.context)}`,
        );
      }
      ctx.enter(`Bytes(len=${len})`);
      if (len < 0) len = 0;
      checkBounds(ctx, len);
      const value = new Uint8Array(
        ctx.dataView.buffer,
        ctx.dataView.byteOffset + ctx.offset,
        len,
      );
      ctx.offset += len;
      ctx.leave('Bytes', value);
      return value;
    },
    _build: (v, ctx) => {
      const len = typeof length === 'function' ? length(ctx.context) : length;
      if (v.length !== len) {
        throw new Error(
          `Bytes length mismatch: expected ${len}, got ${v.length}`,
        );
      }
      ctx.buffers.push(v);
    },
  });

export const Const = (expected: Uint8Array) =>
  createConstruct<null>('Const', {
    _parse: (ctx) => {
      ctx.enter('Const');
      checkBounds(ctx, expected.length);
      const actual = new Uint8Array(
        ctx.dataView.buffer,
        ctx.dataView.byteOffset + ctx.offset,
        expected.length,
      );
      ctx.offset += expected.length;

      if (!arraysEqual(actual, expected)) {
        throw new Error(`Constant mismatch`);
      }
      ctx.leave('Const');
      return null;
    },
    _build: (_, ctx) => {
      ctx.buffers.push(expected);
    },
  });

export const Struct = <T extends ContextData>(fields: {
  [key in keyof T]: Construct<T[key]>;
}) =>
  createConstruct<T>('Struct', {
    _parse: (ctx) => {
      ctx.enter('Struct');
      const newContext = Object.create(ctx.context);
      ctx.stack.push(newContext);
      for (const key in fields) {
        const result = fields[key]._parse(ctx);
        newContext[key] = result;
      }
      ctx.stack.pop();
      ctx.leave('Struct', newContext);
      return Object.assign({}, newContext);
    },
    _build: (value, ctx) => {
      const mergedContext = Object.create(ctx.context);
      Object.assign(mergedContext, value);
      ctx.stack.push(mergedContext);
      for (const key in fields) {
        fields[key]._build(value[key], ctx);
      }
      ctx.stack.pop();
    },
  });

export const List = <T>(count: number | LengthFunc, subcon: Construct<T>) =>
  createConstruct<T[]>(`List<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      const c = typeof count === 'function' ? count(ctx.context) : count;
      ctx.enter(`List(count=${c})`);
      const items: T[] = [];
      for (let i = 0; i < c; i++) {
        const itemContext = { ...ctx.context, _index: i };
        ctx.stack.push(itemContext);
        items.push(subcon._parse(ctx));
        ctx.stack.pop();
      }
      ctx.leave(`List(count=${c})`, items);
      return items;
    },
    _build: (values, ctx) => {
      const c = typeof count === 'function' ? count(ctx.context) : count;
      if (values.length !== c) {
        throw new Error(
          `List length mismatch: expected ${c}, got ${values.length}`,
        );
      }
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const itemContext = { ...ctx.context, _index: i };
        ctx.stack.push(itemContext);
        subcon._build(value, ctx);
        ctx.stack.pop();
      }
    },
  });

export const GreedyRange = <T>(subcon: Construct<T>) =>
  createConstruct<T[]>(`GreedyRange<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      ctx.enter(`GreedyRange<${(subcon as any)._name}>`);
      const items: T[] = [];
      while (ctx.bytesRemaining > 0) {
        const startOffset = ctx.offset;
        try {
          const item = subcon._parse(ctx);
          items.push(item);
          if (ctx.offset === startOffset) {
            // Prevent infinite loops if subcon consumes 0 bytes
            ctx.log('Sub-parser consumed 0 bytes, breaking GreedyRange.');
            break;
          }
        } catch (e) {
          // A parsing error is a valid way to terminate the range.
          ctx.log(
            `GreedyRange terminated due to sub-parser error: ${
              e instanceof Error ? e.message : e
            }`,
          );
          break;
        }
      }
      ctx.leave(`GreedyRange<${(subcon as any)._name}>`, items);
      return items;
    },
    _build: (v, ctx) => {
      ctx.enter(`GreedyRange<${(subcon as any)._name}>`);
      for (const item of v) {
        subcon._build(item, ctx);
        // Note: A complete build implementation would also need to handle
        // adding padding back, but we're focused on parsing for now.
      }
      ctx.leave(`GreedyRange<${(subcon as any)._name}>`);
    },
  });

export const Switch = <T, K extends Construct<any>>(
  switchOn: SwitchFunc,
  cases: { [key: string]: K },
  defaultCase?: Construct<any>,
) => {
  return createConstruct<T>('Switch', {
    _parse: (ctx) => {
      const key = switchOn(ctx.context);
      ctx.enter(`Switch(key=${key})`);
      const subcon = cases[key] || defaultCase;
      if (!subcon) throw new Error(`Switch case not found for key: ${key}`);
      const result = subcon._parse(ctx);
      ctx.leave(`Switch(key=${key})`, result);
      return result;
    },
    _build: (value, ctx) => {
      const tempContext = { ...ctx.context, ...value };
      const key = switchOn(tempContext);
      ctx.enter(`Switch(key=${key})`);
      const subcon = cases[key] || defaultCase;
      if (!subcon) throw new Error(`Switch case not found for key: ${key}`);

      const buildContext = Object.create(ctx.context);
      Object.assign(buildContext, value);
      ctx.stack.push(buildContext);
      subcon._build(value, ctx);
      ctx.stack.pop();
      ctx.leave(`Switch(key=${key})`);
    },
  }) as Construct<T>;
};

export const Prefixed = <T>(length: LengthFunc, subcon: Construct<T>) =>
  createConstruct<T>(`Prefixed<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      const len = length(ctx.context);
      ctx.enter(`Prefixed(len=${len})`);
      checkBounds(ctx, len);

      // Create a new DataView and ParsingContext for the sub-parser,
      // scoped to the specified length.
      const subDataView = new DataView(
        ctx.dataView.buffer,
        ctx.dataView.byteOffset + ctx.offset,
        len,
      );
      const subContext = new ParsingContext(subDataView, 0, ctx.debug);
      subContext.stack = [...ctx.stack];

      const result = subcon._parse(subContext);

      // Advance the offset of the *main* context by the full length
      // of the prefixed section.
      ctx.offset += len;

      ctx.leave(`Prefixed(len=${len})`, result);
      return result;
    },
    _build: (v, ctx) => {
      // Build the sub-construct in a temporary context to get its buffer.
      const subBuildingContext = new BuildingContext();
      subBuildingContext.stack = [...ctx.stack];
      subcon._build(v, subBuildingContext);
      const subBuffer = concatUint8Arrays(subBuildingContext.buffers);

      // In this version of Prefixed, the length is determined by the context
      // during parsing, so we don't build a length field here. We just
      // ensure the built data is what we expect.
      ctx.buffers.push(subBuffer);
    },
  });

/**
 * Enforces that a sub-construct consumes a specific number of bytes,
 * consuming any leftover bytes as padding. The total size is determined
 * by a function that inspects the parsed data itself.
 */
export const Sized = <T>(
  subcon: Construct<T>,
  lengthFunc: (item: T) => number, // Changed signature!
) => {
  if (
    !subcon ||
    typeof subcon._parse !== 'function' ||
    typeof subcon._build !== 'function'
  ) {
    throw new Error(
      'Sized: Invalid sub-construct provided. The first argument must be a valid construct object (e.g., Struct, Bytes).',
    );
  }
  if (typeof lengthFunc !== 'function') {
    throw new Error(
      'Sized: Invalid length function provided. The second argument must be a function that returns a number.',
    );
  }
  return createConstruct<T>(`Sized<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      const startOffset = ctx.offset;
      ctx.enter(`Sized<${(subcon as any)._name}>`);

      // 1. Parse the inner content first.
      const item = subcon._parse(ctx);

      // 2. Determine the total size by inspecting the returned item.
      //    This is much cleaner and less error-prone.
      const expectedTotalSize = lengthFunc(item);

      if (typeof expectedTotalSize !== 'number' || isNaN(expectedTotalSize)) {
        throw new Error(
          `Sized: Invalid length returned by function: ${expectedTotalSize}`,
        );
      }

      const consumedSize = ctx.offset - startOffset;

      if (expectedTotalSize < consumedSize) {
        throw new Error(
          `Sized: Sub-parser consumed ${consumedSize} bytes, which is more than the expected total size of ${expectedTotalSize}.`,
        );
      }

      // 3. Calculate and consume any remaining padding.
      const paddingSize = expectedTotalSize - consumedSize;
      if (paddingSize > 0) {
        ctx.log(`Consuming ${paddingSize} bytes of padding.`);
        checkBounds(ctx, paddingSize);
        ctx.offset += paddingSize;
      }

      ctx.leave(`Sized<${(subcon as any)._name}>`, item);
      return item;
    },
    _build: (v, ctx) => {
      // This build logic now works correctly with the new signature.
      const subBuildingContext = new BuildingContext();
      subBuildingContext.stack = [...ctx.stack];
      subcon._build(v, subBuildingContext);
      const subBuffer = concatUint8Arrays(subBuildingContext.buffers);

      const expectedTotalSize = lengthFunc(v);
      const paddingSize = expectedTotalSize - subBuffer.length;

      if (paddingSize < 0) {
        throw new Error(
          `Sized build: Built data (${subBuffer.length} bytes) is larger than expected total size (${expectedTotalSize} bytes).`,
        );
      }

      ctx.buffers.push(subBuffer);
      if (paddingSize > 0) {
        ctx.buffers.push(new Uint8Array(paddingSize)); // Add zero-filled padding
      }
    },
  });
};

/**
 * A construct that wraps another, parsing the sub-construct first,
 * and then consuming any remaining "padding" bytes to fill a total
 * size. The total size is determined by a function that inspects the
 * parsed data itself.
 *
 * @param subcon The inner construct to parse.
 * @param lengthFunc A function that receives the parsed object and returns
 *   the total expected size for that object in the stream.
 */
export const Padded = <T>(
  subcon: Construct<T>,
  lengthFunc: (item: T) => number,
) =>
  createConstruct<T>(`Padded<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      const startOffset = ctx.offset;
      ctx.enter(`Padded<${(subcon as any)._name}>`);

      // 1. Parse the inner content first.
      const item = subcon._parse(ctx);

      // 2. Determine the total expected size by inspecting the parsed item.
      const expectedTotalSize = lengthFunc(item);
      if (typeof expectedTotalSize !== 'number' || isNaN(expectedTotalSize)) {
        throw new Error(
          `Padded: Invalid length returned by function: ${expectedTotalSize}`,
        );
      }

      const consumedSize = ctx.offset - startOffset;

      if (expectedTotalSize < consumedSize) {
        throw new Error(
          `Padded: Sub-parser consumed ${consumedSize} bytes, which is more than the expected total size of ${expectedTotalSize}.`,
        );
      }

      // 3. Calculate and consume any remaining padding.
      const paddingSize = expectedTotalSize - consumedSize;
      if (paddingSize > 0) {
        ctx.log(`Consuming ${paddingSize} bytes of padding.`);
        checkBounds(ctx, paddingSize);
        ctx.offset += paddingSize;
      }

      ctx.leave(`Padded<${(subcon as any)._name}>`, item);
      return item;
    },
    _build: (v, ctx) => {
      // For building, we first build the sub-construct to see how big it is,
      // then calculate and add the necessary padding.
      const subBuildingContext = new BuildingContext();
      subBuildingContext.stack = [...ctx.stack];
      subcon._build(v, subBuildingContext);
      const subBuffer = concatUint8Arrays(subBuildingContext.buffers);

      const expectedTotalSize = lengthFunc(v);
      const paddingSize = expectedTotalSize - subBuffer.length;

      if (paddingSize < 0) {
        throw new Error(
          `Padded build: Built data (${subBuffer.length} bytes) is larger than expected total size (${expectedTotalSize} bytes).`,
        );
      }

      ctx.buffers.push(subBuffer);
      if (paddingSize > 0) {
        ctx.buffers.push(new Uint8Array(paddingSize)); // Add zero-filled padding
      }
    },
  });
