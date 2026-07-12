import type { SourceReference } from "./reference";
import type { UiValue } from "./value";

export class SourceField {
  constructor(
    readonly reference: SourceReference,
    readonly name: string,
    readonly fieldType: string,
    readonly value: UiValue,
    readonly required: boolean,
  ) {
    Object.freeze(this);
  }
}
