import type { SourceDocument } from "../source/document";
import { SirenUiError } from "../../errors/error";
import { SirenUiCode } from "../../errors/code";
import { ExchangeKind } from "../vocabulary/exchange";
import { SirenExchange } from "./base";

export class EmptyExchange extends SirenExchange {
  constructor() {
    super(ExchangeKind.empty);
    Object.freeze(this);
  }
  documentOr(fallback: SourceDocument): SourceDocument {
    return fallback;
  }
  requireDocument(): SourceDocument {
    throw new SirenUiError(
      SirenUiCode.exchangeEmpty,
      "A Siren document response is required",
    );
  }
}
