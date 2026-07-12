import type { SourceEntity } from "../domain/source/entity";
import { UiCollection } from "../domain/collections/collection";

export class EntityIndex {
  readonly relations: UiCollection<string>;
  constructor(
    names: readonly string[],
    private readonly entities: ReadonlyMap<string, readonly SourceEntity[]>,
  ) {
    this.relations = new UiCollection(names);
    Object.freeze(this);
  }
  sources(relation: string): readonly SourceEntity[] {
    for (const [name, values] of this.entities) {
      if (name === relation) return values;
    }
    return Object.freeze([]);
  }
}
