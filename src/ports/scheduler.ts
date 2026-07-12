import type { UiCancellation } from "./cancellation";

export interface UiScheduler {
  wait(milliseconds: number, cancellation: UiCancellation): Promise<void>;
}
