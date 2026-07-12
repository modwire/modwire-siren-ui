import type { UiValue } from "../../domain/source/value";
import { UiDiagnostics } from "../../domain/diagnostics/collection";
import { UiPredicate } from "./predicate";

export class AlwaysPredicate extends UiPredicate {
  constructor() {
    super(UiDiagnostics.empty());
    Object.freeze(this);
  }
  evaluate(properties: UiValue, fields: UiValue): boolean {
    void properties;
    void fields;
    return true;
  }
}
