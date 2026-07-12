import { UiDiagnostics } from "../diagnostics/collection";
import { UiValue } from "../source/value";
import { ProfileContext } from "./context";
import { ProfileVocabulary } from "../vocabulary/profile";
import { ProfileMember } from "../vocabulary/profile-member";

export class GenericProfileContext extends ProfileContext {
  private readonly source: UiValue;

  constructor(
    identifier: string,
    diagnostics: UiDiagnostics,
    readonly role: string,
  ) {
    super(ProfileVocabulary.generic, identifier, "", diagnostics);
    this.source = UiValue.from(
      Object.freeze({
        profile: identifier,
        [ProfileMember.presentation]: Object.freeze({
          [ProfileMember.role]: role,
          [ProfileMember.layout]: Object.freeze({
            [ProfileMember.kind]: ProfileVocabulary.flow,
            [ProfileMember.regions]: Object.freeze([]),
          }),
        }),
        [ProfileMember.properties]: Object.freeze({}),
        [ProfileMember.relations]: Object.freeze({}),
        [ProfileMember.actions]: Object.freeze({}),
        extensions: Object.freeze({}),
      }),
    );
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
