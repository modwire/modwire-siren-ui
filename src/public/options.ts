import type { ComponentRule } from "../domain/component/rule";
import { PlatformScheduler } from "../adapters/scheduler";
import type { UiScheduler } from "../ports/scheduler";
import { ClientRuntime } from "../adapters/runtime";

export class SirenUiOptions {
  readonly components: readonly ComponentRule[];
  constructor(
    readonly client: ClientRuntime,
    components: readonly ComponentRule[],
    readonly scheduler: UiScheduler,
  ) {
    this.components = Object.freeze([...components]);
    Object.freeze(this);
  }
  static standard(): SirenUiOptions {
    return new SirenUiOptions(new ClientRuntime(), [], new PlatformScheduler());
  }
}
