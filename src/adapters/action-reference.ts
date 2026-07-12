import type { SirenAction } from "@modwire/siren-client";
import type { SourceReference } from "../domain/source/reference";
import { SourceKind } from "../domain/vocabulary/source-kind";

export class ClientActionReference implements SourceReference {
  readonly kind = SourceKind.action;
  constructor(readonly action: SirenAction) {
    Object.freeze(this);
  }
}
