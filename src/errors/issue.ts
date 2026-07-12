export class SirenUiIssue {
  constructor(
    readonly code: string,
    readonly pointer: string,
    readonly message: string,
  ) {
    Object.freeze(this);
  }
}
