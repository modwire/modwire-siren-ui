import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import { DocumentCase } from "../support/client/documents";

describe("projection input boundary", () => {
  const documents = new DocumentCase();
  const engine = new SirenUiEngine();

  it("falls back safely when profile discovery is missing", () => {
    const projected = engine.project(documents.input(documents.document()));
    expect(projected.profile.state).not.toBe("found");
    expect(projected.root.properties.length).toBe(2);
    expect(projected.root.actions.length).toBe(0);
  });

  it("does not perform transport I/O during projection", () => {
    const projected = engine.project(documents.input(documents.document()));
    expect(projected.root.label).toBeTruthy();
  });

  it("retains unknown domain properties", () => {
    const source = documents.document({
      properties: { id: "one", unknown: "still visible" },
    });
    const projected = engine.project(documents.input(source));
    expect([...projected.root.properties].map((node) => node.name)).toContain(
      "unknown",
    );
  });

  it("does not mutate the consumer source", () => {
    const source = documents.profiled(documents.metadata());
    const before = JSON.stringify(source);
    const projected = engine.project(documents.input(source));
    expect(JSON.stringify(source)).toBe(before);
    expect(projected.source.reference.kind).toBeTruthy();
  });

  it("projects a supported profile", () => {
    const projected = engine.project(
      documents.input(documents.profiled(documents.metadata())),
    );
    expect(projected.profile.state).toBe("supported");
    expect(projected.profile.identifier).toBe(DocumentCase.profile);
    expect(projected.root.role).toBe("detail");
    expect(projected.root.label).toBe("Record");
  });
});
