import type { SourceAction } from "../source/action";
import type { SourceEntity } from "../source/entity";
import { UiCollection } from "../collections/collection";
import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import { NodeKind } from "../vocabulary/node-kind";
import { UiNode } from "./base";
import type { UiFieldNode } from "./field";
import type { UiNodeIdentity } from "./identity";
import type { UiNodeVisitor } from "./visitor";

export class UiActionNode extends UiNode {
  readonly fields: UiCollection<UiFieldNode>;
  readonly resultRelations: readonly string[];

  constructor(
    identity: UiNodeIdentity,
    readonly name: string,
    readonly owner: SourceEntity,
    readonly source: SourceAction,
    readonly label: string,
    readonly intent: string,
    readonly placement: string,
    readonly order: number,
    readonly confirmationRequired: boolean,
    readonly acknowledgement: string,
    readonly resultMode: string,
    resultRelations: readonly string[],
    fields: readonly UiFieldNode[],
    component: ComponentResolution,
    diagnostics: UiDiagnostics,
  ) {
    super(NodeKind.action, identity, component, diagnostics);
    this.fields = new UiCollection(fields);
    this.resultRelations = Object.freeze([...resultRelations]);
    Object.freeze(this);
  }

  accept<Result>(visitor: UiNodeVisitor<Result>): Result {
    return visitor.action(this);
  }
}
