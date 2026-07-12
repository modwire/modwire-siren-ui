import type { SourceEntity } from "../../domain/source/entity";
import type { UiValue } from "../../domain/source/value";
import { ResolutionCandidate } from "../../domain/component/candidate";
import type { UiEntityNode } from "../../domain/nodes/entity";
import type { UiNodeIdentity } from "../../domain/nodes/identity";
import type { UiReferenceNode } from "../../domain/nodes/reference";
import { UiRelationNode } from "../../domain/nodes/relation";
import type { ComponentResolver } from "../../policy/component/resolver";
import type { LabelResolver } from "../../policy/labels/resolver";
import type { ProfileValueReader } from "../value-reader";
import { NodeKind } from "../../domain/vocabulary/node-kind";
import { ProfileMember } from "../../domain/vocabulary/profile-member";
import { RelationVocabulary } from "../../domain/vocabulary/relation";

export class RelationFactory {
  constructor(
    private readonly reader: ProfileValueReader,
    private readonly labels: LabelResolver,
    private readonly components: ComponentResolver,
  ) {}
  create(
    parent: UiNodeIdentity,
    relation: string,
    metadata: UiValue,
    sources: readonly SourceEntity[],
    entities: readonly UiEntityNode[],
    references: readonly UiReferenceNode[],
  ): UiRelationNode {
    const identity = parent.child(NodeKind.relation, relation);
    const role = this.reader.string(
      metadata,
      ProfileMember.role,
      RelationVocabulary.defaultRole,
    );
    const component = this.components.resolve(
      new ResolutionCandidate(NodeKind.relation, relation, [], role, role),
    );
    return new UiRelationNode(
      identity,
      relation,
      this.labels.resolve(
        relation,
        this.reader.string(metadata, ProfileMember.label, ""),
        this.reader.string(metadata, ProfileMember.message, ""),
      ),
      role,
      this.reader.string(
        metadata,
        ProfileMember.loading,
        sources.length > 0
          ? RelationVocabulary.embedded
          : RelationVocabulary.manual,
      ),
      this.reader.string(
        metadata,
        ProfileMember.cardinality,
        RelationVocabulary.one,
      ),
      this.reader.number(metadata, ProfileMember.order, 0),
      sources,
      entities,
      references,
      component,
      component.diagnostics,
    );
  }
}
