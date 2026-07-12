import { UiCollection } from "../collections/collection";
import type { UiDiagnostic } from "./diagnostic";

export class UiDiagnostics extends UiCollection<UiDiagnostic> {
  static empty(): UiDiagnostics {
    return new UiDiagnostics([]);
  }

  merge(other: UiDiagnostics): UiDiagnostics {
    return new UiDiagnostics([...this.values, ...other.values]);
  }
}
