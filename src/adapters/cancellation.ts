import { SirenUiError } from "../errors/error";
import type { UiCancellation } from "../ports/cancellation";
import { SirenUiCode } from "../errors/code";

export class CancellationSource implements UiCancellation {
  private current = false;
  get cancelled(): boolean {
    return this.current;
  }
  cancel(): void {
    this.current = true;
  }
  throwIfCancelled(): void {
    if (this.current)
      throw new SirenUiError(
        SirenUiCode.sessionCancelled,
        "UI operation was cancelled",
      );
  }
}
