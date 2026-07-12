import { describe, expect, it } from "vitest";
import {
  RequestActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { ResponseCase } from "../support/client/responses";
import { ScriptedTransport } from "../support/client/transport";
import { GraphProbe } from "../support/graph";
import { RecordingObserver } from "../support/observer";

describe("complete consumer journeys", () => {
  it("projects, observes, edits, submits, visits, and closes", async () => {
    const cases = new ActionCase();
    const responses = new ResponseCase();
    const session = cases.open(
      new ScriptedTransport([responses.document(cases.documents.response())]),
    );
    const observer = new RecordingObserver();
    session.subscribe(observer);
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    const committed = await session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    const graph = committed.document.root.accept(new GraphProbe());
    expect(graph.some((entry) => entry.kind === "entity")).toBe(true);
    expect(graph.some((entry) => entry.name === "Changed")).toBe(false);
    expect(observer.snapshots.at(-1)).toBe(committed);
    expect(committed.busy.size).toBe(0);
    expect(() => {
      session.close();
    }).not.toThrow();
  });
});
