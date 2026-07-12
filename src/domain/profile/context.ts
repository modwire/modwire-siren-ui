import type { UiDiagnostics } from "../diagnostics/collection";
import type { UiValue } from "../source/value";

export abstract class ProfileContext {
  protected constructor(
    readonly state: string,
    readonly identifier: string,
    readonly language: string,
    readonly diagnostics: UiDiagnostics,
  ) {}

  abstract metadata(): UiValue;
  abstract forChild(role: string): ProfileContext;
}
