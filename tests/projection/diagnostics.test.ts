import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import { DocumentCase } from "../support/client/documents";

describe("public projection diagnostics", () => {
  const documents = new DocumentCase();

  it("never includes sensitive property values", () => {
    const secret = "correct-horse-battery-staple";
    const metadata = documents.metadata({
      properties: {
        password: { sensitive: true, format: "hidden" },
      },
    });
    const source = documents.profiled(metadata, {
      properties: { password: secret },
    });
    const projected = new SirenUiEngine().project(documents.input(source));
    expect(JSON.stringify(projected.diagnostics.values)).not.toContain(secret);
    expect(JSON.stringify(projected.root.diagnostics.values)).not.toContain(
      secret,
    );
  });

  it("orders equivalent diagnostic sets deterministically", () => {
    const first = ambiguous(["zulu", "alpha"]);
    const second = ambiguous(["alpha", "zulu"]);
    expect(first).toEqual(second);
  });

  it("produces no diagnostics for a clean supported document", () => {
    const projected = new SirenUiEngine().project(
      documents.input(documents.profiled(documents.metadata())),
    );
    expect(projected.diagnostics.length).toBe(0);
  });

  function ambiguous(names: readonly string[]): readonly object[] {
    const properties: Record<string, string> = {};
    for (const name of names) {
      properties[name] = name;
    }
    const projected = new SirenUiEngine().project(
      documents.input(documents.document({ properties })),
    );
    return projected.diagnostics.values.map((diagnostic) => ({
      code: diagnostic.code,
      node: diagnostic.node,
      pointer: diagnostic.pointer,
      severity: diagnostic.severity,
    }));
  }
});
