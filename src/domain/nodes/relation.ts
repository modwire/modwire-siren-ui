import type { SourceEntity } from "../source/entity";
import { UiCollection } from "../collections/collection";
import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import { NodeKind } from "../vocabulary/node-kind";
import { UiNode } from "./base";
import type { UiEntityNode } from "./entity";
import type { UiNodeIdentity } from "./identity";
import type { UiReferenceNode } from "./reference";
import type { UiNodeVisitor } from "./visitor";

export class UiRelationNode extends UiNode {
  readonly sources: UiCollection<SourceEntity>;
  readonly entities: UiCollection<UiEntityNode>;
  readonly references: UiCollection<UiReferenceNode>;

  constructor(
    identity: UiNodeIdentity,
    readonly relation: string,
    readonly label: string,
    readonly role: string,
    readonly loading: string,
    readonly cardinality: string,
    readonly order: number,
    sources: readonly SourceEntity[],
    entities: readonly UiEntityNode[],
    references: readonly UiReferenceNode[],
    component: ComponentResolution,
    diagnostics: UiDiagnostics,
  ) {
    super(NodeKind.relation, identity, component, diagnostics);
    this.sources = new UiCollection(sources);
    this.entities = new UiCollection(entities);
    this.references = new UiCollection(references);
    Object.freeze(this);
  }

  accept<Result>(visitor: UiNodeVisitor<Result>): Result {
    return visitor.relation(this);
  }
}
