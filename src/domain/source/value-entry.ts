export class UiValueEntry {
  constructor(
    readonly name: string,
    readonly value: UiValue,
  ) {
    Object.freeze(this);
  }
}

import type { UiValue } from "./value";
