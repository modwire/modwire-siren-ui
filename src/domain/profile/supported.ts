import { UiDiagnostics } from "../diagnostics/collection";
import type { UiValue } from "../source/value";
import { GenericProfileContext } from "./generic";
import { ProfileContext } from "./context";
import { ProfileVocabulary } from "../vocabulary/profile";

export class SupportedProfileContext extends ProfileContext {
  constructor(
    identifier: string,
    language: string,
    diagnostics: UiDiagnostics,
    private readonly source: UiValue,
  ) {
    super(ProfileVocabulary.supported, identifier, language, diagnostics);
    Object.freeze(this);
  }

  metadata(): UiValue {
    return this.source;
  }

  forChild(role: string): ProfileContext {
    return new GenericProfileContext(
      this.identifier,
      UiDiagnostics.empty(),
      role,
    );
  }
}
