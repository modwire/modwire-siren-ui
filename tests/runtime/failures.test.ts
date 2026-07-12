import { describe, expect, it } from "vitest";
import {
  RequestActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { RecordingObserver } from "../support/observer";
import { ResponseCase } from "../support/client/responses";
import { ScriptedTransport } from "../support/client/transport";

describe("transaction failure containment", () => {
  const cases = new ActionCase();
  const responses = new ResponseCase();

  it("publishes pending state before a transport rejection", async () => {
    const transport = new ScriptedTransport([new Error("offline")]);
    const session = cases.open(transport);
    const observer = new RecordingObserver();
    session.subscribe(observer);
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "One"),
    );
    observer.snapshots.length = 0;
    await expect(
      session.dispatch(new RequestActionCommand(action.identity.value)),
    ).rejects.toThrow("offline");
    expect(observer.snapshots[0]?.busy.has(action.identity.value)).toBe(true);
    expect(session.snapshot.busy.size).toBe(0);
  });

  it("preserves the committed document after malformed response", async () => {
    const transport = new ScriptedTransport([
      responses.hostile({ kind: "document", status: 200, headers: {} }),
    ]);
    const session = cases.open(transport);
    const before = session.snapshot.document;
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "One"),
    );
    await expect(
      session.dispatch(new RequestActionCommand(action.identity.value)),
    ).rejects.toThrow();
    expect(session.snapshot.document).toBe(before);
    expect(session.snapshot.busy.size).toBe(0);
  });

  it("preserves the committed document after a remote problem", async () => {
    const transport = new ScriptedTransport([
      responses.problem({
        type: "https://api.example.test/problems/rejected",
        title: "Rejected",
        status: 422,
      }),
    ]);
    const session = cases.open(transport);
    const before = session.snapshot.document;
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "One"),
    );
    await expect(
      session.dispatch(new RequestActionCommand(action.identity.value)),
    ).rejects.toThrow();
    expect(session.snapshot.document).toBe(before);
    expect(session.snapshot.busy.size).toBe(0);
  });
});
