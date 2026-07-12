import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

class LockVerifier {
  verify(): void {
    const source = readFileSync("package-lock.json", "utf8");
    for (const forbidden of [
      "file:",
      "link:",
      "workspace:",
      "../modwire",
      "/Users/",
      "\\\\Users\\\\",
    ]) {
      assert.ok(
        !source.includes(forbidden),
        `package lock contains forbidden local reference '${forbidden}'`,
      );
    }

    const parsed = JSON.parse(source) as {
      readonly packages: Readonly<
        Record<
          string,
          {
            readonly dependencies?: Readonly<Record<string, string>>;
            readonly version?: string;
          }
        >
      >;
    };
    assert.equal(
      parsed.packages[""]?.dependencies?.["@modwire/siren-client"],
      "0.1.0",
    );
    assert.equal(
      parsed.packages["node_modules/@modwire/siren-client"]?.version,
      "0.1.0",
    );
  }
}

new LockVerifier().verify();
