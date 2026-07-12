import { describe, expect, it } from "vitest";
import * as api from "@modwire/siren-ui";
import * as commands from "@modwire/siren-ui/commands";
import * as extensions from "@modwire/siren-ui/extensions";
import * as model from "@modwire/siren-ui/model";

describe("published package entrances", () => {
  it("rejects private and undeclared package paths", async () => {
    const packageName = ["@modwire", "siren-ui"].join("/");
    const paths = [
      [packageName, "src", "public", "engine"].join("/"),
      [packageName, "dist", "api.js"].join("/"),
      [packageName, "index"].join("/"),
    ];
    for (const path of paths) {
      await expect(import(path)).rejects.toThrow();
    }
  });

  it("keeps commands, model, and extensions out of the root", () => {
    expect(Object.keys(api).sort()).toEqual([
      "ClientRuntime",
      "SirenUiEngine",
      "SirenUiOptions",
      "UiSession",
      "UiSnapshot",
    ]);
  });

  it("publishes the exact command entrance", () => {
    expect(Object.keys(commands).sort()).toEqual([
      "CancelActionCommand",
      "ConfirmActionCommand",
      "LoadRelationCommand",
      "RequestActionCommand",
      "ResetActionCommand",
      "SetFieldCommand",
    ]);
  });

  it("publishes the exact model entrance", () => {
    expect(Object.keys(model).sort()).toEqual([
      "ComponentResolution",
      "ProfileContext",
      "UiActionNode",
      "UiDiagnostic",
      "UiDiagnostics",
      "UiDocument",
      "UiEntityNode",
      "UiFieldNode",
      "UiNode",
      "UiNodeIdentity",
      "UiPropertyNode",
      "UiReferenceNode",
      "UiRegionNode",
      "UiRelationNode",
      "UiValue",
    ]);
  });

  it("publishes the exact runtime extension entrance", () => {
    expect(Object.keys(extensions).sort()).toEqual([
      "ComponentReference",
      "DomainRule",
      "NamedRule",
      "SemanticRule",
      "SirenUiError",
      "SirenUiIssue",
    ]);
  });
});
