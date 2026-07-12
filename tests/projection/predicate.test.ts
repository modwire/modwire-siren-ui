import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import type { UiFieldNode } from "@modwire/siren-ui/model";
import { DocumentCase } from "../support/client/documents";
import type { FixtureObject } from "../support/fixture";

describe("safe field predicates", () => {
  const documents = new DocumentCase();

  it("turns an unsupported predicate into a diagnostic fallback", () => {
    const projected = project("rolling", "execute-code");
    expect(projected.profile.state).not.toBe("supported");
    expect(projected.diagnostics.length).toBeGreaterThan(0);
  });

  it("hides a conditional field when its predicate is false", () => {
    expect(field(project("rolling"), "canary_percent").visible).toBe(false);
  });

  it("disables a field when its predicate is false", () => {
    expect(field(project("rolling"), "reason").enabled).toBe(false);
  });

  it("shows a conditional field when its predicate is true", () => {
    expect(field(project("canary"), "canary_percent").visible).toBe(true);
  });

  function project(strategy: string, operator = "equals") {
    const metadata = documents.metadata({
      presentation: { role: "form", label: "Deployment" },
      actions: {
        deploy: {
          fields: {
            strategy: { widget: "select", order: 10 },
            canary_percent: {
              widget: "number",
              order: 20,
              visibleWhen: {
                path: "fields/strategy",
                operator,
                value: "canary",
              },
            },
            reason: {
              widget: "textarea",
              order: 30,
              enabledWhen: {
                path: "fields/environment",
                operator: "equals",
                value: "production",
              },
            },
          },
        },
      },
    });
    const action: FixtureObject = {
      name: "deploy",
      method: "POST",
      href: "https://api.example.test/deployments",
      type: "application/json",
      fields: [
        { name: "environment", type: "hidden", value: "staging" },
        { name: "strategy", type: "text", value: strategy },
        { name: "canary_percent", type: "number" },
        { name: "reason", type: "text" },
      ],
    };
    return new SirenUiEngine().project(
      documents.input(documents.actionDocument(metadata, action)),
    );
  }

  function field(
    document: ReturnType<typeof project>,
    name: string,
  ): UiFieldNode {
    const result = document.root.actions.values[0]?.fields.values.find(
      (candidate) => candidate.name === name,
    );
    if (!result) throw new Error(`Expected field: ${name}`);
    return result;
  }
});
