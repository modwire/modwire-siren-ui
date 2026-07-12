import type { ResolutionCandidate } from "../../domain/component/candidate";
import type { ComponentRegistry } from "../../domain/component/registry";
import { ComponentResolution } from "../../domain/component/resolution";
import type { ComponentRule } from "../../domain/component/rule";
import { UiDiagnostics } from "../../domain/diagnostics/collection";
import { UiDiagnostic } from "../../domain/diagnostics/diagnostic";
import { UnsupportedRule } from "./unsupported";
import { ComponentVocabulary } from "../../domain/vocabulary/component";
import { DiagnosticSeverity } from "../../domain/vocabulary/diagnostic";
import { SirenUiCode } from "../../errors/code";

export class ComponentResolver {
  private readonly unsupported = new UnsupportedRule();
  constructor(private readonly registry: ComponentRegistry) {}
  resolve(candidate: ResolutionCandidate): ComponentResolution {
    const matches = this.matches(candidate);
    let selected: ComponentRule = this.unsupported;
    for (const rule of matches) {
      selected = rule;
      break;
    }
    const peers = matches.filter(
      (rule) =>
        rule.band === selected.band && rule.priority === selected.priority,
    );
    if (peers.length > 1 && selected.band > ComponentVocabulary.fallbackBand) {
      selected = this.fallback(matches);
      return new ComponentResolution(
        selected.component,
        selected.identifier,
        ComponentVocabulary.genericLevel,
        selected.match(candidate).reasons,
        new UiDiagnostics([
          new UiDiagnostic(
            SirenUiCode.componentAmbiguity,
            "",
            DiagnosticSeverity.warning,
            `Ambiguous component rules: ${peers.map((rule) => rule.identifier).join(", ")}`,
            candidate.identity,
          ),
        ]),
      );
    }
    return new ComponentResolution(
      selected.component,
      selected.identifier,
      this.level(selected.band),
      selected.match(candidate).reasons,
      UiDiagnostics.empty(),
    );
  }
  private matches(candidate: ResolutionCandidate): readonly ComponentRule[] {
    return [...this.registry.values, this.unsupported]
      .filter((rule) => rule.match(candidate).matched)
      .sort(
        (left, right) =>
          right.band - left.band ||
          right.priority - left.priority ||
          left.identifier.localeCompare(right.identifier),
      );
  }
  private fallback(matches: readonly ComponentRule[]): ComponentRule {
    for (const rule of matches) {
      if (rule.band === ComponentVocabulary.fallbackBand) return rule;
    }
    return this.unsupported;
  }
  private level(band: number): string {
    if (band >= ComponentVocabulary.domainBand)
      return ComponentVocabulary.domainLevel;
    if (band >= ComponentVocabulary.identityBand)
      return ComponentVocabulary.identityLevel;
    if (band >= ComponentVocabulary.profileBand)
      return ComponentVocabulary.profileLevel;
    if (band >= ComponentVocabulary.fallbackBand)
      return ComponentVocabulary.genericLevel;
    return ComponentVocabulary.unsupportedLevel;
  }
}
