import type { SirenUiIssue } from "./issue";

export class SirenUiError extends Error {
  readonly issues: readonly SirenUiIssue[];

  constructor(
    readonly kind: string,
    message: string,
    issues: readonly SirenUiIssue[] = [],
    options: ErrorOptions = {},
  ) {
    super(message, options);
    this.name = "SirenUiError";
    this.issues = Object.freeze([...issues]);
  }
}
