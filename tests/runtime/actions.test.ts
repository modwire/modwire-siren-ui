import { describe, expect, it } from "vitest";
import {
  CancelActionCommand,
  ConfirmActionCommand,
  RequestActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { ResponseCase } from "../support/client/responses";
import { ScriptedTransport } from "../support/client/transport";

describe("action state machine", () => {
  const cases = new ActionCase();
  const responses = new ResponseCase();

  it("does not execute a confirmation-required action on request", async () => {
    const metadata = cases.metadata({
      required: true,
      label: "Save this record?",
      acknowledgement: "save",
    });
    const transport = new ScriptedTransport();
    const session = cases.open(transport, metadata);
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "One"),
    );
    await session.dispatch(new RequestActionCommand(action.identity.value));
    expect(transport.requests).toHaveLength(0);
  });

  it("rejects confirmation without a pending request", async () => {
    const metadata = cases.metadata({
      required: true,
      acknowledgement: "save",
    });
    const session = cases.open(new ScriptedTransport(), metadata);
    const action = cases.action(session);
    await expect(
      session.dispatch(new ConfirmActionCommand(action.identity.value, "save")),
    ).rejects.toThrow();
  });

  it("rejects the wrong acknowledgement without I/O", async () => {
    const metadata = cases.metadata({
      required: true,
      acknowledgement: "save",
    });
    const transport = new ScriptedTransport();
    const session = cases.open(transport, metadata);
    const action = cases.action(session);
    await session.dispatch(new RequestActionCommand(action.identity.value));
    await expect(
      session.dispatch(
        new ConfirmActionCommand(action.identity.value, "wrong"),
      ),
    ).rejects.toThrow();
    expect(transport.requests).toHaveLength(0);
  });

  it("does not execute after cancellation", async () => {
    const metadata = cases.metadata({
      required: true,
      acknowledgement: "save",
    });
    const transport = new ScriptedTransport();
    const session = cases.open(transport, metadata);
    const action = cases.action(session);
    await session.dispatch(new RequestActionCommand(action.identity.value));
    await session.dispatch(new CancelActionCommand(action.identity.value));
    await expect(
      session.dispatch(new ConfirmActionCommand(action.identity.value, "save")),
    ).rejects.toThrow();
    expect(transport.requests).toHaveLength(0);
  });

  it("submits the current draft exactly once", async () => {
    const transport = new ScriptedTransport([
      responses.document(cases.documents.response()),
    ]);
    const session = cases.open(transport);
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    const snapshot = await session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    expect(transport.requests).toHaveLength(1);
    expect(transport.requests[0]).toMatchObject({
      kind: "document",
      method: "POST",
      url: "https://api.example.test/records/one",
      body: { title: "Changed" },
    });
    expect(
      snapshot.document.root.properties.values
        .find((property) => property.name === "title")
        ?.value.text(""),
    ).toBe("Changed");
  });

  it("executes once after valid confirmation", async () => {
    const metadata = cases.metadata({
      required: true,
      acknowledgement: "save",
    });
    const transport = new ScriptedTransport([
      responses.document(cases.documents.response()),
    ]);
    const session = cases.open(transport, metadata);
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "One"),
    );
    await session.dispatch(new RequestActionCommand(action.identity.value));
    await session.dispatch(
      new ConfirmActionCommand(action.identity.value, "save"),
    );
    expect(transport.requests).toHaveLength(1);
  });
});
