import type { ResolutionCandidate } from "../../domain/component/candidate";
import { RuleMatch } from "../../domain/component/match";
import { ComponentReference } from "../../domain/component/reference";
import type { ComponentRule } from "../../domain/component/rule";
import { ComponentVocabulary } from "../../domain/vocabulary/component";

export class UnsupportedRule implements ComponentRule {
  readonly identifier = ComponentVocabulary.unsupportedRule;
  readonly component = new ComponentReference(
    ComponentVocabulary.unsupportedRule,
  );
  readonly band = ComponentVocabulary.unsupportedBand;
  readonly priority = 0;
  match(candidate: ResolutionCandidate): RuleMatch {
    return new RuleMatch(true, [`kind:${candidate.kind}`]);
  }
}
