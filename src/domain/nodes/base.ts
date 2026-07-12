import type { ComponentResolution } from "../component/resolution";
import type { UiDiagnostics } from "../diagnostics/collection";
import type { UiNodeIdentity } from "./identity";
import type { UiNodeVisitor } from "./visitor";

export abstract class UiNode {
  protected constructor(
    readonly kind: string,
    readonly identity: UiNodeIdentity,
    readonly component: ComponentResolution,
    readonly diagnostics: UiDiagnostics,
  ) {}

  abstract accept<Result>(visitor: UiNodeVisitor<Result>): Result;
}
