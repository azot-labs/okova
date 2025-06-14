type ContextData = { [key: string]: any };
type LengthFunc = (context: ContextData) => number;
type SwitchFunc = (context: ContextData) => any;

export type Construct<T> = {
  parse(data: Uint8Array): T;
  build(obj: T): Uint8Array;
  _parse(context: ParsingContext): T;
  _build(value: T, context: BuildingContext): void;
};

class ParsingContext {
  public stack: ContextData[] = [{}];
  constructor(
    public dataView: DataView,
    public offset: number = 0,
  ) {}
  get context(): ContextData {
    return this.stack[this.stack.length - 1];
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
    return this.stack[this.stack.length - 1];
  }
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
      return this._parse(context);
    },
    build(obj: T): Uint8Array {
      const context = new BuildingContext(obj);
      this._build(obj, context);
      return Buffer.concat(context.buffers);
    },
  };
}

export const Int16ub = createConstruct<number>({
  _parse: (ctx) => {
    const v = ctx.dataView.getUint16(ctx.offset);
    ctx.offset += 2;
    return v;
  },
  _build: (v, ctx) => {
    const b = Buffer.alloc(2);
    b.writeUInt16BE(v, 0);
    ctx.buffers.push(b);
  },
});

export const Int32ub = createConstruct<number>({
  _parse: (ctx) => {
    const v = ctx.dataView.getUint32(ctx.offset);
    ctx.offset += 4;
    return v;
  },
  _build: (v, ctx) => {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(v, 0);
    ctx.buffers.push(b);
  },
});

export const Bytes = (length: number | LengthFunc) =>
  createConstruct<Uint8Array>({
    _parse: (ctx) => {
      const len = typeof length === 'function' ? length(ctx.context) : length;
      const value = new Uint8Array(
        ctx.dataView.buffer,
        ctx.dataView.byteOffset + ctx.offset,
        len,
      );
      ctx.offset += len;
      return value;
    },
    _build: (v, ctx) => ctx.buffers.push(v),
  });

export const Const = (expected: Uint8Array) =>
  createConstruct<Uint8Array>({
    _parse: (ctx) => {
      const data = Bytes(expected.length)._parse(ctx);
      if (Buffer.compare(data, expected) !== 0)
        throw new Error(`Constant mismatch`);
      return data;
    },
    _build: (v, ctx) => ctx.buffers.push(expected),
  });

export const Struct = <T extends ContextData>(fields: {
  [key in keyof T]: Construct<T[key]>;
}) =>
  createConstruct<T>({
    _parse: (ctx) => {
      const newContext = {} as T;
      ctx.stack.push(newContext);
      for (const key in fields) {
        (newContext as any)[key] = fields[key]._parse(ctx);
      }
      ctx.stack.pop();
      return newContext;
    },
    _build: (v, ctx) => {
      ctx.stack.push(v);
      for (const key in fields) {
        fields[key]._build(v[key], ctx);
      }
      ctx.stack.pop();
    },
  });

export const List = <T>(count: number | LengthFunc, subcon: Construct<T>) =>
  createConstruct<T[]>({
    _parse: (ctx) => {
      const c = typeof count === 'function' ? count(ctx.context) : count;
      return Array.from({ length: c }, () => subcon._parse(ctx));
    },
    _build: (v, ctx) => v.forEach((item) => subcon._build(item, ctx)),
  });

export const GreedyRange = <T>(subcon: Construct<T>) =>
  createConstruct<T[]>({
    _parse: (ctx) => {
      const items: T[] = [];
      while (ctx.offset < ctx.dataView.byteLength)
        items.push(subcon._parse(ctx));
      return items;
    },
    _build: (v, ctx) => v.forEach((item) => subcon._build(item, ctx)),
  });

export const Switch = <T, K extends Construct<any>>(
  switchOn: SwitchFunc,
  cases: { [key: string]: K },
  defaultCase?: Construct<any>,
) => {
  return createConstruct<T>({
    _parse: (ctx) => {
      const key = switchOn(ctx.context);
      const subcon = cases[key] || defaultCase;
      if (!subcon) throw new Error(`Switch case not found for key: ${key}`);
      return subcon._parse(ctx);
    },
    _build: (v, ctx) => {
      const key = switchOn(ctx.context);
      const subcon = cases[key] || defaultCase;
      if (!subcon) throw new Error(`Switch case not found for key: ${key}`);
      subcon._build(v, ctx);
    },
  }) as K;
};
