export class RuleMatch {
  readonly reasons: readonly string[];

  constructor(
    readonly matched: boolean,
    reasons: readonly string[],
  ) {
    this.reasons = Object.freeze([...reasons]);
    Object.freeze(this);
  }
}
