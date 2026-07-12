import type { ResolutionCandidate } from "../../domain/component/candidate";
import { RuleMatch } from "../../domain/component/match";
import type { ComponentReference } from "../../domain/component/reference";
import type { ComponentRule } from "../../domain/component/rule";
import { ComponentVocabulary } from "../../domain/vocabulary/component";
import { NodeKind } from "../../domain/vocabulary/node-kind";

export class DomainRule implements ComponentRule {
  readonly band = ComponentVocabulary.domainBand;
  constructor(
    readonly identifier: string,
    readonly component: ComponentReference,
    readonly domainClass: string,
    readonly role: string,
    readonly priority = 0,
  ) {
    Object.freeze(this);
  }
  match(candidate: ResolutionCandidate): RuleMatch {
    const matched =
      candidate.kind === NodeKind.entity &&
      candidate.classes.includes(this.domainClass) &&
      candidate.role === this.role;
    return new RuleMatch(
      matched,
      matched ? [`class:${this.domainClass}`, `role:${this.role}`] : [],
    );
  }
}
