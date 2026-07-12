import { SirenClient, type JsonObject } from "@modwire/siren-client";
import type { ClientDocumentInput } from "@modwire/siren-ui";
import type { FixtureObject } from "../fixture";

export class DocumentCase {
  static readonly profile =
    "https://raw.githubusercontent.com/modwire/modwire-siren/main/docs/siren-ui-profile/README.md";
  static readonly profileRelation = `${DocumentCase.profile}#profile-entity`;

  readonly client = new SirenClient();

  input(source: FixtureObject): ClientDocumentInput {
    const adapted = source as JsonObject;
    const document = this.client.parse(adapted);
    return {
      source: adapted,
      root: document.root,
      profile: document.profile,
    };
  }

  document(overrides: FixtureObject = {}): FixtureObject {
    return {
      class: ["record"],
      properties: { id: "one", title: "One" },
      entities: [],
      actions: [],
      links: [{ rel: ["self"], href: "https://api.example.test/records/one" }],
      ...overrides,
    };
  }

  profiled(
    metadata: FixtureObject,
    overrides: FixtureObject = {},
  ): FixtureObject {
    const base = this.document(overrides);
    const entities = this.array(base.entities);
    const links = this.array(base.links);
    return {
      ...base,
      entities: [
        ...entities,
        {
          class: ["modwire-ui-profile"],
          rel: [DocumentCase.profileRelation],
          properties: metadata,
        },
      ],
      links: [...links, { rel: ["profile"], href: DocumentCase.profile }],
    };
  }

  metadata(overrides: FixtureObject = {}): FixtureObject {
    return {
      profile: DocumentCase.profile,
      presentation: { role: "detail", label: "Record" },
      ...overrides,
    };
  }

  actionDocument(
    metadata: FixtureObject,
    action: FixtureObject,
  ): FixtureObject {
    return this.profiled(metadata, { actions: [action] });
  }

  action(overrides: FixtureObject = {}): FixtureObject {
    return {
      name: "save",
      method: "POST",
      href: "https://api.example.test/records/one",
      type: "application/json",
      fields: [{ name: "title", type: "text", value: "One", required: true }],
      ...overrides,
    };
  }

  response(overrides: FixtureObject = {}): FixtureObject {
    return this.document({
      properties: { id: "one", title: "Changed" },
      ...overrides,
    });
  }

  private array(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? (value as unknown[]) : [];
  }
}
