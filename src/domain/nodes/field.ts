import type { SourceField } from "../source/field";
import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import { NodeKind } from "../vocabulary/node-kind";
import { UiNode } from "./base";
import type { UiNodeIdentity } from "./identity";
import type { UiNodeVisitor } from "./visitor";

export class UiFieldNode extends UiNode {
  constructor(
    identity: UiNodeIdentity,
    readonly name: string,
    readonly source: SourceField,
    readonly label: string,
    readonly widget: string,
    readonly order: number,
    readonly visible: boolean,
    readonly enabled: boolean,
    component: ComponentResolution,
    diagnostics: UiDiagnostics,
  ) {
    super(NodeKind.field, identity, component, diagnostics);
    Object.freeze(this);
  }

  accept<Result>(visitor: UiNodeVisitor<Result>): Result {
    return visitor.field(this);
  }
}
