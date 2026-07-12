import type { UiValue } from "../../domain/source/value";
import { ResolutionCandidate } from "../../domain/component/candidate";
import { UiPropertyNode } from "../../domain/nodes/property";
import type { UiNodeIdentity } from "../../domain/nodes/identity";
import type { ComponentResolver } from "../../policy/component/resolver";
import type { LabelResolver } from "../../policy/labels/resolver";
import type { ProfileValueReader } from "../value-reader";
import { NodeKind } from "../../domain/vocabulary/node-kind";
import { ProfileMember } from "../../domain/vocabulary/profile-member";
import { PropertyVocabulary } from "../../domain/vocabulary/property";

export class PropertyFactory {
  constructor(
    private readonly reader: ProfileValueReader,
    private readonly labels: LabelResolver,
    private readonly components: ComponentResolver,
  ) {}
  create(
    parent: UiNodeIdentity,
    name: string,
    value: UiValue,
    metadata: UiValue,
  ): UiPropertyNode {
    const identity = parent.child(NodeKind.property, name);
    const format = this.reader.string(
      metadata,
      ProfileMember.format,
      PropertyVocabulary.text,
    );
    const component = this.components.resolve(
      new ResolutionCandidate(NodeKind.property, name, [], "", format),
    );
    return new UiPropertyNode(
      identity,
      name,
      value,
      this.labels.resolve(
        name,
        this.reader.string(metadata, ProfileMember.label, ""),
        this.reader.string(metadata, ProfileMember.message, ""),
      ),
      format,
      this.reader.string(
        metadata,
        ProfileMember.importance,
        PropertyVocabulary.supporting,
      ),
      this.reader.boolean(metadata, ProfileMember.sensitive, false),
      this.reader.number(metadata, ProfileMember.order, 0),
      component,
      component.diagnostics,
    );
  }
}
