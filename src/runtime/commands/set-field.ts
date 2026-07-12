import { UiValue } from "../../domain/source/value";
import { UiCommand } from "./base";
import type { CommandVisitor } from "./visitor";

export class SetFieldCommand extends UiCommand {
  constructor(
    action: string,
    readonly field: string,
    value: unknown,
  ) {
    super(action);
    this.value = UiValue.from(value);
    Object.freeze(this);
  }
  readonly value: UiValue;
  accept<Result>(visitor: CommandVisitor<Result>): Result {
    return visitor.setField(this);
  }
}
