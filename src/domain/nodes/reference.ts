import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import { NodeKind } from "../vocabulary/node-kind";
import { UiNode } from "./base";
import type { UiNodeIdentity } from "./identity";
import type { UiNodeVisitor } from "./visitor";

export class UiReferenceNode extends UiNode {
  constructor(
    identity: UiNodeIdentity,
    readonly target: UiNodeIdentity,
    readonly canonicalUrl: string,
    component: ComponentResolution,
    diagnostics: UiDiagnostics,
  ) {
    super(NodeKind.reference, identity, component, diagnostics);
    Object.freeze(this);
  }

  accept<Result>(visitor: UiNodeVisitor<Result>): Result {
    return visitor.reference(this);
  }
}
