import { ComponentReference } from "../../domain/component/reference";
import { ComponentRegistry } from "../../domain/component/registry";
import type { ComponentRule } from "../../domain/component/rule";
import { FallbackRule } from "./fallback";
import { NodeKind } from "../../domain/vocabulary/node-kind";

export class StandardRegistry {
  create(additions: readonly ComponentRule[]): ComponentRegistry {
    const fallbacks = NodeKind.values.map(
      (kind) =>
        new FallbackRule(
          `generic.${kind}`,
          new ComponentReference(`generic.${kind}`),
          kind,
        ),
    );
    return new ComponentRegistry([...additions, ...fallbacks]);
  }
}
