import type { SourceDocument } from "../source/document";

export abstract class SirenExchange {
  protected constructor(readonly kind: string) {}
  abstract documentOr(fallback: SourceDocument): SourceDocument;
  abstract requireDocument(): SourceDocument;
}
