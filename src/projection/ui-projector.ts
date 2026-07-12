import type { SourceDocument } from "../domain/source/document";
import { UiDocument } from "../domain/document/document";
import { UiNodeIdentity } from "../domain/nodes/identity";
import type { EntityNormalizer } from "./entity-normalizer";
import type { DiagnosticCollector } from "./diagnostic-collector";

export class UiProjector {
  constructor(
    private readonly entities: EntityNormalizer,
    private readonly diagnostics: DiagnosticCollector,
  ) {}
  project(document: SourceDocument): UiDocument {
    const profile = document.profile;
    const root = this.entities.normalize(
      document.root,
      UiNodeIdentity.root(),
      profile,
      new Map(),
    );
    return new UiDocument(
      document,
      root,
      profile,
      profile.diagnostics.merge(this.diagnostics.entity(root)),
    );
  }
}
