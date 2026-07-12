import type { CommandVisitor } from "./visitor";

export abstract class UiCommand {
  protected constructor(readonly target: string) {}
  abstract accept<Result>(visitor: CommandVisitor<Result>): Result;
}
