import type { UiValue } from "../../domain/source/value";
import type { UiDiagnostics } from "../../domain/diagnostics/collection";
import { UiPredicate } from "./predicate";
import { PredicateOperator } from "../../domain/vocabulary/predicate";
import { ProfileMember } from "../../domain/vocabulary/profile-member";

export class ProfilePredicate extends UiPredicate {
  constructor(
    readonly path: string,
    readonly operator: string,
    readonly expected: UiValue,
    diagnostics: UiDiagnostics,
  ) {
    super(diagnostics);
    Object.freeze(this);
  }
  evaluate(properties: UiValue, fields: UiValue): boolean {
    const parts = this.path.split("/");
    const namespace = parts.shift();
    let source: UiValue =
      namespace === ProfileMember.properties ? properties : fields;
    let found =
      namespace === ProfileMember.properties ||
      namespace === ProfileMember.fields;
    for (const part of parts) {
      const nested = source.property(part);
      if (!nested.present) {
        found = false;
        break;
      }
      source = nested;
    }
    if (this.operator === PredicateOperator.exists) return found;
    if (this.operator === PredicateOperator.truthy)
      return found && source.truthy();
    if (this.operator === PredicateOperator.falsy)
      return found && !source.truthy();
    const equal = source.serialized() === this.expected.serialized();
    if (this.operator === PredicateOperator.equals) return found && equal;
    if (this.operator === PredicateOperator.notEquals) return found && !equal;
    if (
      this.operator === PredicateOperator.inside &&
      this.expected.items().length > 0
    )
      return (
        found &&
        this.expected
          .items()
          .some((value) => value.serialized() === source.serialized())
      );
    if (
      this.operator === PredicateOperator.outside &&
      this.expected.items().length > 0
    )
      return (
        found &&
        !this.expected
          .items()
          .some((value) => value.serialized() === source.serialized())
      );
    return false;
  }
}
