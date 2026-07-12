import type { SourceDocument } from "../../domain/source/document";
import type { ResultContext } from "./context";
import type { ActionResultStrategy } from "./strategy";
import { ResultMode } from "../../domain/vocabulary/result-mode";

export class RefreshResult implements ActionResultStrategy {
  readonly mode = ResultMode.refresh;
  async apply(context: ResultContext): Promise<SourceDocument> {
    let document = context.exchange.documentOr(context.current);
    for (const relation of context.action.resultRelations) {
      context.cancellation.throwIfCancelled();
      document = (
        await context.gateway.follow(document, relation)
      ).requireDocument();
    }
    return document;
  }
}
