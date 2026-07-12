import type { SourceDocument } from "../source/document";
import { SirenExchange } from "./base";
import { ExchangeKind } from "../vocabulary/exchange";

export class DocumentExchange extends SirenExchange {
  constructor(readonly document: SourceDocument) {
    super(ExchangeKind.document);
    Object.freeze(this);
  }
  documentOr(fallback: SourceDocument): SourceDocument {
    void fallback;
    return this.document;
  }
  requireDocument(): SourceDocument {
    return this.document;
  }
}
