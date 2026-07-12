import type { UiSnapshot } from "../runtime/snapshot";

export interface UiObserver {
  changed(snapshot: UiSnapshot): void;
}
