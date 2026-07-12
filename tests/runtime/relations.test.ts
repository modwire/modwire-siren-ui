import { describe, expect, it } from "vitest";
import { LoadRelationCommand } from "@modwire/siren-ui/commands";
import { RelationCase } from "../support/relations";
import { ResponseCase } from "../support/client/responses";
import { ScriptedTransport } from "../support/client/transport";
import { Deferred } from "../support/deferred";

describe("relation loading", () => {
  const cases = new RelationCase();
  const responses = new ResponseCase();

  it("does not issue I/O for a forged URL target", async () => {
    const transport = new ScriptedTransport();
    const session = cases.open(transport);
    await expect(
      session.dispatch(
        new LoadRelationCommand("https://attacker.test/private"),
      ),
    ).rejects.toThrow();
    expect(transport.requests).toHaveLength(0);
  });

  it("clears busy state after transport failure", async () => {
    const transport = new ScriptedTransport([new Error("network unavailable")]);
    const session = cases.open(transport);
    const relation = cases.relation(session);
    await expect(
      session.dispatch(new LoadRelationCommand(relation.identity.value)),
    ).rejects.toThrow("network unavailable");
    expect(session.snapshot.busy.size).toBe(0);
    expect(session.snapshot.document.root.properties.length).toBeGreaterThan(0);
  });

  it("does not let an older relation completion replace a newer one", async () => {
    const older = new Deferred<ReturnType<ResponseCase["document"]>>();
    const newer = new Deferred<ReturnType<ResponseCase["document"]>>();
    const session = cases.open(
      new ScriptedTransport([older.promise, newer.promise]),
    );
    const relation = cases.relation(session);
    const first = session.dispatch(
      new LoadRelationCommand(relation.identity.value),
    );
    const second = session.dispatch(
      new LoadRelationCommand(relation.identity.value),
    );
    newer.resolve(
      responses.document(
        cases.documents.response({
          properties: { id: "two", title: "Newer" },
        }),
      ),
    );
    await second;
    older.resolve(
      responses.document(
        cases.documents.response({
          properties: { id: "two", title: "Older" },
        }),
      ),
    );
    await first;
    expect(
      session.snapshot.document.root.properties.values
        .find((property) => property.name === "title")
        ?.value.text(""),
    ).toBe("Newer");
  });

  it("follows only the advertised relation", async () => {
    const transport = new ScriptedTransport([
      responses.document(
        cases.documents.response({
          properties: { id: "two", title: "Two" },
          links: [
            {
              rel: ["self"],
              href: "https://api.example.test/records/two",
            },
          ],
        }),
      ),
    ]);
    const session = cases.open(transport);
    const relation = cases.relation(session);
    const snapshot = await session.dispatch(
      new LoadRelationCommand(relation.identity.value),
    );
    expect(transport.requests).toHaveLength(1);
    expect(transport.requests[0]).toMatchObject({
      kind: "bodyless",
      method: "GET",
      url: "https://api.example.test/records/two",
    });
    expect(snapshot.busy.size).toBe(0);
  });
});
