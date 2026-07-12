import type { ActionResultStrategy } from "./strategy";
import { SirenUiError } from "../../errors/error";
import { ResultMode } from "../../domain/vocabulary/result-mode";
import { SirenUiCode } from "../../errors/code";

export class ResultStrategies {
  private readonly strategies: readonly ActionResultStrategy[];

  constructor(
    strategies: readonly ActionResultStrategy[],
    private readonly fallback: ActionResultStrategy,
  ) {
    this.strategies = Object.freeze([...strategies]);
    const modes = new Set<string>();
    for (const strategy of strategies) {
      if (!ResultMode.values.includes(strategy.mode)) {
        throw new SirenUiError(
          SirenUiCode.resultUnknownStrategy,
          `Unknown action result mode '${strategy.mode}'`,
        );
      }
      if (modes.has(strategy.mode)) {
        throw new SirenUiError(
          SirenUiCode.resultDuplicateStrategy,
          `Duplicate action result strategy '${strategy.mode}'`,
        );
      }
      modes.add(strategy.mode);
    }
    if (!modes.has(fallback.mode) || fallback.mode !== ResultMode.none) {
      throw new SirenUiError(
        SirenUiCode.resultMissingFallback,
        "Action result fallback must be registered",
      );
    }
    Object.freeze(this);
  }

  select(mode: string): ActionResultStrategy {
    for (const strategy of this.strategies)
      if (strategy.mode === mode) return strategy;
    return this.fallback;
  }
}
