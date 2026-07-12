import type { SourceDocument } from "../../domain/source/document";
import { SirenUiError } from "../../errors/error";
import type { ResultContext } from "./context";
import type { ActionResultStrategy } from "./strategy";
import { ResultMode } from "../../domain/vocabulary/result-mode";
import { SirenUiCode } from "../../errors/code";

export class NavigateResult implements ActionResultStrategy {
  readonly mode = ResultMode.navigate;
  async apply(context: ResultContext): Promise<SourceDocument> {
    let relation = "";
    for (const value of context.action.resultRelations) {
      relation = value;
      break;
    }
    if (relation === "")
      throw new SirenUiError(
        SirenUiCode.actionResult,
        "Navigate result requires a relation",
      );
    return (
      await context.gateway.follow(context.exchange.requireDocument(), relation)
    ).requireDocument();
  }
}
