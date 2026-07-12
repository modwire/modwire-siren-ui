import { UiCollection } from "../collections/collection";
import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import { NodeKind } from "../vocabulary/node-kind";
import type { UiActionNode } from "./action";
import { UiNode } from "./base";
import type { UiNodeIdentity } from "./identity";
import type { UiPropertyNode } from "./property";
import type { UiRelationNode } from "./relation";
import type { UiNodeVisitor } from "./visitor";

export class UiRegionNode extends UiNode {
  readonly properties: UiCollection<UiPropertyNode>;
  readonly relations: UiCollection<UiRelationNode>;
  readonly actions: UiCollection<UiActionNode>;

  constructor(
    identity: UiNodeIdentity,
    readonly id: string,
    readonly label: string,
    readonly order: number,
    properties: readonly UiPropertyNode[],
    relations: readonly UiRelationNode[],
    actions: readonly UiActionNode[],
    component: ComponentResolution,
    diagnostics: UiDiagnostics,
  ) {
    super(NodeKind.region, identity, component, diagnostics);
    this.properties = new UiCollection(properties);
    this.relations = new UiCollection(relations);
    this.actions = new UiCollection(actions);
    Object.freeze(this);
  }

  accept<Result>(visitor: UiNodeVisitor<Result>): Result {
    return visitor.region(this);
  }
}
