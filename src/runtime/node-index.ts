import { SirenUiError } from "../errors/error";
import type { UiActionNode } from "../domain/nodes/action";
import type { UiEntityNode } from "../domain/nodes/entity";
import type { UiRelationNode } from "../domain/nodes/relation";
import { SirenUiCode } from "../errors/code";

export class NodeIndex {
  private readonly actions = new Map<string, UiActionNode>();
  private readonly relations = new Map<string, UiRelationNode>();
  constructor(root: UiEntityNode) {
    this.visit(root);
  }
  action(identity: string): UiActionNode {
    if (!this.actions.has(identity))
      throw new SirenUiError(
        SirenUiCode.nodeMissing,
        `Action node is unavailable: '${identity}'`,
      );
    for (const [name, action] of this.actions) {
      if (name === identity) return action;
    }
    throw new SirenUiError(
      SirenUiCode.nodeMissing,
      `Action node is unavailable: '${identity}'`,
    );
  }
  relation(identity: string): UiRelationNode {
    if (!this.relations.has(identity))
      throw new SirenUiError(
        SirenUiCode.nodeMissing,
        `Relation node is unavailable: '${identity}'`,
      );
    for (const [name, relation] of this.relations) {
      if (name === identity) return relation;
    }
    throw new SirenUiError(
      SirenUiCode.nodeMissing,
      `Relation node is unavailable: '${identity}'`,
    );
  }
  private visit(entity: UiEntityNode): void {
    for (const action of entity.actions)
      this.actions.set(action.identity.value, action);
    for (const relation of entity.relations) {
      this.relations.set(relation.identity.value, relation);
      for (const child of relation.entities) this.visit(child);
    }
  }
}
