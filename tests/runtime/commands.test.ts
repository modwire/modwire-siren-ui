import { describe, expect, it } from "vitest";
import {
  CancelActionCommand,
  LoadRelationCommand,
  RequestActionCommand,
  ResetActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { SirenUiError } from "@modwire/siren-ui/extensions";
import { ActionCase } from "../support/actions";
import { ScriptedTransport } from "../support/client/transport";

describe("public command boundary", () => {
  const cases = new ActionCase();

  it.each([
    new SetFieldCommand("missing", "title", "Changed"),
    new ResetActionCommand("missing"),
    new RequestActionCommand("missing"),
    new CancelActionCommand("missing"),
    new LoadRelationCommand("missing"),
  ])("rejects an unknown semantic target without I/O", async (command) => {
    const transport = new ScriptedTransport();
    const session = cases.open(transport);
    await expect(session.dispatch(command)).rejects.toBeInstanceOf(
      SirenUiError,
    );
    expect(transport.requests).toHaveLength(0);
  });

  it("rejects a non-JSON field value before dispatch", () => {
    expect(() => new SetFieldCommand("action", "title", undefined)).toThrow();
  });

  it("rejects every command after close without I/O", async () => {
    const transport = new ScriptedTransport();
    const session = cases.open(transport);
    const action = cases.action(session);
    session.close();
    await expect(
      session.dispatch(new ResetActionCommand(action.identity.value)),
    ).rejects.toBeInstanceOf(SirenUiError);
    expect(transport.requests).toHaveLength(0);
  });

  it("updates a known action field through its semantic identity", async () => {
    const session = cases.open(new ScriptedTransport());
    const action = cases.action(session);
    const snapshot = await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    expect(
      snapshot.draft(action.identity.value).values().property("title").text(""),
    ).toBe("Changed");
  });
});
