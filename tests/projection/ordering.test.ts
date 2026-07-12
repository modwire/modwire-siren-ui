import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import { DocumentCase } from "../support/client/documents";

describe("deterministic projection", () => {
  const documents = new DocumentCase();
  const engine = new SirenUiEngine();

  it("does not let source property order decide presentation", () => {
    const first = project(["zulu", "alpha", "middle"]);
    const second = project(["middle", "zulu", "alpha"]);
    expect(first).toEqual(["alpha", "middle", "zulu"]);
    expect(second).toEqual(first);
  });

  it("breaks equal property orders by name", () => {
    const metadata = documents.metadata({
      properties: {
        zulu: { order: 10 },
        alpha: { order: 10 },
        middle: { order: 10 },
      },
    });
    const source = documents.profiled(metadata, {
      properties: { zulu: 1, alpha: 2, middle: 3 },
    });
    const projected = engine.project(documents.input(source));
    expect([...projected.root.properties].map((node) => node.name)).toEqual([
      "alpha",
      "middle",
      "zulu",
    ]);
  });

  it("places all unassigned content in a deterministic other region", () => {
    const metadata = documents.metadata({
      presentation: {
        role: "detail",
        layout: {
          kind: "flow",
          regions: [
            {
              id: "selected",
              order: 10,
              content: {
                properties: ["alpha"],
                relations: [],
                actions: [],
              },
            },
          ],
        },
      },
    });
    const source = documents.profiled(metadata, {
      properties: { alpha: 1, zulu: 2 },
    });
    const projected = engine.project(documents.input(source));
    expect([...projected.root.regions].map((region) => region.id)).toEqual([
      "selected",
      "other",
    ]);
    expect(
      [...projected.root.regions][1]?.properties.values.map(
        (node) => node.name,
      ),
    ).toEqual(["zulu"]);
  });

  it("breaks equal action and field orders by name", () => {
    const metadata = documents.metadata({
      actions: {
        zulu: {
          order: 10,
          fields: { zulu: { order: 10 }, alpha: { order: 10 } },
        },
        alpha: { order: 10 },
      },
    });
    const source = documents.profiled(metadata, {
      actions: [
        {
          name: "zulu",
          method: "POST",
          href: "https://api.example.test/zulu",
          fields: [
            { name: "zulu", type: "text" },
            { name: "alpha", type: "text" },
          ],
        },
        {
          name: "alpha",
          method: "POST",
          href: "https://api.example.test/alpha",
        },
      ],
    });
    const projected = engine.project(documents.input(source));
    expect(projected.root.actions.values.map((action) => action.name)).toEqual([
      "alpha",
      "zulu",
    ]);
    expect(
      projected.root.actions.values[1]?.fields.values.map(
        (field) => field.name,
      ),
    ).toEqual(["alpha", "zulu"]);
  });

  it("projects the same graph for equivalent source permutations", () => {
    expect(project(["zulu", "alpha", "middle"])).toEqual(
      project(["alpha", "middle", "zulu"]),
    );
  });

  function project(names: readonly string[]): readonly string[] {
    const properties: Record<string, unknown> = {};
    for (const name of names) {
      properties[name] = name;
    }
    const projected = engine.project(
      documents.input(documents.document({ properties })),
    );
    return [...projected.root.properties].map((node) => node.name);
  }
});
