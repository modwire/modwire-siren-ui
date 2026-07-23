import type { SourceDocument } from "../../domain/source/document";
import { SirenUiError } from "../../errors/error";
import type { ResultContext } from "./context";
import type { ActionResultStrategy } from "./strategy";
import { OperationStatus } from "../../domain/vocabulary/status";
import { ResultMode } from "../../domain/vocabulary/result-mode";
import { ProfileMember } from "../../domain/vocabulary/profile-member";
import { SirenUiCode } from "../../errors/code";

export class MonitorResult implements ActionResultStrategy {
  readonly mode = ResultMode.monitor;
  constructor(
    private readonly maximumAttempts = 60,
    private readonly delay = 1000,
  ) {}
  async apply(context: ResultContext): Promise<SourceDocument> {
    let document = context.exchange.requireDocument();
    let relation = "";
    for (const value of context.action.resultRelations) {
      relation = value;
      break;
    }
    if (relation === "")
      throw new SirenUiError(
        SirenUiCode.actionResult,
        "Monitor result requires a progress relation",
      );
    for (let attempt = 0; attempt < this.maximumAttempts; attempt += 1) {
      const status = document.root.properties
        .property(ProfileMember.status)
        .text("");
      if (status === OperationStatus.succeeded) return document;
      if (status === OperationStatus.failed)
        throw new SirenUiError(
          SirenUiCode.actionMonitor,
          "Monitored action failed",
        );
      await context.scheduler.wait(this.delay, context.cancellation);
      document = (
        await context.gateway.follow(document, document.root, relation)
      ).requireDocument();
    }
    throw new SirenUiError(
      SirenUiCode.actionMonitorTimeout,
      "Monitoring exceeded its operation budget",
    );
  }
}
