import { UiValueEntry } from "./value-entry";
import { SirenUiError } from "../../errors/error";
import { SirenUiCode } from "../../errors/code";

export class UiValue {
  private constructor(
    readonly present: boolean,
    private readonly raw: unknown,
  ) {
    Object.freeze(this);
  }

  static from(value: unknown): UiValue {
    return new UiValue(true, UiValue.freeze(value));
  }

  static absent(): UiValue {
    return new UiValue(false, false);
  }

  value(): unknown {
    return this.raw;
  }

  property(name: string): UiValue {
    for (const entry of this.entries()) {
      if (entry.name === name) return entry.value;
    }
    return UiValue.absent();
  }

  entries(): readonly UiValueEntry[] {
    if (!this.raw || typeof this.raw !== "object" || Array.isArray(this.raw)) {
      return Object.freeze([]);
    }
    return Object.freeze(
      Object.entries(this.raw).map(
        ([name, value]) => new UiValueEntry(name, UiValue.from(value)),
      ),
    );
  }

  items(): readonly UiValue[] {
    return Array.isArray(this.raw)
      ? Object.freeze(this.raw.map((value) => UiValue.from(value)))
      : Object.freeze([]);
  }

  text(fallback: string): string {
    return typeof this.raw === "string" ? this.raw : fallback;
  }

  number(fallback: number): number {
    return typeof this.raw === "number" && Number.isFinite(this.raw)
      ? this.raw
      : fallback;
  }

  boolean(fallback: boolean): boolean {
    return typeof this.raw === "boolean" ? this.raw : fallback;
  }

  truthy(): boolean {
    return Boolean(this.raw);
  }

  serialized(): string {
    return JSON.stringify(this.raw);
  }

  private static freeze(value: unknown): unknown {
    if (value === null) return value;
    if (typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number") {
      if (Number.isFinite(value)) return value;
      throw UiValue.invalid();
    }
    if (Array.isArray(value)) {
      return Object.freeze(Array.from(value, (item) => UiValue.freeze(item)));
    }
    if (typeof value === "object") {
      if (Object.getPrototypeOf(value) !== Object.prototype) {
        throw UiValue.invalid("UI value must use plain JSON objects");
      }
      const result: { [name: string]: unknown } = {};
      for (const name of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, name);
        if (!descriptor?.enumerable) continue;
        if (typeof name !== "string" || !("value" in descriptor)) {
          throw UiValue.invalid();
        }
        Object.defineProperty(result, name, {
          configurable: false,
          enumerable: true,
          value: UiValue.freeze(descriptor.value),
          writable: false,
        });
      }
      return Object.freeze(result);
    }
    throw UiValue.invalid();
  }

  private static invalid(
    message = "UI value must be JSON-compatible",
  ): SirenUiError {
    return new SirenUiError(SirenUiCode.valueInvalid, message);
  }
}
