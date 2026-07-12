import type { ComponentReference } from "./reference";
import type { ResolutionCandidate } from "./candidate";
import type { RuleMatch } from "./match";

export interface ComponentRule {
  readonly identifier: string;
  readonly component: ComponentReference;
  readonly band: number;
  readonly priority: number;
  match(candidate: ResolutionCandidate): RuleMatch;
}
