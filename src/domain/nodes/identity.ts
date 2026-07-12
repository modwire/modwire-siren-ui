import { SirenUiError } from "../../errors/error";
import { SirenUiCode } from "../../errors/code";
import { NodeKind } from "../vocabulary/node-kind";

export class UiNodeIdentity {
  constructor(readonly value: string) {
    if (!value.startsWith("/")) {
      throw new SirenUiError(
        SirenUiCode.nodeIdentity,
        "Node identity must be absolute",
      );
    }
    Object.freeze(this);
  }

  child(kind: string, value: string): UiNodeIdentity {
    const escaped = value.replaceAll("~", "~0").replaceAll("/", "~1");
    return new UiNodeIdentity(`${this.value}/${kind}/${escaped}`);
  }

  static root(): UiNodeIdentity {
    return new UiNodeIdentity(`/${NodeKind.entity}/root`);
  }
}
