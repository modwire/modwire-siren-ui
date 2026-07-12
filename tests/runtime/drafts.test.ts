import { describe, expect, it } from "vitest";
import {
  ResetActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { ScriptedTransport } from "../support/client/transport";

describe("immutable action drafts", () => {
  const cases = new ActionCase();

  it("does not mutate an earlier snapshot", async () => {
    const session = cases.open(new ScriptedTransport());
    const action = cases.action(session);
    const before = session.snapshot;
    const after = await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    expect(
      before.draft(action.identity.value).values().property("title").present,
    ).toBe(false);
    expect(
      after.draft(action.identity.value).values().property("title").text(""),
    ).toBe("Changed");
  });

  it("isolates a command from later input mutation", async () => {
    const session = cases.open(new ScriptedTransport());
    const action = cases.action(session);
    const source = { nested: { value: "before" } };
    const command = new SetFieldCommand(action.identity.value, "title", source);
    source.nested.value = "after";
    const snapshot = await session.dispatch(command);
    expect(
      snapshot
        .draft(action.identity.value)
        .values()
        .property("title")
        .property("nested")
        .property("value")
        .text(""),
    ).toBe("before");
  });

  it("resets an edited draft without changing the old snapshot", async () => {
    const session = cases.open(new ScriptedTransport());
    const action = cases.action(session);
    const edited = await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    const reset = await session.dispatch(
      new ResetActionCommand(action.identity.value),
    );
    expect(
      edited.draft(action.identity.value).values().property("title").text(""),
    ).toBe("Changed");
    expect(
      reset.draft(action.identity.value).values().property("title").present,
    ).toBe(false);
  });
});
