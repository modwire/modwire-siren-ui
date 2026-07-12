import type { SourceReference } from "../domain/source/reference";
import { SourceKind } from "../domain/vocabulary/source-kind";
import type { ClientDocumentInput } from "./document-input";

export class ClientDocumentReference implements SourceReference {
  readonly kind = SourceKind.document;
  constructor(readonly document: ClientDocumentInput) {
    Object.freeze(this);
  }
}
