import type { SirenExchange } from "../domain/exchange/base";
import type { SourceDocument } from "../domain/source/document";
import type { SourceEntity } from "../domain/source/entity";
import type { UiValue } from "../domain/source/value";

export interface SirenGateway {
  follow(document: SourceDocument, relation: string): Promise<SirenExchange>;
  resolve(
    document: SourceDocument,
    entity: SourceEntity,
  ): Promise<SirenExchange>;
  execute(
    document: SourceDocument,
    entity: SourceEntity,
    action: string,
    values: UiValue,
  ): Promise<SirenExchange>;
}
