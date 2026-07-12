import type { SourceField } from "../../domain/source/field";
import type { UiValue } from "../../domain/source/value";
import { ResolutionCandidate } from "../../domain/component/candidate";
import { UiFieldNode } from "../../domain/nodes/field";
import type { UiNodeIdentity } from "../../domain/nodes/identity";
import type { ComponentResolver } from "../../policy/component/resolver";
import type { LabelResolver } from "../../policy/labels/resolver";
import type { PredicateCompiler } from "../../policy/predicate/compiler";
import type { ProfileValueReader } from "../value-reader";
import { FieldVocabulary } from "../../domain/vocabulary/field";
import { NodeKind } from "../../domain/vocabulary/node-kind";
import { ProfileMember } from "../../domain/vocabulary/profile-member";

export class FieldFactory {
  constructor(
    private readonly reader: ProfileValueReader,
    private readonly labels: LabelResolver,
    private readonly predicates: PredicateCompiler,
    private readonly components: ComponentResolver,
  ) {}
  create(
    parent: UiNodeIdentity,
    field: SourceField,
    metadata: UiValue,
    properties: UiValue,
    fields: UiValue,
  ): UiFieldNode {
    const identity = parent.child(NodeKind.field, field.name);
    const widget = this.reader.string(
      metadata,
      ProfileMember.widget,
      FieldVocabulary.automatic,
    );
    const visible = this.predicates.compile(
      this.reader.object(metadata, ProfileMember.visibleWhen),
    );
    const enabled = this.predicates.compile(
      this.reader.object(metadata, ProfileMember.enabledWhen),
    );
    const component = this.components.resolve(
      new ResolutionCandidate(NodeKind.field, field.name, [], widget, widget),
    );
    return new UiFieldNode(
      identity,
      field.name,
      field,
      this.labels.resolve(
        field.name,
        this.reader.string(metadata, ProfileMember.label, ""),
        this.reader.string(metadata, ProfileMember.message, ""),
      ),
      widget,
      this.reader.number(metadata, ProfileMember.order, 0),
      visible.evaluate(properties, fields),
      enabled.evaluate(properties, fields),
      component,
      component.diagnostics
        .merge(visible.diagnostics)
        .merge(enabled.diagnostics),
    );
  }
}
