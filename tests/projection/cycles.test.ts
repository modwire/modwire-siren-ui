import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import { DocumentCase } from "../support/client/documents";

describe("canonical entity cycles", () => {
  const documents = new DocumentCase();

  it("does not recurse through a repeated canonical self link", () => {
    const repeated = {
      class: ["record"],
      rel: ["related"],
      properties: { id: "one", title: "Repeated root" },
      entities: [],
      actions: [],
      links: [{ rel: ["self"], href: "https://api.example.test/records/one" }],
    };
    const metadata = documents.metadata({
      relations: {
        related: {
          role: "supplementary",
          loading: "embedded",
          cardinality: "one",
        },
      },
    });
    const source = documents.profiled(metadata, { entities: [repeated] });
    const projected = new SirenUiEngine().project(documents.input(source));
    const relation = [...projected.root.relations][0];
    expect(relation?.entities.length).toBe(0);
    expect(relation?.references.length).toBe(1);
    expect(relation?.references.values[0]?.canonicalUrl).toBe(
      "https://api.example.test/records/one",
    );
    expect(relation?.references.values[0]?.target.value).toBe(
      projected.root.identity.value,
    );
  });

  it("normalizes an ordinary embedded entity", () => {
    const child = {
      class: ["section"],
      rel: ["related"],
      properties: { id: "two", title: "Child" },
      entities: [],
      actions: [],
      links: [{ rel: ["self"], href: "https://api.example.test/records/two" }],
    };
    const metadata = documents.metadata({
      relations: {
        related: {
          role: "supplementary",
          loading: "embedded",
          cardinality: "one",
        },
      },
    });
    const projected = new SirenUiEngine().project(
      documents.input(documents.profiled(metadata, { entities: [child] })),
    );
    const relation = [...projected.root.relations][0];
    expect(relation?.entities.length).toBe(1);
    expect(relation?.references.length).toBe(0);
  });
});
