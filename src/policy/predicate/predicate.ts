import type { UiValue } from "../../domain/source/value";
import type { UiDiagnostics } from "../../domain/diagnostics/collection";

export abstract class UiPredicate {
  protected constructor(readonly diagnostics: UiDiagnostics) {}
  abstract evaluate(properties: UiValue, fields: UiValue): boolean;
}
