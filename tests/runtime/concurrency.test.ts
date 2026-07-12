import { describe, expect, it } from "vitest";
import type { UiSession } from "@modwire/siren-ui";
import {
  RequestActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { ResponseCase } from "../support/client/responses";
import { ScriptedTransport } from "../support/client/transport";
import { Deferred } from "../support/deferred";

describe("operation concurrency", () => {
  const cases = new ActionCase();
  const responses = new ResponseCase();

  it("does not let an older completion replace a newer result", async () => {
    const first = new Deferred<ReturnType<ResponseCase["document"]>>();
    const second = new Deferred<ReturnType<ResponseCase["document"]>>();
    const transport = new ScriptedTransport([first.promise, second.promise]);
    const session = cases.open(transport);
    const action = await drafted(session);
    const older = session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    const newer = session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    second.resolve(
      responses.document(
        cases.documents.response({
          properties: { id: "one", title: "Newer" },
        }),
      ),
    );
    await newer;
    first.resolve(
      responses.document(
        cases.documents.response({
          properties: { id: "one", title: "Older" },
        }),
      ),
    );
    await older;
    expect(title(session)).toBe("Newer");
  });

  it("does not let an older failure clear a newer busy operation", async () => {
    const first = new Deferred<ReturnType<ResponseCase["document"]>>();
    const second = new Deferred<ReturnType<ResponseCase["document"]>>();
    const session = cases.open(
      new ScriptedTransport([first.promise, second.promise]),
    );
    const action = await drafted(session);
    const older = session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    const newer = session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    first.reject(new Error("older failed"));
    await expect(older).rejects.toThrow("older failed");
    expect(session.snapshot.busy.has(action.identity.value)).toBe(true);
    second.resolve(responses.document(cases.documents.response()));
    await newer;
    expect(session.snapshot.busy.size).toBe(0);
  });

  it("commits one ordinary action completion", async () => {
    const session = cases.open(
      new ScriptedTransport([responses.document(cases.documents.response())]),
    );
    const action = await drafted(session);
    await session.dispatch(new RequestActionCommand(action.identity.value));
    expect(title(session)).toBe("Changed");
  });

  async function drafted(session: UiSession) {
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    return action;
  }

  function title(session: UiSession): string {
    return (
      session.snapshot.document.root.properties.values
        .find((property) => property.name === "title")
        ?.value.text("") ?? ""
    );
  }
});
