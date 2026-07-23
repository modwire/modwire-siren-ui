import { describe, expect, it } from "vitest";
import { SirenUiEngine } from "@modwire/siren-ui";
import {
  LoadRelationCommand,
  RequestActionCommand,
  SetFieldCommand,
} from "@modwire/siren-ui/commands";
import { ResponseCase } from "../support/client/responses";
import { DocumentCase } from "../support/client/documents";
import { ScriptedTransport } from "../support/client/transport";

describe("nested Siren affordances", () => {
  it("executes and follows controls owned two entity levels below the root", async () => {
    const documents = new DocumentCase();
    const responses = new ResponseCase();
    const metadata = documents.metadata({
      actions: {
        save: {
          intent: "primary",
          placement: "entity",
          label: "Save record",
          confirmation: { required: false },
          fields: {
            title: { widget: "text", label: "Title", order: 10 },
          },
          result: {
            mode: "replace",
            relations: [],
            optimistic: false,
          },
        },
      },
      relations: {
        next: {
          role: "navigation",
          loading: "manual",
          cardinality: "one",
          label: "Next",
        },
      },
    });
    const source = documents.profiled(metadata, {
      entities: [
        {
          class: ["group"],
          rel: ["groups"],
          properties: { id: "group-one" },
          entities: [
            {
              class: ["record"],
              rel: ["records"],
              properties: { id: "record-one", title: "One" },
              actions: [
                documents.action({
                  href: "nested/save",
                }),
              ],
              links: [{ rel: ["next"], href: "nested/next" }],
            },
          ],
        },
      ],
      links: [
        {
          rel: ["self"],
          href: "https://api.example.test/records/root",
        },
      ],
    });
    const transport = new ScriptedTransport([
      responses.document(source),
      responses.document(documents.response()),
    ]);
    const session = new SirenUiEngine().open(
      documents.input(source),
      transport,
    );
    const groups = session.snapshot.document.root.relations.values.find(
      (relation) => relation.relation === "groups",
    );
    const group = groups?.entities.values[0];
    const records = group?.relations.values.find(
      (relation) => relation.relation === "records",
    );
    const record = records?.entities.values[0];
    const action = record?.actions.values[0];
    if (!action) throw new Error("Expected nested action");

    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    await session.dispatch(new RequestActionCommand(action.identity.value));
    expect(transport.requests[0]).toMatchObject({
      kind: "document",
      method: "POST",
      url: "https://api.example.test/records/nested/save",
      body: { title: "Changed" },
    });

    const updatedGroups = session.snapshot.document.root.relations.values.find(
      (relation) => relation.relation === "groups",
    );
    const updatedGroup = updatedGroups?.entities.values[0];
    const updatedRecords = updatedGroup?.relations.values.find(
      (relation) => relation.relation === "records",
    );
    const updatedRecord = updatedRecords?.entities.values[0];
    const relation = updatedRecord?.relations.values.find(
      (node) => node.relation === "next",
    );
    if (!relation) throw new Error("Expected nested relation");

    await session.dispatch(new LoadRelationCommand(relation.identity.value));
    expect(transport.requests[1]).toMatchObject({
      kind: "bodyless",
      method: "GET",
      url: "https://api.example.test/records/nested/next",
    });
  });
});
