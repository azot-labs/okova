// construct.ts
type ContextData = { [key: string]: any };
type LengthFunc = (context: ContextData) => number;
type SwitchFunc = (context: ContextData) => any;

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
      `Not enough data: needed ${byteLength} bytes, only ${ctx.dataView.byteLength - ctx.offset} available`,
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
        resultStr = `parsed: Uint8Array(len=${result.length}) [${hex}${result.length > 16 ? '...' : ''}]`;
      } else {
        resultStr = `parsed: ${JSON.stringify(result)}`;
      }
    }
    this.log(
      `<= ${name} at new offset ${this.offset} (0x${this.offset.toString(16)}) ${resultStr}`,
    );
  }

  get context(): ContextData {
    return getContextStack(this);
  }

  get bytesRemaining(): number {
    return this.dataView.byteLength - this.offset;
  }
}

class BuildingContext {
  public stack: ContextData[] = [{}];
  public buffers: Uint8Array[] = [];
  constructor(initialObj?: ContextData) {
    if (initialObj) {
      this.stack = [initialObj];
    }
  }
  get context(): ContextData {
    return getContextStack(this);
  }
}

// Uint8Array utilities
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
      methods._build(obj, context);
      return concatUint8Arrays(context.buffers);
    },
  };
}

export const Int16ub = createConstruct<number>('Int16ub', {
  _parse: (ctx) => {
    ctx.enter('Int16ub');
    checkBounds(ctx, 2);
    const v = ctx.dataView.getUint16(ctx.offset);
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
    const v = ctx.dataView.getUint32(ctx.offset, false); // Explicitly big-endian
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
      const len = typeof length === 'function' ? length(ctx.context) : length;
      ctx.enter(`Bytes(len=${len})`);

      if (typeof len !== 'number' || isNaN(len)) {
        throw new Error(`Invalid length for Bytes: ${len}`);
      }
      if (len < 0) {
        // As per your original code, treat negative as zero
        ctx.leave('Bytes', new Uint8Array(0));
        return new Uint8Array(0);
      }
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
      return null; // Fixed to return null
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
      // Create a new object that inherits from the parent context.
      // This object will be both our result and the context for our children.
      const newContext = Object.create(ctx.context);

      // Push this new context onto the stack.
      ctx.stack.push(newContext);

      // Parse each field. The result will be added to newContext.
      for (const key in fields) {
        const result = fields[key]._parse(ctx);
        // Assign the parsed value. It will now be visible to subsequent fields.
        newContext[key] = result;
      }

      // Pop our context from the stack.
      ctx.stack.pop();

      ctx.leave('Struct');
      // Return a plain object copy of our context to prevent prototype chain leakage.
      return Object.assign({}, newContext);
    },
    _build: (value, ctx) => {
      // The build logic was mostly correct.
      // Create a new context that inherits from parent and includes the new value.
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
  createConstruct<T[]>('List', {
    _parse: (ctx) => {
      ctx.enter('List');
      const c = typeof count === 'function' ? count(ctx.context) : count;
      const items: T[] = [];

      // Create a new context for each item
      for (let i = 0; i < c; i++) {
        const itemContext = { ...ctx.context, _index: i };
        ctx.stack.push(itemContext);
        items.push(subcon._parse(ctx));
        ctx.stack.pop();
      }

      ctx.leave('List');
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

      // Loop as long as there are bytes left in the current context's view.
      while (ctx.bytesRemaining > 0) {
        const startOffset = ctx.offset;
        try {
          const item = subcon._parse(ctx);
          items.push(item);
          // This prevents an infinite loop if a sub-parser consumes 0 bytes.
          if (ctx.offset === startOffset) {
            break;
          }
        } catch (e) {
          // A parsing error (e.g., failed Const check) is a valid way to end the range.
          // We break the loop instead of throwing the error.
          break;
        }
      }
      ctx.leave(`GreedyRange<${(subcon as any)._name}>`, items);
      return items;
    },
    _build: (v, ctx) => {
      // ctx.enter(`GreedyRange<${(subcon as any)._name}>`);
      for (const item of v) {
        subcon._build(item, ctx);
      }
      // ctx.leave(`GreedyRange<${(subcon as any)._name}>`);
    },
  });

export const Switch = <T, K extends Construct<any>>(
  switchOn: SwitchFunc,
  cases: { [key: string]: K },
  defaultCase?: Construct<any>,
) => {
  return createConstruct<T>('Switch', {
    _parse: (ctx) => {
      ctx.enter('Switch');
      // Use the current context directly to get the key.
      const key = switchOn(ctx.context);
      const subcon = cases[key] || defaultCase;

      if (!subcon) {
        throw new Error(`Switch case not found for key: ${key}`);
      }

      // Parse using the selected sub-construct. No new context stack is needed here.
      ctx.leave('Switch');
      return subcon._parse(ctx);
    },
    _build: (value, ctx) => {
      // The build logic can also be slightly simplified.
      const tempContext = { ...ctx.context, ...value };

      // No need to push to the stack here if the sub-constructs
      // handle their own context correctly.
      const key = switchOn(tempContext);
      const subcon = cases[key] || defaultCase;

      if (!subcon) {
        throw new Error(`Switch case not found for key: ${key}`);
      }

      // We pass a context that has the value's properties merged in.
      const buildContext = Object.create(ctx.context);
      Object.assign(buildContext, value);
      ctx.stack.push(buildContext);

      subcon._build(value, ctx);

      ctx.stack.pop();
    },
  }) as Construct<T>;
};
