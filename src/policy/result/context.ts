import type { SourceDocument } from "../../domain/source/document";
import type { SirenExchange } from "../../domain/exchange/base";
import type { UiActionNode } from "../../domain/nodes/action";
import type { UiCancellation } from "../../ports/cancellation";
import type { SirenGateway } from "../../ports/gateway";
import type { UiScheduler } from "../../ports/scheduler";

export class ResultContext {
  constructor(
    readonly current: SourceDocument,
    readonly action: UiActionNode,
    readonly exchange: SirenExchange,
    readonly gateway: SirenGateway,
    readonly scheduler: UiScheduler,
    readonly cancellation: UiCancellation,
  ) {
    Object.freeze(this);
  }
}
