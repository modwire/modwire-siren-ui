import { UiCommand } from "./base";
import type { CommandVisitor } from "./visitor";

export class ConfirmActionCommand extends UiCommand {
  constructor(
    target: string,
    readonly acknowledgement = "",
  ) {
    super(target);
    Object.freeze(this);
  }
  accept<Result>(visitor: CommandVisitor<Result>): Result {
    return visitor.confirmAction(this);
  }
}
