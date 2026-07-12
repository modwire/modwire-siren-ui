import { UiCommand } from "./base";
import type { CommandVisitor } from "./visitor";

export class RequestActionCommand extends UiCommand {
  constructor(target: string) {
    super(target);
    Object.freeze(this);
  }

  accept<Result>(visitor: CommandVisitor<Result>): Result {
    return visitor.requestAction(this);
  }
}
