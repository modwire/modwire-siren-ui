import type { ProfileContext } from "../profile/context";
import type { SourceEntity } from "./entity";
import type { SourceReference } from "./reference";

export class SourceDocument {
  constructor(
    readonly reference: SourceReference,
    readonly root: SourceEntity,
    readonly profile: ProfileContext,
  ) {
    Object.freeze(this);
  }
}
