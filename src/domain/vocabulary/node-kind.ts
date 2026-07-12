export class NodeKind {
  static readonly entity = "entity";
  static readonly reference = "reference";
  static readonly region = "region";
  static readonly property = "property";
  static readonly relation = "relation";
  static readonly action = "action";
  static readonly field = "field";
  static readonly values = Object.freeze([
    NodeKind.entity,
    NodeKind.reference,
    NodeKind.region,
    NodeKind.property,
    NodeKind.relation,
    NodeKind.action,
    NodeKind.field,
  ]);
}
