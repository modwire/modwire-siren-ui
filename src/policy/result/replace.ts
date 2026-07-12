import type { SourceDocument } from "../../domain/source/document";
import type { ResultContext } from "./context";
import type { ActionResultStrategy } from "./strategy";
import { ResultMode } from "../../domain/vocabulary/result-mode";

export class ReplaceResult implements ActionResultStrategy {
  readonly mode = ResultMode.replace;
  apply(context: ResultContext): Promise<SourceDocument> {
    return Promise.resolve(context.exchange.requireDocument());
  }
}
