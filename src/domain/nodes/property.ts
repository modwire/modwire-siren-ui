import type { UiValue } from "../source/value";
import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import { NodeKind } from "../vocabulary/node-kind";
import { UiNode } from "./base";
import type { UiNodeIdentity } from "./identity";
import type { UiNodeVisitor } from "./visitor";

export class UiPropertyNode extends UiNode {
  constructor(
    identity: UiNodeIdentity,
    readonly name: string,
    readonly value: UiValue,
    readonly label: string,
    readonly format: string,
    readonly importance: string,
    readonly sensitive: boolean,
    readonly order: number,
    component: ComponentResolution,
    diagnostics: UiDiagnostics,
  ) {
    super(NodeKind.property, identity, component, diagnostics);
    Object.freeze(this);
  }

  accept<Result>(visitor: UiNodeVisitor<Result>): Result {
    return visitor.property(this);
  }
}
