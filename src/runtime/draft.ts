import { UiValue } from "../domain/source/value";

export class ActionDraft {
  constructor(
    private readonly entries: ReadonlyMap<string, UiValue> = new Map(),
  ) {
    Object.freeze(this);
  }
  set(field: string, value: UiValue): ActionDraft {
    const entries = new Map(this.entries);
    entries.set(field, value);
    return new ActionDraft(entries);
  }
  values(): UiValue {
    const result: { [field: string]: unknown } = {};
    for (const [field, value] of this.entries) result[field] = value.value();
    return UiValue.from(result);
  }
}
