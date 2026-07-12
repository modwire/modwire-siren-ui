import type { UiDocument } from "../domain/document/document";
import { UiSession } from "../runtime/session";
import { Composition } from "./composition";
import { SirenUiOptions } from "./options";
import type { ClientDocumentInput } from "../adapters/document-input";
import type { ClientTransportInput } from "../adapters/transport-input";

export class SirenUiEngine {
  private readonly composition: Composition;
  constructor(options: SirenUiOptions = SirenUiOptions.standard()) {
    this.composition = new Composition(options);
  }
  project(document: ClientDocumentInput): UiDocument {
    return this.composition.projector.project(
      this.composition.options.client.adapt(document),
    );
  }
  open(
    document: ClientDocumentInput,
    transport: ClientTransportInput,
  ): UiSession {
    return new UiSession(
      this.composition.projector,
      this.composition.options.client.gateway(transport),
      this.composition.options.scheduler,
      this.composition.results,
      this.composition.options.client.adapt(document),
    );
  }
}
