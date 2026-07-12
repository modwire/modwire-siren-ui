import type {
  ProfileDiscovery,
  SirenAction,
  SirenEntity,
  SirenField,
} from "@modwire/siren-client";
import { UiDiagnostics } from "../domain/diagnostics/collection";
import { UiDiagnostic } from "../domain/diagnostics/diagnostic";
import type { ProfileContext } from "../domain/profile/context";
import { GenericProfileContext } from "../domain/profile/generic";
import { SupportedProfileContext } from "../domain/profile/supported";
import { SourceAction } from "../domain/source/action";
import { SourceDocument } from "../domain/source/document";
import { SourceEntity } from "../domain/source/entity";
import { SourceField } from "../domain/source/field";
import { SourceLink } from "../domain/source/link";
import { UiValue } from "../domain/source/value";
import { PresentationRole } from "../domain/vocabulary/presentation-role";
import { ProfileVocabulary } from "../domain/vocabulary/profile";
import { ClientActionReference } from "./action-reference";
import { ClientDocumentReference } from "./document-reference";
import { ClientEntityReference } from "./entity-reference";
import { ClientFieldReference } from "./field-reference";
import type { ClientDocumentInput } from "./document-input";

export class ClientDocumentAdapter {
  adapt(document: ClientDocumentInput): SourceDocument {
    return new SourceDocument(
      new ClientDocumentReference(document),
      this.entity(document.root),
      this.profile(document.profile),
    );
  }

  private entity(entity: SirenEntity): SourceEntity {
    return new SourceEntity(
      new ClientEntityReference(entity),
      entity.classes,
      entity.relations,
      UiValue.from(entity.properties),
      entity.entities.values.map((child) => this.entity(child)),
      entity.actions.values.map((action) => this.action(action)),
      entity.links.values.map(
        (link) => new SourceLink(link.relations, link.href),
      ),
    );
  }

  private action(action: SirenAction): SourceAction {
    return new SourceAction(
      new ClientActionReference(action),
      action.name,
      action.fields.values.map((field) => this.field(field)),
    );
  }

  private field(field: SirenField): SourceField {
    return new SourceField(
      new ClientFieldReference(field),
      field.name,
      field.type,
      field.value.kind === "present"
        ? UiValue.from(field.value.value)
        : UiValue.absent(),
      field.required,
    );
  }

  private profile(discovery: ProfileDiscovery): ProfileContext {
    if (discovery.state === ProfileVocabulary.found) {
      return new SupportedProfileContext(
        discovery.identifier,
        discovery.profile.language ?? "",
        UiDiagnostics.empty(),
        UiValue.from(discovery.profile),
      );
    }
    return new GenericProfileContext(
      discovery.identifier,
      new UiDiagnostics(
        discovery.issues.map(
          (issue) =>
            new UiDiagnostic(
              issue.code,
              issue.pointer,
              issue.severity,
              issue.message,
              "",
            ),
        ),
      ),
      PresentationRole.detail,
    );
  }
}
