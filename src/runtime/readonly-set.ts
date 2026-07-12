export class UiReadonlySet<Value> implements ReadonlySet<Value> {
  private readonly source: Set<Value>;
  readonly [Symbol.toStringTag] = "Set";

  constructor(values: ReadonlySet<Value>) {
    this.source = new Set(values);
    Object.freeze(this);
  }

  get size(): number {
    return this.source.size;
  }

  has(value: Value): boolean {
    return this.source.has(value);
  }

  entries(): SetIterator<[Value, Value]> {
    return this.source.entries();
  }

  keys(): SetIterator<Value> {
    return this.source.keys();
  }

  values(): SetIterator<Value> {
    return this.source.values();
  }

  forEach(
    callback: (value: Value, value2: Value, set: ReadonlySet<Value>) => void,
    thisArgument?: unknown,
  ): void {
    for (const value of this.source) {
      callback.call(thisArgument, value, value, this);
    }
  }

  [Symbol.iterator](): SetIterator<Value> {
    return this.source[Symbol.iterator]();
  }
}
