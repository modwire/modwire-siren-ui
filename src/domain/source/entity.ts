import { UiCollection } from "../collections/collection";
import type { SourceAction } from "./action";
import type { SourceLink } from "./link";
import type { SourceReference } from "./reference";
import type { UiValue } from "./value";

export class SourceEntity {
  readonly classes: readonly string[];
  readonly relations: readonly string[];
  readonly entities: UiCollection<SourceEntity>;
  readonly actions: UiCollection<SourceAction>;
  readonly links: UiCollection<SourceLink>;

  constructor(
    readonly reference: SourceReference,
    classes: readonly string[],
    relations: readonly string[],
    readonly properties: UiValue,
    entities: readonly SourceEntity[],
    actions: readonly SourceAction[],
    links: readonly SourceLink[],
  ) {
    this.classes = Object.freeze([...classes]);
    this.relations = Object.freeze([...relations]);
    this.entities = new UiCollection(entities);
    this.actions = new UiCollection(actions);
    this.links = new UiCollection(links);
    Object.freeze(this);
  }
}
