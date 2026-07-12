import type { ResolutionCandidate } from "../../domain/component/candidate";
import { RuleMatch } from "../../domain/component/match";
import type { ComponentReference } from "../../domain/component/reference";
import type { ComponentRule } from "../../domain/component/rule";
import { ComponentVocabulary } from "../../domain/vocabulary/component";

export class NamedRule implements ComponentRule {
  readonly band = ComponentVocabulary.identityBand;
  constructor(
    readonly identifier: string,
    readonly component: ComponentReference,
    readonly kind: string,
    readonly name: string,
    readonly semantic: string,
    readonly priority = 0,
  ) {
    Object.freeze(this);
  }
  match(candidate: ResolutionCandidate): RuleMatch {
    const matched =
      candidate.kind === this.kind &&
      candidate.identity === this.name &&
      (candidate.semantic === this.semantic ||
        candidate.role === this.semantic);
    return new RuleMatch(
      matched,
      matched ? [`identity:${this.name}`, `semantic:${this.semantic}`] : [],
    );
  }
}
