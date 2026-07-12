import { UiValue } from "../../domain/source/value";
import { UiDiagnostics } from "../../domain/diagnostics/collection";
import { UiDiagnostic } from "../../domain/diagnostics/diagnostic";
import type { UiPredicate } from "./predicate";
import { AlwaysPredicate } from "./always";
import { ProfilePredicate } from "./profile";
import type { ProfileValueReader } from "../../projection/value-reader";
import { DiagnosticSeverity } from "../../domain/vocabulary/diagnostic";
import { PredicateOperator } from "../../domain/vocabulary/predicate";
import { ProfileMember } from "../../domain/vocabulary/profile-member";
import { SirenUiCode } from "../../errors/code";

export class PredicateCompiler {
  constructor(private readonly reader: ProfileValueReader) {}
  compile(source: UiValue): UiPredicate {
    if (
      !source.property(ProfileMember.path).present ||
      !source.property(ProfileMember.operator).present
    )
      return new AlwaysPredicate();
    const operator = this.reader.string(source, ProfileMember.operator, "");
    const supported = PredicateOperator.values.includes(operator);
    const diagnostics = supported
      ? UiDiagnostics.empty()
      : new UiDiagnostics([
          new UiDiagnostic(
            SirenUiCode.predicateUnsupported,
            "",
            DiagnosticSeverity.warning,
            `Unsupported predicate operator '${operator}'`,
            "",
          ),
        ]);
    return new ProfilePredicate(
      this.reader.string(source, ProfileMember.path, ""),
      operator,
      this.reader.value(source, ProfileMember.value, UiValue.from(false)),
      diagnostics,
    );
  }
}
