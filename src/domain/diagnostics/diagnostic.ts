export class UiDiagnostic {
  constructor(
    readonly code: string,
    readonly pointer: string,
    readonly severity: string,
    readonly message: string,
    readonly node: string,
  ) {
    Object.freeze(this);
  }
}
