import { SirenUiEngine, type UiSession } from "@modwire/siren-ui";
import type { UiRelationNode } from "@modwire/siren-ui/model";
import { DocumentCase } from "./client/documents";
import type { ScriptedTransport } from "./client/transport";

export class RelationCase {
  readonly documents = new DocumentCase();

  open(transport: ScriptedTransport): UiSession {
    const metadata = this.documents.metadata({
      relations: {
        next: {
          role: "navigation",
          loading: "manual",
          cardinality: "one",
          label: "Next",
        },
      },
    });
    const source = this.documents.profiled(metadata, {
      links: [
        {
          rel: ["self"],
          href: "https://api.example.test/records/one",
        },
        {
          rel: ["next"],
          href: "https://api.example.test/records/two",
        },
      ],
    });
    return new SirenUiEngine().open(this.documents.input(source), transport);
  }

  relation(session: UiSession): UiRelationNode {
    const relation = session.snapshot.document.root.relations.values[0];
    if (!relation) {
      throw new Error("Expected projected relation");
    }
    return relation;
  }
}
