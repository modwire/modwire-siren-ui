import type { UiDiagnostics } from "../domain/diagnostics/collection";
import type { UiActionNode } from "../domain/nodes/action";
import type { UiEntityNode } from "../domain/nodes/entity";
import type { UiFieldNode } from "../domain/nodes/field";
import type { UiPropertyNode } from "../domain/nodes/property";
import type { UiReferenceNode } from "../domain/nodes/reference";
import type { UiRegionNode } from "../domain/nodes/region";
import type { UiRelationNode } from "../domain/nodes/relation";
import type { UiNodeVisitor } from "../domain/nodes/visitor";

export class DiagnosticCollector implements UiNodeVisitor<UiDiagnostics> {
  entity(node: UiEntityNode): UiDiagnostics {
    let diagnostics = node.diagnostics;
    for (const region of node.regions) {
      diagnostics = diagnostics.merge(region.accept(this));
    }
    for (const property of node.properties) {
      diagnostics = diagnostics.merge(property.accept(this));
    }
    for (const relation of node.relations) {
      diagnostics = diagnostics.merge(relation.accept(this));
    }
    for (const action of node.actions) {
      diagnostics = diagnostics.merge(action.accept(this));
    }
    return diagnostics;
  }

  relation(node: UiRelationNode): UiDiagnostics {
    let diagnostics = node.diagnostics;
    for (const entity of node.entities) {
      diagnostics = diagnostics.merge(entity.accept(this));
    }
    for (const reference of node.references) {
      diagnostics = diagnostics.merge(reference.accept(this));
    }
    return diagnostics;
  }

  action(node: UiActionNode): UiDiagnostics {
    let diagnostics = node.diagnostics;
    for (const field of node.fields) {
      diagnostics = diagnostics.merge(field.accept(this));
    }
    return diagnostics;
  }

  reference(node: UiReferenceNode): UiDiagnostics {
    return node.diagnostics;
  }

  region(node: UiRegionNode): UiDiagnostics {
    return node.diagnostics;
  }

  property(node: UiPropertyNode): UiDiagnostics {
    return node.diagnostics;
  }

  field(node: UiFieldNode): UiDiagnostics {
    return node.diagnostics;
  }
}
