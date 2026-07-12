export class ResolutionCandidate {
  readonly classes: readonly string[];

  constructor(
    readonly kind: string,
    readonly identity: string,
    classes: readonly string[],
    readonly role: string,
    readonly semantic: string,
  ) {
    this.classes = Object.freeze([...classes]);
    Object.freeze(this);
  }
}
