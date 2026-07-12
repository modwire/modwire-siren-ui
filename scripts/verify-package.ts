import { execFileSync } from "node:child_process";

class PackageVerifier {
  static expected = new Set([
    "package/LICENSE",
    "package/README.md",
    "package/ARCHITECTURE.md",
    "package/dist/api.d.ts",
    "package/dist/api.js",
    "package/dist/api.js.map",
    "package/dist/commands.d.ts",
    "package/dist/commands.js",
    "package/dist/commands.js.map",
    "package/dist/extensions.d.ts",
    "package/dist/extensions.js",
    "package/dist/extensions.js.map",
    "package/dist/model.d.ts",
    "package/dist/model.js",
    "package/package.json",
  ]);

  verify(): void {
    const output = execFileSync(
      "npm",
      ["pack", "--dry-run", "--json", "--ignore-scripts"],
      { encoding: "utf8" },
    );
    const parsed: unknown = JSON.parse(output);
    const actual = new Set(this.paths(parsed));
    const missing: string[] = [];
    const unexpected: string[] = [];
    for (const path of PackageVerifier.expected) {
      if (!actual.has(path)) {
        missing.push(path);
      }
    }
    for (const path of actual) {
      if (
        !PackageVerifier.expected.has(path) &&
        !path.startsWith("package/dist/")
      ) {
        unexpected.push(path);
      }
    }
    if (missing.length > 0 || unexpected.length > 0) {
      throw new Error(
        JSON.stringify({
          missing: missing.sort(),
          unexpected: unexpected.sort(),
        }),
      );
    }
  }

  private paths(value: unknown): string[] {
    if (!Array.isArray(value) || value.length !== 1) {
      throw new Error("npm pack returned an unexpected result");
    }
    const result: unknown = value[0];
    if (!result || typeof result !== "object") {
      throw new Error("npm pack returned an unexpected file manifest");
    }
    const manifest = result as Record<string, unknown>;
    const files = manifest.files;
    if (!Array.isArray(files)) {
      throw new Error("npm pack returned an unexpected file manifest");
    }
    const paths: string[] = [];
    for (const file of files as unknown[]) {
      if (!file || typeof file !== "object") {
        throw new Error("npm pack returned an invalid file entry");
      }
      const entry = file as Record<string, unknown>;
      const path = entry.path;
      if (typeof path !== "string") {
        throw new Error("npm pack returned an invalid file entry");
      }
      paths.push(`package/${path}`);
    }
    return paths;
  }
}

new PackageVerifier().verify();
