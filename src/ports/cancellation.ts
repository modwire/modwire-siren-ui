export interface UiCancellation {
  readonly cancelled: boolean;
  throwIfCancelled(): void;
}
