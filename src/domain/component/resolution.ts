import type { UiDiagnostics } from "../diagnostics/collection";
import type { ComponentReference } from "./reference";

export class ComponentResolution {
  readonly matched: readonly string[];

  constructor(
    readonly component: ComponentReference,
    readonly rule: string,
    readonly level: string,
    matched: readonly string[],
    readonly diagnostics: UiDiagnostics,
  ) {
    this.matched = Object.freeze([...matched]);
    Object.freeze(this);
  }
}
