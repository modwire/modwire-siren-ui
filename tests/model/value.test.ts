import { describe, expect, it } from "vitest";
import { UiValue } from "@modwire/siren-ui/model";

describe("UiValue JSON boundary", () => {
  it.each([
    ["undefined", undefined],
    ["bigint", 1n],
    ["symbol", Symbol("value")],
    ["function", () => true],
    ["NaN", Number.NaN],
    ["infinity", Number.POSITIVE_INFINITY],
    ["date", new Date()],
    ["map", new Map()],
  ])("rejects a non-JSON %s", (_name, value) => {
    expect(() => UiValue.from(value)).toThrow();
  });

  it("rejects cyclic input", () => {
    const value: Record<string, unknown> = {};
    value.self = value;
    expect(() => UiValue.from(value)).toThrow();
  });

  it("rejects sparse arrays instead of adapting holes as absence", () => {
    const value = new Array<unknown>(2);
    value[1] = "present";
    expect(() => UiValue.from(value)).toThrow();
  });

  it("adapts prototype-looking keys without polluting prototypes", () => {
    const source = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":"safe"}',
    ) as object;
    const value = UiValue.from(source);
    expect(value.property("__proto__").property("polluted").truthy()).toBe(
      true,
    );
    expect(value.property("constructor").text("")).toBe("safe");
    expect(({} as { polluted?: boolean }).polluted).not.toBe(true);
  });

  it("does not invoke hostile getters", () => {
    let invoked = false;
    const value = Object.defineProperty({}, "secret", {
      enumerable: true,
      get(): never {
        invoked = true;
        throw new Error("secret getter executed");
      },
    });
    expect(() => UiValue.from(value)).toThrow();
    expect(invoked).toBe(false);
  });

  it("distinguishes absent from present null", () => {
    const value = UiValue.from({ present: null });
    expect(value.property("missing").present).toBe(false);
    expect(value.property("present").present).toBe(true);
    expect(value.property("present").value()).toBeNull();
  });

  it("returns empty traversals for incompatible shapes", () => {
    expect(UiValue.from("text").entries()).toEqual([]);
    expect(UiValue.from({ value: true }).items()).toEqual([]);
    expect(UiValue.from([true]).entries()).toEqual([]);
  });

  it("uses explicit fallbacks for incompatible primitives", () => {
    expect(UiValue.from(false).text("fallback")).toBe("fallback");
    expect(UiValue.from("2").number(7)).toBe(7);
    expect(UiValue.from(1).boolean(false)).toBe(false);
  });

  it("isolates itself from later input mutation", () => {
    const source = { nested: { value: "before" }, values: [1, 2] };
    const value = UiValue.from(source);
    source.nested.value = "after";
    source.values.push(3);
    expect(value.property("nested").property("value").text("")).toBe("before");
    expect(value.property("values").items()).toHaveLength(2);
  });

  it("does not expose mutable adapted objects", () => {
    const value = UiValue.from({ nested: { safe: true }, values: [1, 2] });
    const raw = value.value() as { nested: object; values: number[] };
    expect(Object.isFrozen(raw)).toBe(true);
    expect(Object.isFrozen(raw.nested)).toBe(true);
    expect(Object.isFrozen(raw.values)).toBe(true);
    expect(() => raw.values.push(3)).toThrow();
  });

  it("adapts valid nested JSON exactly", () => {
    const source = {
      enabled: true,
      count: 2,
      label: "Record",
      empty: null,
      values: [1, "two", false],
      nested: { key: "value" },
    };
    const value = UiValue.from(source);
    expect(value.value()).toEqual(source);
    expect(value.serialized()).toBe(JSON.stringify(source));
    expect(value.property("enabled").truthy()).toBe(true);
  });

  it("retains valid falsy JSON primitives", () => {
    expect(UiValue.from(0).value()).toBe(0);
    expect(UiValue.from("").value()).toBe("");
    expect(UiValue.from(false).value()).toBe(false);
    expect(UiValue.from(null).value()).toBeNull();
  });
});
