import { UiCollection } from "../collections/collection";
import type { SourceField } from "./field";
import type { SourceReference } from "./reference";

export class SourceAction {
  readonly fields: UiCollection<SourceField>;
  constructor(
    readonly reference: SourceReference,
    readonly name: string,
    fields: readonly SourceField[],
  ) {
    this.fields = new UiCollection(fields);
    Object.freeze(this);
  }
}
