import type { SirenField } from "@modwire/siren-client";
import type { SourceReference } from "../domain/source/reference";
import { SourceKind } from "../domain/vocabulary/source-kind";

export class ClientFieldReference implements SourceReference {
  readonly kind = SourceKind.field;
  constructor(readonly field: SirenField) {
    Object.freeze(this);
  }
}
