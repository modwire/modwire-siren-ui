import { describe, expect, it } from "vitest";
import type { UiSession } from "@modwire/siren-ui";
import {
  RequestActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { ResponseCase } from "../support/client/responses";
import { ScriptedTransport } from "../support/client/transport";
import { ImmediateScheduler } from "../support/scheduler";

describe("action result strategies", () => {
  const cases = new ActionCase();
  const responses = new ResponseCase();

  it("rejects replace when no replacement document is returned", async () => {
    const session = cases.open(new ScriptedTransport([responses.empty()]));
    const action = await draft(session);
    await expect(
      session.dispatch(new RequestActionCommand(action.identity.value)),
    ).rejects.toThrow();
    expect(session.snapshot.busy.size).toBe(0);
    expect(title(session)).toBe("One");
  });

  it("retains the current document for none", async () => {
    const metadata = cases.metadata(
      { required: false },
      { mode: "none", relations: [], optimistic: false },
    );
    const session = cases.open(
      new ScriptedTransport([responses.empty()]),
      metadata,
    );
    const before = session.snapshot.document;
    const action = await draft(session);
    const snapshot = await session.dispatch(
      new RequestActionCommand(action.identity.value),
    );
    expect(snapshot.document.source).toBe(before.source);
    expect(title(session)).toBe("One");
    expect(snapshot.busy.size).toBe(0);
  });

  it("refreshes only the declared relation", async () => {
    const metadata = cases.metadata(
      { required: false },
      { mode: "refresh", relations: ["self"], optimistic: false },
    );
    const transport = new ScriptedTransport([
      responses.empty(),
      responses.document(
        cases.documents.response({
          properties: { id: "one", title: "Refreshed" },
        }),
      ),
    ]);
    const session = cases.open(transport, metadata);
    const action = await draft(session);
    await session.dispatch(new RequestActionCommand(action.identity.value));
    expect(transport.requests).toHaveLength(2);
    expect(transport.requests[1]).toMatchObject({
      method: "GET",
      url: "https://api.example.test/records/one",
    });
    expect(title(session)).toBe("Refreshed");
  });

  it("navigates through a declared response relation", async () => {
    const metadata = cases.metadata(
      { required: false },
      { mode: "navigate", relations: ["up"], optimistic: false },
    );
    const transport = new ScriptedTransport([
      responses.document(
        cases.documents.response({
          links: [
            {
              rel: ["self"],
              href: "https://api.example.test/records/one",
            },
            { rel: ["up"], href: "https://api.example.test/records" },
          ],
        }),
      ),
      responses.document(
        cases.documents.response({
          properties: { id: "collection", title: "Navigated" },
          links: [{ rel: ["self"], href: "https://api.example.test/records" }],
        }),
      ),
    ]);
    const session = cases.open(transport, metadata);
    const action = await draft(session);
    await session.dispatch(new RequestActionCommand(action.identity.value));
    expect(transport.requests).toHaveLength(2);
    expect(transport.requests[1]).toMatchObject({
      method: "GET",
      url: "https://api.example.test/records",
    });
    expect(title(session)).toBe("Navigated");
  });

  it("monitors only the declared progress relation until terminal state", async () => {
    const metadata = cases.metadata(
      { required: false },
      { mode: "monitor", relations: ["progress"], optimistic: false },
    );
    const scheduler = new ImmediateScheduler();
    const transport = new ScriptedTransport([
      responses.document(
        cases.documents.response({
          links: [
            {
              rel: ["self"],
              href: "https://api.example.test/operations/one",
            },
            {
              rel: ["progress"],
              href: "https://api.example.test/operations/one/progress",
            },
          ],
        }),
      ),
      responses.document(
        cases.documents.response({
          properties: { id: "one", title: "Completed", status: "succeeded" },
          links: [
            {
              rel: ["self"],
              href: "https://api.example.test/operations/one/progress",
            },
          ],
        }),
      ),
    ]);
    const session = cases.open(transport, metadata, scheduler);
    const action = await draft(session);
    await session.dispatch(new RequestActionCommand(action.identity.value));
    expect(transport.requests).toHaveLength(2);
    expect(transport.requests[1]).toMatchObject({
      method: "GET",
      url: "https://api.example.test/operations/one/progress",
    });
    expect(scheduler.waits.length).toBeLessThanOrEqual(1);
    expect(session.snapshot.busy.size).toBe(0);
    expect(title(session)).toBe("Completed");
  });

  it("replaces the current document on the ordinary happy path", async () => {
    const session = cases.open(
      new ScriptedTransport([responses.document(cases.documents.response())]),
    );
    const action = await draft(session);
    await session.dispatch(new RequestActionCommand(action.identity.value));
    expect(title(session)).toBe("Changed");
  });

  async function draft(session: UiSession) {
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
