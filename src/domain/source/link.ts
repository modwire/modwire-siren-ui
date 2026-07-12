export class SourceLink {
  readonly relations: readonly string[];
  constructor(
    relations: readonly string[],
    readonly href: string,
  ) {
    this.relations = Object.freeze([...relations]);
    Object.freeze(this);
  }
}
