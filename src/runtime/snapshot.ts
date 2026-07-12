import type { UiDocument } from "../domain/document/document";
import type { UiDiagnostics } from "../domain/diagnostics/collection";
import { ActionDraft } from "./draft";
import { UiReadonlySet } from "./readonly-set";

export class UiSnapshot {
  constructor(
    readonly revision: number,
    readonly document: UiDocument,
    private readonly drafts: ReadonlyMap<string, ActionDraft>,
    busy: ReadonlySet<string>,
    readonly focus: string,
    readonly announcement: string,
    readonly diagnostics: UiDiagnostics,
  ) {
    this.busy = new UiReadonlySet(busy);
    Object.freeze(this);
  }
  readonly busy: ReadonlySet<string>;
  draft(action: string): ActionDraft {
    for (const [identity, draft] of this.drafts) {
      if (identity === action) return draft;
    }
    return new ActionDraft();
  }
  withDraft(action: string, draft: ActionDraft): UiSnapshot {
    const drafts = new Map(this.drafts);
    drafts.set(action, draft);
    return new UiSnapshot(
      this.revision + 1,
      this.document,
      drafts,
      this.busy,
      this.focus,
      this.announcement,
      this.diagnostics,
    );
  }
  draftsCopy(): ReadonlyMap<string, ActionDraft> {
    return new Map(this.drafts);
  }
}
