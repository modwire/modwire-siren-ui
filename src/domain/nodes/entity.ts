import type { SourceEntity } from "../source/entity";
import { UiCollection } from "../collections/collection";
import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import { NodeKind } from "../vocabulary/node-kind";
import type { UiActionNode } from "./action";
import { UiNode } from "./base";
import type { UiNodeIdentity } from "./identity";
import type { UiPropertyNode } from "./property";
import type { UiRegionNode } from "./region";
import type { UiRelationNode } from "./relation";
import type { UiNodeVisitor } from "./visitor";

export class UiEntityNode extends UiNode {
  readonly classes: readonly string[];
  readonly regions: UiCollection<UiRegionNode>;
  readonly properties: UiCollection<UiPropertyNode>;
  readonly relations: UiCollection<UiRelationNode>;
  readonly actions: UiCollection<UiActionNode>;

  constructor(
    identity: UiNodeIdentity,
    readonly source: SourceEntity,
    classes: readonly string[],
    readonly role: string,
    readonly label: string,
    readonly layout: string,
    regions: readonly UiRegionNode[],
    properties: readonly UiPropertyNode[],
    relations: readonly UiRelationNode[],
    actions: readonly UiActionNode[],
    component: ComponentResolution,
    diagnostics: UiDiagnostics,
  ) {
    super(NodeKind.entity, identity, component, diagnostics);
    this.classes = Object.freeze([...classes]);
    this.regions = new UiCollection(regions);
    this.properties = new UiCollection(properties);
    this.relations = new UiCollection(relations);
    this.actions = new UiCollection(actions);
    Object.freeze(this);
  }

  accept<Result>(visitor: UiNodeVisitor<Result>): Result {
    return visitor.entity(this);
  }
}
