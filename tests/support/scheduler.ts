import type { UiScheduler, UiSubscription } from "@modwire/siren-ui/extensions";

type Cancellation = Parameters<UiScheduler["wait"]>[1];

export class ImmediateScheduler implements UiScheduler {
  readonly waits: number[] = [];

  wait(milliseconds: number, cancellation: Cancellation): Promise<void> {
    this.waits.push(milliseconds);
    cancellation.throwIfCancelled();
    return Promise.resolve();
  }
}

export class PublicSubscription implements UiSubscription {
  unsubscribed = false;

  unsubscribe(): void {
    this.unsubscribed = true;
  }
}
