import type { SourceDocument } from "../../domain/source/document";
import type { ResultContext } from "./context";

export interface ActionResultStrategy {
  readonly mode: string;
  apply(context: ResultContext): Promise<SourceDocument>;
}
