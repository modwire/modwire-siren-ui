import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import { DocumentCase } from "../support/client/documents";
import { ScriptedTransport } from "../support/client/transport";

describe("public graph immutability", () => {
  const documents = new DocumentCase();

  it("does not expose mutable collection arrays", () => {
    const projected = new SirenUiEngine().project(
      documents.input(documents.profiled(documents.metadata())),
    );
    const values = projected.root.properties.values as unknown[];
    expect(Object.isFrozen(values)).toBe(true);
    expect(() => values.push("intruder")).toThrow();
  });

  it("does not expose a mutable busy set", () => {
    const session = new SirenUiEngine().open(
      documents.input(documents.profiled(documents.metadata())),
      new ScriptedTransport(),
    );
    const busy = session.snapshot.busy as Set<string>;
    expect(() => busy.add("intruder")).toThrow();
    expect(session.snapshot.busy.has("intruder")).toBe(false);
  });

  it("projects immutable values on the happy path", () => {
    const projected = new SirenUiEngine().project(
      documents.input(documents.profiled(documents.metadata())),
    );
    expect(Object.isFrozen(projected)).toBe(true);
    expect(Object.isFrozen(projected.root)).toBe(true);
    expect(Object.isFrozen(projected.root.properties.values)).toBe(true);
  });
});
