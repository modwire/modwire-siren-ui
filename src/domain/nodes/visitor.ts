import type { UiActionNode } from "./action";
import type { UiEntityNode } from "./entity";
import type { UiFieldNode } from "./field";
import type { UiPropertyNode } from "./property";
import type { UiReferenceNode } from "./reference";
import type { UiRegionNode } from "./region";
import type { UiRelationNode } from "./relation";

export interface UiNodeVisitor<Result> {
  entity(node: UiEntityNode): Result;
  reference(node: UiReferenceNode): Result;
  region(node: UiRegionNode): Result;
  property(node: UiPropertyNode): Result;
  relation(node: UiRelationNode): Result;
  action(node: UiActionNode): Result;
  field(node: UiFieldNode): Result;
}
