import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import { DocumentCase } from "../support/client/documents";
import { GraphProbe } from "../support/graph";

describe("public graph visitor", () => {
  it("dispatches every projected node through the public visitor", () => {
    const documents = new DocumentCase();
    const metadata = documents.metadata({
      properties: { title: { label: "Title", order: 10 } },
      actions: {
        save: {
          fields: { title: { label: "Title", order: 10 } },
          result: { mode: "none", relations: [], optimistic: false },
        },
      },
    });
    const source = documents.actionDocument(metadata, documents.action());
    const projected = new SirenUiEngine().project(documents.input(source));
    const entries = projected.root.accept(new GraphProbe());
    expect(entries.map((entry) => entry.kind)).toContain("entity");
    expect(entries.map((entry) => entry.kind)).toContain("property");
    expect(entries.map((entry) => entry.kind)).toContain("action");
    expect(entries.map((entry) => entry.kind)).toContain("field");
    const meanings = new Map<string, string>();
    for (const entry of entries) {
      const meaning = `${entry.kind}:${entry.name}`;
      expect(meanings.get(entry.identity) ?? meaning).toBe(meaning);
      meanings.set(entry.identity, meaning);
    }
  });
});
