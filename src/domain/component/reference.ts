import { SirenUiError } from "../../errors/error";
import { SirenUiCode } from "../../errors/code";

export class ComponentReference {
  constructor(readonly key: string) {
    if (key.trim() === "") {
      throw new SirenUiError(
        SirenUiCode.componentInvalid,
        "Component key cannot be empty",
      );
    }
    Object.freeze(this);
  }
}
