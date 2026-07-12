export class PredicateOperator {
  static readonly exists = "exists";
  static readonly equals = "equals";
  static readonly notEquals = "not-equals";
  static readonly inside = "in";
  static readonly outside = "not-in";
  static readonly truthy = "truthy";
  static readonly falsy = "falsy";
  static readonly values = Object.freeze([
    PredicateOperator.exists,
    PredicateOperator.equals,
    PredicateOperator.notEquals,
    PredicateOperator.inside,
    PredicateOperator.outside,
    PredicateOperator.truthy,
    PredicateOperator.falsy,
  ]);
}
