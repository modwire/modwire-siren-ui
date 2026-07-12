import type { UiObserver } from "@modwire/siren-ui/extensions";
import type { UiSnapshot } from "@modwire/siren-ui";

export class RecordingObserver implements UiObserver {
  readonly snapshots: UiSnapshot[] = [];

  changed(snapshot: UiSnapshot): void {
    this.snapshots.push(snapshot);
  }
}

export class ToggleObserver implements UiObserver {
  enabled = false;

  changed(snapshot: UiSnapshot): void {
    void snapshot;
    if (this.enabled) throw new Error("observer failed");
  }
}
