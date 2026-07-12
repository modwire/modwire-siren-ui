import type { CancelActionCommand } from "./cancel-action";
import type { ConfirmActionCommand } from "./confirm-action";
import type { LoadRelationCommand } from "./load-relation";
import type { RequestActionCommand } from "./request-action";
import type { ResetActionCommand } from "./reset-action";
import type { SetFieldCommand } from "./set-field";

export interface CommandVisitor<Result> {
  setField(command: SetFieldCommand): Result;
  resetAction(command: ResetActionCommand): Result;
  requestAction(command: RequestActionCommand): Result;
  confirmAction(command: ConfirmActionCommand): Result;
  cancelAction(command: CancelActionCommand): Result;
  loadRelation(command: LoadRelationCommand): Result;
}
