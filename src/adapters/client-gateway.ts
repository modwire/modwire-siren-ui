import {
  SirenClient,
  type SirenActionValue,
  type SirenActionValues,
  type SirenTransport,
} from "@modwire/siren-client";
import { DocumentExchange } from "../domain/exchange/document";
import { EmptyExchange } from "../domain/exchange/empty";
import type { SirenExchange } from "../domain/exchange/base";
import { SirenUiError } from "../errors/error";
import type { SirenGateway } from "../ports/gateway";
import { ClientCapability } from "../domain/vocabulary/capability";
import { ExchangeKind } from "../domain/vocabulary/exchange";
import { SirenUiCode } from "../errors/code";
import type { SourceDocument } from "../domain/source/document";
import type { SourceEntity } from "../domain/source/entity";
import type { UiValue } from "../domain/source/value";
import { ClientDocumentReference } from "./document-reference";
import { ClientEntityReference } from "./entity-reference";
import type { ClientDocumentAdapter } from "./document-adapter";

export class ClientGateway implements SirenGateway {
  constructor(
    private readonly client: SirenClient,
    private readonly transport: SirenTransport,
    private readonly documents: ClientDocumentAdapter,
  ) {}
  async follow(
    document: SourceDocument,
    relation: string,
  ): Promise<SirenExchange> {
    return new DocumentExchange(
      this.documents.adapt(
        await this.client.follow(
          this.document(document),
          relation,
          this.transport,
        ),
      ),
    );
  }
  resolve(
    document: SourceDocument,
    entity: SourceEntity,
  ): Promise<SirenExchange> {
    void document;
    void entity;
    return Promise.reject(
      this.unsupported(ClientCapability.linkedEntityResolution),
    );
  }
  async execute(
    document: SourceDocument,
    entity: SourceEntity,
    action: string,
    values: UiValue,
  ): Promise<SirenExchange> {
    const sourceDocument = this.document(document);
    const sourceEntity = this.entity(entity);
    if (sourceEntity !== sourceDocument.root)
      throw this.unsupported(ClientCapability.nestedActionExecution);
    const result = await this.client.execute(
      sourceDocument,
      action,
      this.values(values),
      this.transport,
    );
    return result.kind === ExchangeKind.document
      ? new DocumentExchange(this.documents.adapt(result.document))
      : new EmptyExchange();
  }

  private unsupported(capability: string): SirenUiError {
    return new SirenUiError(
      SirenUiCode.clientCapability,
      `Siren client capability is unavailable: ${capability}`,
    );
  }

  private document(
    source: SourceDocument,
  ): ClientDocumentReference["document"] {
    if (!(source.reference instanceof ClientDocumentReference))
      throw this.unsupported(ClientCapability.linkedEntityResolution);
    return source.reference.document;
  }

  private entity(source: SourceEntity): ClientEntityReference["entity"] {
    if (!(source.reference instanceof ClientEntityReference))
      throw this.unsupported(ClientCapability.nestedActionExecution);
    return source.reference.entity;
  }

  private values(source: UiValue): SirenActionValues {
    const values: { [field: string]: SirenActionValue } = {};
    for (const entry of source.entries()) {
      values[entry.name] = entry.value.value() as SirenActionValue;
    }
    return Object.freeze(values);
  }
}
