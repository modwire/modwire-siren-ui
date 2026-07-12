import type {
  UiActionNode,
  UiEntityNode,
  UiFieldNode,
  UiNodeVisitor,
  UiPropertyNode,
  UiReferenceNode,
  UiRegionNode,
  UiRelationNode,
} from "@modwire/siren-ui/model";

export interface GraphEntry {
  readonly identity: string;
  readonly kind: string;
  readonly name: string;
}

export class GraphProbe implements UiNodeVisitor<readonly GraphEntry[]> {
  entity(node: UiEntityNode): readonly GraphEntry[] {
    return [
      this.entry(node.kind, node.identity.value, node.label),
      ...this.visit(node.regions),
      ...this.visit(node.properties),
      ...this.visit(node.relations),
      ...this.visit(node.actions),
    ];
  }

  reference(node: UiReferenceNode): readonly GraphEntry[] {
    return [this.entry(node.kind, node.identity.value, node.canonicalUrl)];
  }

  region(node: UiRegionNode): readonly GraphEntry[] {
    return [
      this.entry(node.kind, node.identity.value, node.id),
      ...this.visit(node.properties),
      ...this.visit(node.relations),
      ...this.visit(node.actions),
    ];
  }

  property(node: UiPropertyNode): readonly GraphEntry[] {
    return [this.entry(node.kind, node.identity.value, node.name)];
  }

  relation(node: UiRelationNode): readonly GraphEntry[] {
    return [
      this.entry(node.kind, node.identity.value, node.relation),
      ...this.visit(node.entities),
      ...this.visit(node.references),
    ];
  }

  action(node: UiActionNode): readonly GraphEntry[] {
    return [
      this.entry(node.kind, node.identity.value, node.name),
      ...this.visit(node.fields),
    ];
  }

  field(node: UiFieldNode): readonly GraphEntry[] {
    return [this.entry(node.kind, node.identity.value, node.name)];
  }

  private visit(
    nodes: Iterable<
      | UiEntityNode
      | UiReferenceNode
      | UiRegionNode
      | UiPropertyNode
      | UiRelationNode
      | UiActionNode
      | UiFieldNode
    >,
  ): readonly GraphEntry[] {
    const entries: GraphEntry[] = [];
    for (const node of nodes) {
      entries.push(...node.accept(this));
    }
    return entries;
  }

  private entry(kind: string, identity: string, name: string): GraphEntry {
    return { kind, identity, name };
  }
}
