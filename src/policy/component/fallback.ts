import type { ResolutionCandidate } from "../../domain/component/candidate";
import { RuleMatch } from "../../domain/component/match";
import type { ComponentReference } from "../../domain/component/reference";
import type { ComponentRule } from "../../domain/component/rule";
import { ComponentVocabulary } from "../../domain/vocabulary/component";

export class FallbackRule implements ComponentRule {
  readonly band = ComponentVocabulary.fallbackBand;
  readonly priority = 0;
  constructor(
    readonly identifier: string,
    readonly component: ComponentReference,
    readonly kind: string,
  ) {
    Object.freeze(this);
  }
  match(candidate: ResolutionCandidate): RuleMatch {
    const matched = candidate.kind === this.kind;
    return new RuleMatch(matched, matched ? [`kind:${this.kind}`] : []);
  }
}
