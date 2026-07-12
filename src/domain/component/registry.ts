import { UiCollection } from "../collections/collection";
import { SirenUiError } from "../../errors/error";
import { SirenUiCode } from "../../errors/code";
import type { ComponentRule } from "./rule";

export class ComponentRegistry extends UiCollection<ComponentRule> {
  constructor(rules: readonly ComponentRule[]) {
    super(rules);
    const names = new Set<string>();
    for (const rule of rules) {
      if (rule.identifier.trim() === "") {
        throw new SirenUiError(
          SirenUiCode.componentInvalid,
          "Component rule identifier cannot be empty",
        );
      }
      if (names.has(rule.identifier)) {
        throw new SirenUiError(
          SirenUiCode.componentDuplicateRule,
          `Duplicate component rule '${rule.identifier}'`,
        );
      }
      names.add(rule.identifier);
    }
  }
}
