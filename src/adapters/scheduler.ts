import type { UiCancellation } from "../ports/cancellation";
import type { UiScheduler } from "../ports/scheduler";

export class PlatformScheduler implements UiScheduler {
  async wait(
    milliseconds: number,
    cancellation: UiCancellation,
  ): Promise<void> {
    cancellation.throwIfCancelled();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, milliseconds);
    });
    cancellation.throwIfCancelled();
  }
}
