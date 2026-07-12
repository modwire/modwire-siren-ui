import { describe, expect, it } from "vitest";
import {
  RequestActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { ResponseCase } from "../support/client/responses";
import { ScriptedTransport } from "../support/client/transport";
import { Deferred } from "../support/deferred";
import { RecordingObserver } from "../support/observer";

describe("session lifecycle", () => {
  const cases = new ActionCase();
  const responses = new ResponseCase();

  it("invalidates an outstanding completion on close", async () => {
    const deferred = new Deferred<ReturnType<ResponseCase["document"]>>();
    const session = cases.open(new ScriptedTransport([deferred.promise]));
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    const operation = session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    session.close();
    session.close();
    deferred.resolve(
      responses.document(
        cases.documents.response({
          properties: { id: "one", title: "Late" },
        }),
      ),
    );
    await operation;
    expect(
      session.snapshot.document.root.properties.values
        .find((property) => property.name === "title")
        ?.value.text(""),
    ).toBe("One");
    expect(session.snapshot.busy.size).toBe(0);
  });

  it("does not publish a late completion after close", async () => {
    const deferred = new Deferred<ReturnType<ResponseCase["document"]>>();
    const session = cases.open(new ScriptedTransport([deferred.promise]));
    const observer = new RecordingObserver();
    session.subscribe(observer);
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    const operation = session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    session.close();
    const count = observer.snapshots.length;
    deferred.resolve(responses.document(cases.documents.response()));
    await operation;
    expect(observer.snapshots).toHaveLength(count);
  });

  it("rejects new subscriptions after close", () => {
    const session = cases.open(new ScriptedTransport());
    session.close();
    expect(() => session.subscribe(new RecordingObserver())).toThrow();
  });

  it("closes an idle session repeatedly", () => {
    const session = cases.open(new ScriptedTransport());
    session.close();
    expect(() => {
      session.close();
    }).not.toThrow();
  });
});
