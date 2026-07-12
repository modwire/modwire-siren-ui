import {
  ClientRuntime,
  SirenUiEngine,
  SirenUiOptions,
  type UiSession,
} from "@modwire/siren-ui";
import type { UiActionNode } from "@modwire/siren-ui/model";
import type { UiScheduler } from "@modwire/siren-ui/extensions";
import { DocumentCase } from "./client/documents";
import type { ScriptedTransport } from "./client/transport";
import type { FixtureObject } from "./fixture";

export class ActionCase {
  readonly documents = new DocumentCase();

  metadata(
    confirmation: FixtureObject = { required: false },
    result: FixtureObject = {
      mode: "replace",
      relations: [],
      optimistic: false,
    },
  ): FixtureObject {
    return this.documents.metadata({
      actions: {
        save: {
          intent: "primary",
          placement: "entity",
          label: "Save record",
          confirmation,
          fields: {
            title: { widget: "text", label: "Title", order: 10 },
          },
          result,
        },
      },
    });
  }

  source(metadata: FixtureObject = this.metadata()): FixtureObject {
    return this.documents.actionDocument(metadata, this.documents.action());
  }

  open(
    transport: ScriptedTransport,
    metadata: FixtureObject = this.metadata(),
    scheduler?: UiScheduler,
  ): UiSession {
    const engine = scheduler
      ? new SirenUiEngine(
          new SirenUiOptions(new ClientRuntime(), [], scheduler),
        )
      : new SirenUiEngine();
    return engine.open(this.documents.input(this.source(metadata)), transport);
  }

  action(session: UiSession): UiActionNode {
    const action = session.snapshot.document.root.actions.values[0];
    if (!action) {
      throw new Error("Expected projected action");
    }
    return action;
  }
}
