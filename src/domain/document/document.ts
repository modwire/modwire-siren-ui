import type { SourceDocument } from "../source/document";
import type { UiDiagnostics } from "../diagnostics/collection";
import type { UiEntityNode } from "../nodes/entity";
import type { ProfileContext } from "../profile/context";

export class UiDocument {
  constructor(
    readonly source: SourceDocument,
    readonly root: UiEntityNode,
    readonly profile: ProfileContext,
    readonly diagnostics: UiDiagnostics,
  ) {
    Object.freeze(this);
  }
}
