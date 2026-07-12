import type { SirenEntity } from "@modwire/siren-client";
import type { SourceReference } from "../domain/source/reference";
import { SourceKind } from "../domain/vocabulary/source-kind";

export class ClientEntityReference implements SourceReference {
  readonly kind = SourceKind.entity;
  constructor(readonly entity: SirenEntity) {
    Object.freeze(this);
  }
}
