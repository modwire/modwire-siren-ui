export class UiCollection<Value> implements Iterable<Value> {
  readonly values: readonly Value[];

  constructor(values: readonly Value[]) {
    this.values = Object.freeze([...values]);
    Object.freeze(this);
  }

  get length(): number {
    return this.values.length;
  }

  [Symbol.iterator](): Iterator<Value> {
    return this.values[Symbol.iterator]();
  }
}
