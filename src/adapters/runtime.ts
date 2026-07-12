import { SirenClient } from "@modwire/siren-client";
import type { SourceDocument } from "../domain/source/document";
import { ClientGateway } from "./client-gateway";
import { ClientDocumentAdapter } from "./document-adapter";
import type { ClientDocumentInput } from "./document-input";
import type { ClientTransportInput } from "./transport-input";

export class ClientRuntime {
  private readonly documents = new ClientDocumentAdapter();

  constructor(private readonly client: SirenClient = new SirenClient()) {}

  adapt(document: ClientDocumentInput): SourceDocument {
    return this.documents.adapt(document);
  }

  gateway(transport: ClientTransportInput): ClientGateway {
    return new ClientGateway(this.client, transport, this.documents);
  }
}
