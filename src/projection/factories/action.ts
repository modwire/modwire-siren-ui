import type { SourceAction } from "../../domain/source/action";
import type { SourceEntity } from "../../domain/source/entity";
import { UiValue } from "../../domain/source/value";
import { ResolutionCandidate } from "../../domain/component/candidate";
import { UiActionNode } from "../../domain/nodes/action";
import type { UiNodeIdentity } from "../../domain/nodes/identity";
import type { ComponentResolver } from "../../policy/component/resolver";
import type { LabelResolver } from "../../policy/labels/resolver";
import type { ProfileValueReader } from "../value-reader";
import type { FieldFactory } from "./field";
import { ActionVocabulary } from "../../domain/vocabulary/action";
import { NodeKind } from "../../domain/vocabulary/node-kind";
import { ProfileMember } from "../../domain/vocabulary/profile-member";
import { ResultMode } from "../../domain/vocabulary/result-mode";

export class ActionFactory {
  constructor(
    private readonly reader: ProfileValueReader,
    private readonly labels: LabelResolver,
    private readonly fields: FieldFactory,
    private readonly components: ComponentResolver,
  ) {}
  create(
    parent: UiNodeIdentity,
    owner: SourceEntity,
    action: SourceAction,
    metadata: UiValue,
  ): UiActionNode {
    const identity = parent.child(NodeKind.action, action.name);
    const values: { [name: string]: unknown } = {};
    for (const field of action.fields)
      if (field.value.present) values[field.name] = field.value.value();
    const fieldMetadata = this.reader.object(metadata, ProfileMember.fields);
    const fields = action.fields.values
      .map((field) =>
        this.fields.create(
          identity,
          field,
          this.reader.object(fieldMetadata, field.name),
          owner.properties,
          UiValue.from(values),
        ),
      )
      .sort(
        (left, right) =>
          left.order - right.order || left.name.localeCompare(right.name),
      );
    const intent = this.reader.string(
      metadata,
      ProfileMember.intent,
      ActionVocabulary.defaultIntent,
    );
    const result = this.reader.object(metadata, ProfileMember.result);
    const confirmation = this.reader.object(
      metadata,
      ProfileMember.confirmation,
    );
    const component = this.components.resolve(
      new ResolutionCandidate(NodeKind.action, action.name, [], intent, intent),
    );
    return new UiActionNode(
      identity,
      action.name,
      owner,
      action,
      this.labels.resolve(
        action.name,
        this.reader.string(metadata, ProfileMember.label, ""),
        this.reader.string(metadata, ProfileMember.message, ""),
      ),
      intent,
      this.reader.string(
        metadata,
        ProfileMember.placement,
        ActionVocabulary.defaultPlacement,
      ),
      this.reader.number(metadata, ProfileMember.order, 0),
      this.reader.boolean(confirmation, ProfileMember.required, false),
      this.reader.string(confirmation, ProfileMember.acknowledgement, ""),
      this.reader.string(result, ProfileMember.mode, ResultMode.none),
      this.reader.strings(result, ProfileMember.relations),
      fields,
      component,
      component.diagnostics,
    );
  }
}
