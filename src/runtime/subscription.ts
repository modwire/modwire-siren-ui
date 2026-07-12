import type { UiObserver } from "../ports/observer";
import type { UiSubscription } from "../ports/subscription";
import type { UiSession } from "./session";

export class ObserverSubscription implements UiSubscription {
  constructor(
    private readonly session: UiSession,
    private readonly observer: UiObserver,
  ) {}
  unsubscribe(): void {
    this.session.unsubscribe(this.observer);
  }
}
