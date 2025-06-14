type ContextData = { [key: string]: any };
type LengthFunc = (context: ContextData) => number;
type SwitchFunc = (context: ContextData) => any;

export type Construct<T> = {
  parse(data: Uint8Array): T;
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
  ) {}
  get context(): ContextData {
    return getContextStack(this);
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
  methods: Omit<Construct<T>, 'parse' | 'build'>,
): Construct<T> {
  return {
    ...methods,
    parse(data: Uint8Array): T {
      const context = new ParsingContext(
        new DataView(data.buffer, data.byteOffset, data.byteLength),
      );
      return methods._parse(context);
    },
    build(obj: T): Uint8Array {
      const context = new BuildingContext();
      methods._build(obj, context);
      return concatUint8Arrays(context.buffers);
    },
  };
}

export const Int16ub = createConstruct<number>({
  _parse: (ctx) => {
    checkBounds(ctx, 2);
    const v = ctx.dataView.getUint16(ctx.offset);
    ctx.offset += 2;
    return v;
  },
  _build: (v, ctx) => {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint16(0, v, false);
    ctx.buffers.push(new Uint8Array(buffer));
  },
});

export const Int32ub = createConstruct<number>({
  _parse: (ctx) => {
    checkBounds(ctx, 4);
    const v = ctx.dataView.getUint32(ctx.offset);
    ctx.offset += 4;
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
  createConstruct<Uint8Array>({
    _parse: (ctx) => {
      const len = typeof length === 'function' ? length(ctx.context) : length;

      // Log detailed context information
      console.log(
        `[Bytes-Parse] Context:`,
        JSON.stringify(ctx.context, null, 2),
      );
      console.log(
        `[Bytes-Parse] Length: ${len}, Offset: ${ctx.offset}, Total: ${ctx.dataView.byteLength}`,
      );

      if (len < 0) {
        throw new Error(`Negative length calculated: ${len}`);
      }

      if (ctx.offset + len > ctx.dataView.byteLength) {
        throw new Error(
          `Not enough data: needed ${len} bytes, only ${ctx.dataView.byteLength - ctx.offset} available`,
        );
      }

      const value = new Uint8Array(
        ctx.dataView.buffer,
        ctx.dataView.byteOffset + ctx.offset,
        len,
      );

      ctx.offset += len;
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
  createConstruct<null>({
    _parse: (ctx) => {
      const actual = new Uint8Array(
        ctx.dataView.buffer,
        ctx.dataView.byteOffset + ctx.offset,
        expected.length,
      );
      ctx.offset += expected.length;

      if (!arraysEqual(actual, expected)) {
        throw new Error(`Constant mismatch`);
      }
      return null; // Fixed to return null
    },
    _build: (_, ctx) => {
      ctx.buffers.push(expected);
    },
  });

export const Struct = <T extends ContextData>(fields: {
  [key in keyof T]: Construct<T[key]>;
}) =>
  createConstruct<T>({
    _parse: (ctx) => {
      // Create a new context that inherits from parent
      const obj: ContextData = Object.create(ctx.context);

      ctx.stack.push(obj);
      for (const key in fields) {
        obj[key] = fields[key]._parse(ctx);
      }
      ctx.stack.pop();

      return obj as T;
    },
    _build: (value, ctx) => {
      // Create a new context that inherits from parent
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
  createConstruct<T[]>({
    _parse: (ctx) => {
      const c = typeof count === 'function' ? count(ctx.context) : count;
      const items: T[] = [];

      // Create a new context for each item
      for (let i = 0; i < c; i++) {
        const itemContext = { ...ctx.context, _index: i };
        ctx.stack.push(itemContext);
        items.push(subcon._parse(ctx));
        ctx.stack.pop();
      }

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
  createConstruct<T[]>({
    _parse: (ctx) => {
      const items: T[] = [];
      while (ctx.offset < ctx.dataView.byteLength) {
        items.push(subcon._parse(ctx));
      }
      return items;
    },
    _build: (values, ctx) => {
      for (const item of values) {
        subcon._build(item, ctx);
      }
    },
  });

export const Switch = <T, K extends Construct<any>>(
  switchOn: SwitchFunc,
  cases: { [key: string]: K },
  defaultCase?: Construct<any>,
) => {
  return createConstruct<T>({
    _parse: (ctx) => {
      // Create a temporary context that includes parent context
      const tempContext = { ...ctx.context };
      ctx.stack.push(tempContext);

      try {
        const key = switchOn(tempContext);
        const subcon = cases[key] || defaultCase;
        if (!subcon) throw new Error(`Switch case not found for key: ${key}`);

        // Parse using the current context
        const result = subcon._parse(ctx);

        // Merge the result into our temporary context
        Object.assign(tempContext, result);

        return result;
      } finally {
        ctx.stack.pop();
      }
    },
    _build: (value, ctx) => {
      // Create a temporary context with merged properties
      const tempContext = { ...ctx.context, ...value };
      ctx.stack.push(tempContext);

      try {
        const key = switchOn(tempContext);
        const subcon = cases[key] || defaultCase;
        if (!subcon) throw new Error(`Switch case not found for key: ${key}`);

        subcon._build(value, ctx);
      } finally {
        ctx.stack.pop();
      }
    },
  }) as Construct<T>;
};
