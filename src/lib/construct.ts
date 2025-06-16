type ContextData = { [key: string]: any };
type LengthFunc = (context: ContextData) => number;
type SwitchFunc = (context: ContextData) => any;

interface PrivateSchema<T> {
  _parse(context: ParsingContext): T;
  _build(value: T, context: BuildingContext): void;
  [method: string]: any;
}

interface PublicSchema<T> {
  parse(data: Uint8Array, debug?: boolean): T;
  build(obj: T, debug?: boolean): Uint8Array;
}

export type Schema<T> = {
  _name: string;
} & PrivateSchema<T> &
  PublicSchema<T>;

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
        resultStr = `parsed: ${JSON.stringify(result).slice(0, 64)}...`;
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

  enter(name: string, value?: any) {
    if (!this.debug) return;
    let valueStr = '';
    if (value !== undefined) {
      if (value instanceof Uint8Array) {
        valueStr = ` with value: Uint8Array(len=${value.length})`;
      } else {
        const json = JSON.stringify(value);
        // Truncate long JSON strings to keep logs clean
        valueStr = ` with value: ${
          json.length > 120 ? json.substring(0, 117) + '...' : json
        }`;
      }
    }
    this.log(`=> Building ${name}${valueStr}`);
    this.logDepth++;
  }

  leave(name: string, bytesWritten?: number) {
    if (!this.debug) return;
    this.logDepth--;
    const bytesStr =
      bytesWritten !== undefined ? ` (wrote ${bytesWritten} bytes)` : '';
    this.log(`<= Finished Building ${name}${bytesStr}`);
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

function createSchema<T>(name: string, methods: PrivateSchema<T>): Schema<T> {
  return {
    ...methods,
    _name: name,
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
    build(obj: T, debug: boolean = false): Uint8Array {
      const context = new BuildingContext(undefined, debug);
      context.enter(`TopLevel<${name}>`, obj);
      this._build(obj, context);
      const finalBuffer = concatUint8Arrays(context.buffers);
      context.leave(`TopLevel<${name}>`, finalBuffer.length);
      return finalBuffer;
    },
  };
}

export const Uint8 = () => {
  return createSchema<number>('Uint8', {
    _parse: (ctx) => {
      ctx.enter('Uint8');
      checkBounds(ctx, 1);
      const v = ctx.dataView.getUint8(ctx.offset);
      ctx.offset += 1;
      ctx.leave('Uint8', v);
      return v;
    },
    _build: (v, ctx) => {
      ctx.enter('Uint8', v);
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setUint8(0, v);
      ctx.buffers.push(new Uint8Array(buffer));
      ctx.leave('Uint8', 1);
    },
  });
};

export const Uint16 = (littleEndian: boolean = false) => {
  return createSchema<number>('Uint16', {
    _parse: (ctx) => {
      ctx.enter('Uint16');
      checkBounds(ctx, 2);
      const v = ctx.dataView.getUint16(ctx.offset, littleEndian);
      ctx.offset += 2;
      ctx.leave('Uint16', v);
      return v;
    },
    _build: (v, ctx) => {
      ctx.enter('Uint16', v);
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, v, littleEndian);
      ctx.buffers.push(new Uint8Array(buffer));
      ctx.leave('Uint16', 2);
    },
  });
};

export const Uint32 = (littleEndian: boolean = false) => {
  return createSchema<number>('Int32ub', {
    _parse: (ctx) => {
      ctx.enter('Int32ub');
      checkBounds(ctx, 4);
      const v = ctx.dataView.getUint32(ctx.offset, littleEndian);
      ctx.offset += 4;
      ctx.leave('Int32ub', v);
      return v;
    },
    _build: (v, ctx) => {
      ctx.enter('Int32ub', v);
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, v, littleEndian);
      ctx.buffers.push(new Uint8Array(buffer));
      ctx.leave('Int32ub', 4);
    },
  });
};

export const Bytes = (length: number | LengthFunc) =>
  createSchema<Uint8Array>('Bytes', {
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
      ctx.enter(`Bytes(len=${len})`, v);
      if (v.length !== len) {
        throw new Error(
          `Bytes length mismatch: expected ${len}, got ${v.length}`,
        );
      }
      ctx.buffers.push(v);
      ctx.leave(`Bytes(len=${len})`, v.length);
    },
  });

export const Const = (expected: Uint8Array | string) => {
  const data =
    typeof expected === 'string'
      ? new TextEncoder().encode(expected)
      : expected;
  return createSchema<Uint8Array>('Const', {
    _parse: (ctx) => {
      ctx.enter('Const');
      checkBounds(ctx, data.length);
      const actual = new Uint8Array(
        ctx.dataView.buffer,
        ctx.dataView.byteOffset + ctx.offset,
        data.length,
      );
      ctx.offset += data.length;

      if (!arraysEqual(actual, data)) {
        throw new Error(
          `Constant mismatch: expected [${expected}] but got [${actual}]`,
        );
      }
      ctx.leave('Const', data);
      return data;
    },
    _build: (value, ctx) => {
      ctx.enter('Const', value);
      if (value && !arraysEqual(value, data)) {
        throw new Error(
          `Const build mismatch: expected [${expected}] but got [${value}]`,
        );
      }
      ctx.buffers.push(data);
      ctx.leave('Const', data.length);
    },
  });
};

export const Struct = <T extends ContextData>(fields: {
  [key in keyof T]: Schema<T[key]>;
}) =>
  createSchema<T>('Struct', {
    _parse: (ctx) => {
      ctx.enter('Struct');
      const newContext = Object.create(ctx.context);
      ctx.stack.push(newContext);
      for (const key in fields) {
        const result = fields[key]._parse(ctx);
        newContext[key] = result;
      }
      ctx.stack.pop();
      const finalResult = Object.assign({}, newContext);
      ctx.leave('Struct', finalResult);
      return finalResult;
    },
    _build: (value, ctx) => {
      ctx.enter('Struct', value);
      const mergedContext = Object.create(ctx.context);
      Object.assign(mergedContext, value);
      ctx.stack.push(mergedContext);
      for (const key in fields) {
        fields[key]._build(value[key], ctx);
      }
      ctx.stack.pop();
      ctx.leave('Struct');
    },
  });

export const List = <T>(subcon: Schema<T>, count: number | LengthFunc = 1) => {
  const schema = createSchema<T[]>(`List<${(subcon as any)._name}>`, {
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
      ctx.enter(`List(count=${values.length})`, values);
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
      ctx.leave(`List(count=${values.length})`, values.length);
    },
  });

  const extensions = {
    length: (value: number | LengthFunc) => {
      count = value;
      return schema;
    },
  };

  return {
    ...schema,
    ...extensions,
  } as Schema<T[]> & typeof extensions;
};

export const GreedyRange = <T>(subcon: Schema<T>) =>
  createSchema<T[]>(`GreedyRange<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      ctx.enter(`GreedyRange<${(subcon as any)._name}>`);
      const items: T[] = [];
      while (ctx.bytesRemaining > 0) {
        // This is the offset before we ATTEMPT to parse the next item.
        const startOffset = ctx.offset;
        try {
          const item = subcon._parse(ctx);
          items.push(item);
          if (ctx.offset === startOffset) {
            ctx.log('Sub-parser consumed 0 bytes, breaking GreedyRange.');
            break;
          }
        } catch (e) {
          ctx.log(
            `GreedyRange terminated due to sub-parser error: ${
              e instanceof Error ? e.message : e
            }`,
          );
          ctx.offset = startOffset;
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
      }
      ctx.leave(`GreedyRange<${(subcon as any)._name}>`);
    },
  });

export const Switch = <T, K extends Schema<any>>(
  switchOn: SwitchFunc,
  cases: { [key: string]: K },
  defaultCase?: Schema<any>,
) => {
  return createSchema<T>('Switch', {
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
  }) as K;
};

export const Prefixed = <T>(length: LengthFunc, subcon: Schema<T>) =>
  createSchema<T>(`Prefixed<${(subcon as any)._name}>`, {
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
  subcon: Schema<T>,
  lengthFunc: (item: T) => number,
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
  return createSchema<T>(`Sized<${(subcon as any)._name}>`, {
    _parse: (ctx) => {
      const startOffset = ctx.offset;
      ctx.enter(`Sized<${(subcon as any)._name}>`);
      const item = subcon._parse(ctx);
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
      ctx.enter(`Sized<${(subcon as any)._name}>`, v);
      const subBuildingContext = new BuildingContext(undefined, ctx.debug);
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
        ctx.buffers.push(new Uint8Array(paddingSize));
      }
      ctx.leave(
        `Sized<${(subcon as any)._name}>`,
        subBuffer.length + paddingSize,
      );
    },
  });
};

export const b = {
  uint8: Uint8,
  uint16: Uint16,
  uint32: Uint32,
  literal: Const,
  object: Struct,
  array: List,
  bytes: Bytes,

  switch: Switch,
  sized: Sized,
  prefixed: Prefixed,
  greedyRange: GreedyRange,
};
