import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import { DocumentCase } from "../support/client/documents";

describe("profile discovery failures", () => {
  const documents = new DocumentCase();
  const engine = new SirenUiEngine();

  it("falls back when profile metadata is invalid", () => {
    const source = documents.profiled({
      profile: DocumentCase.profile,
      presentation: { role: "intruder" },
    });
    const projected = engine.project(documents.input(source));
    expect(projected.profile.state).not.toBe("supported");
    expect(projected.diagnostics.length).toBeGreaterThan(0);
    expect(projected.root.properties.length).toBeGreaterThan(0);
  });

  it("falls back when two profile entities conflict", () => {
    const source = documents.profiled(documents.metadata());
    const entities = Array.isArray(source.entities)
      ? (source.entities as unknown[])
      : [];
    const projected = engine.project(
      documents.input({ ...source, entities: [...entities, ...entities] }),
    );
    expect(projected.profile.state).not.toBe("supported");
    expect(projected.diagnostics.length).toBeGreaterThan(0);
  });

  it("does not include sensitive values in invalid-profile diagnostics", () => {
    const secret = "never-print-this-value";
    const source = documents.profiled(
      {
        profile: DocumentCase.profile,
        presentation: { role: "intruder" },
      },
      { properties: { password: secret } },
    );
    const projected = engine.project(documents.input(source));
    expect(JSON.stringify(projected.diagnostics.values)).not.toContain(secret);
  });

  it("uses a complete supported profile", () => {
    const projected = engine.project(
      documents.input(documents.profiled(documents.metadata())),
    );
    expect(projected.profile.state).toBe("supported");
    expect(projected.diagnostics.length).toBe(0);
  });
});
