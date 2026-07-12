import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ClientRuntime,
  SirenUiEngine,
  SirenUiOptions,
} from "@modwire/siren-ui";
import { ComponentReference, DomainRule } from "@modwire/siren-ui/extensions";
import { UiValue } from "@modwire/siren-ui/model";
import { ImmediateScheduler, PublicSubscription } from "../support/scheduler";

describe("external consumer contract", () => {
  it("contains no imports through the castle walls", () => {
    const files = new ConsumerFiles().typescript("tests");
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/@modwire\/siren-ui\/(?:src|dist)\//u);
      expect(source).not.toMatch(/(?:\.\.\/)+src\//u);
      if (!file.includes("tests/support/client/")) {
        const clientPackage = ["@modwire", "siren-client"].join("/");
        expect(source).not.toContain(`from "${clientPackage}"`);
      }
    }
  });

  it("keeps public helpers structurally implementable", () => {
    const scheduler = new ImmediateScheduler();
    const subscription = new PublicSubscription();
    expect(scheduler.waits).toEqual([]);
    subscription.unsubscribe();
    expect(subscription.unsubscribed).toBe(true);
  });

  it("constructs the public extension and engine surfaces", () => {
    const component = new ComponentReference("record-detail");
    const rule = new DomainRule("record", component, "record", "detail");
    const options = new SirenUiOptions(
      new ClientRuntime(),
      [rule],
      new ImmediateScheduler(),
    );
    expect(new SirenUiEngine(options)).toBeInstanceOf(SirenUiEngine);
    expect(UiValue.from({ safe: true }).property("safe").truthy()).toBe(true);
  });
});

class ConsumerFiles {
  typescript(root: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const path = join(root, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.typescript(path));
      } else if (entry.name.endsWith(".ts")) {
        files.push(path);
      }
    }
    return files;
  }
}
