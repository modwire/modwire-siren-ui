import { describe, expect, it } from "vitest";
import {
  ClientRuntime,
  SirenUiEngine,
  SirenUiOptions,
} from "@modwire/siren-ui";
import {
  ComponentReference,
  DomainRule,
  SemanticRule,
} from "@modwire/siren-ui/extensions";
import { DocumentCase } from "../support/client/documents";
import { ImmediateScheduler } from "../support/scheduler";

describe("component resolution", () => {
  const documents = new DocumentCase();

  it("does not let registration order select an ambiguous component", () => {
    const first = component([rule("first"), rule("second")]);
    const second = component([rule("second"), rule("first")]);
    expect(first.component.key).toBe(second.component.key);
    expect(first.diagnostics.length).toBeGreaterThan(0);
    expect(second.diagnostics.length).toBeGreaterThan(0);
    expect(first.component.key).not.toBe("first");
    expect(first.component.key).not.toBe("second");
  });

  it("resolves one unambiguous local domain component", () => {
    const resolution = component([rule("record-detail")]);
    expect(resolution.component.key).toBe("record-detail");
    expect(resolution.matched).toEqual(["class:record", "role:detail"]);
  });

  it("prefers a domain rule over a semantic rule in either order", () => {
    const semantic = new SemanticRule(
      "semantic",
      new ComponentReference("semantic"),
      "entity",
      "detail",
    );
    expect(component([semantic, rule("domain")]).component.key).toBe("domain");
    expect(component([rule("domain"), semantic]).component.key).toBe("domain");
  });

  it("uses priority only inside the same specificity band", () => {
    const lower = new DomainRule(
      "lower",
      new ComponentReference("lower"),
      "record",
      "detail",
      10,
    );
    const higher = new DomainRule(
      "higher",
      new ComponentReference("higher"),
      "record",
      "detail",
      20,
    );
    expect(component([lower, higher]).component.key).toBe("higher");
    expect(component([higher, lower]).component.key).toBe("higher");
  });

  function rule(component: string): DomainRule {
    return new DomainRule(
      component,
      new ComponentReference(component),
      "record",
      "detail",
    );
  }

  function component(rules: readonly (DomainRule | SemanticRule)[]) {
    const options = new SirenUiOptions(
      new ClientRuntime(),
      rules,
      new ImmediateScheduler(),
    );
    return new SirenUiEngine(options).project(
      documents.input(documents.profiled(documents.metadata())),
    ).root.component;
  }
});
