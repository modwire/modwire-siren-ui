import { UiValue } from "../domain/source/value";

export class ProfileValueReader {
  object(source: UiValue, member: string): UiValue {
    return source.property(member);
  }

  objects(source: UiValue, member: string): readonly UiValue[] {
    return source.property(member).items();
  }

  string(source: UiValue, member: string, fallback: string): string {
    return source.property(member).text(fallback);
  }

  strings(source: UiValue, member: string): readonly string[] {
    return Object.freeze(
      source
        .property(member)
        .items()
        .map((value) => value.text(""))
        .filter((value) => value !== ""),
    );
  }

  number(source: UiValue, member: string, fallback: number): number {
    return source.property(member).number(fallback);
  }

  boolean(source: UiValue, member: string, fallback: boolean): boolean {
    return source.property(member).boolean(fallback);
  }

  value(source: UiValue, member: string, fallback: UiValue): UiValue {
    const value = source.property(member);
    return value.present ? value : fallback;
  }
}
