import type { SourceEntity } from "../domain/source/entity";
import { ResolutionCandidate } from "../domain/component/candidate";
import { UiEntityNode } from "../domain/nodes/entity";
import { UiNodeIdentity } from "../domain/nodes/identity";
import { UiReferenceNode } from "../domain/nodes/reference";
import type { ProfileContext } from "../domain/profile/context";
import type { ComponentResolver } from "../policy/component/resolver";
import type { LabelResolver } from "../policy/labels/resolver";
import type { ActionFactory } from "./factories/action";
import type { PropertyFactory } from "./factories/property";
import type { RelationFactory } from "./factories/relation";
import type { EntityIndexer } from "./entity-indexer";
import type { RegionPlanner } from "./region-planner";
import type { ProfileValueReader } from "./value-reader";
import { NodeKind } from "../domain/vocabulary/node-kind";
import { PresentationRole } from "../domain/vocabulary/presentation-role";
import { ProfileMember } from "../domain/vocabulary/profile-member";
import { ProfileVocabulary } from "../domain/vocabulary/profile";
import { RelationVocabulary } from "../domain/vocabulary/relation";

export class EntityNormalizer {
  constructor(
    private readonly reader: ProfileValueReader,
    private readonly indexer: EntityIndexer,
    private readonly properties: PropertyFactory,
    private readonly actions: ActionFactory,
    private readonly relations: RelationFactory,
    private readonly regions: RegionPlanner,
    private readonly labels: LabelResolver,
    private readonly components: ComponentResolver,
  ) {}
  normalize(
    source: SourceEntity,
    identity: UiNodeIdentity,
    profile: ProfileContext,
    ancestors: ReadonlyMap<string, UiNodeIdentity>,
  ): UiEntityNode {
    const metadata = profile.metadata();
    const presentation = this.reader.object(
      metadata,
      ProfileMember.presentation,
    );
    const layout = this.reader.object(presentation, ProfileMember.layout);
    const propertyMetadata = this.reader.object(
      metadata,
      ProfileMember.properties,
    );
    const relationMetadata = this.reader.object(
      metadata,
      ProfileMember.relations,
    );
    const actionMetadata = this.reader.object(metadata, ProfileMember.actions);
    const propertyNodes = source.properties
      .entries()
      .map((entry) =>
        this.properties.create(
          identity,
          entry.name,
          entry.value,
          this.reader.object(propertyMetadata, entry.name),
        ),
      )
      .sort(
        (left, right) =>
          left.order - right.order || left.name.localeCompare(right.name),
      );
    const actionNodes = source.actions.values
      .map((action) =>
        this.actions.create(
          identity,
          source,
          action,
          this.reader.object(actionMetadata, action.name),
        ),
      )
      .sort(
        (left, right) =>
          left.order - right.order || left.name.localeCompare(right.name),
      );
    const nextAncestors = new Map(ancestors);
    const canonical = this.canonical(source);
    if (canonical !== "") nextAncestors.set(canonical, identity);
    const relationNodes = [];
    const index = this.indexer.index(source, relationMetadata);
    for (const relation of index.relations) {
      const sources = index.sources(relation);
      const entities = [];
      const references = [];
      let position = 0;
      for (const child of sources) {
        const childIdentity = identity
          .child(NodeKind.relation, relation)
          .child(NodeKind.entity, String(position));
        position += 1;
        const childCanonical = this.canonical(child);
        if (childCanonical !== "" && nextAncestors.has(childCanonical)) {
          const component = this.components.resolve(
            new ResolutionCandidate(
              NodeKind.reference,
              childCanonical,
              child.classes,
              "",
              "",
            ),
          );
          let target = identity;
          for (const [url, current] of nextAncestors) {
            if (url === childCanonical) target = current;
          }
          references.push(
            new UiReferenceNode(
              childIdentity,
              target,
              childCanonical,
              component,
              component.diagnostics,
            ),
          );
        } else {
          const role = this.inferRole(child);
          entities.push(
            this.normalize(
              child,
              childIdentity,
              profile.forChild(role),
              nextAncestors,
            ),
          );
        }
      }
      relationNodes.push(
        this.relations.create(
          identity,
          relation,
          this.reader.object(relationMetadata, relation),
          sources,
          entities,
          references,
        ),
      );
    }
    relationNodes.sort(
      (left, right) =>
        left.order - right.order || left.relation.localeCompare(right.relation),
    );
    const role = this.reader.string(
      presentation,
      ProfileMember.role,
      PresentationRole.detail,
    );
    const component = this.components.resolve(
      new ResolutionCandidate(
        NodeKind.entity,
        identity.value,
        source.classes,
        role,
        role,
      ),
    );
    const regionNodes = this.regions.plan(
      identity,
      layout,
      propertyNodes,
      relationNodes,
      actionNodes,
    );
    return new UiEntityNode(
      identity,
      source,
      source.classes,
      role,
      this.labels.resolve(
        source.classes.join(" ") || role,
        this.reader.string(presentation, ProfileMember.label, ""),
        this.reader.string(presentation, ProfileMember.message, ""),
      ),
      this.reader.string(layout, ProfileMember.kind, ProfileVocabulary.flow),
      regionNodes,
      propertyNodes,
      relationNodes,
      actionNodes,
      component,
      component.diagnostics,
    );
  }
  private canonical(entity: SourceEntity): string {
    const links = entity.links.values.filter((link) =>
      link.relations.includes(RelationVocabulary.self),
    );
    if (links.length !== 1) return "";
    for (const link of links) return link.href;
    return "";
  }
  private inferRole(entity: SourceEntity): string {
    for (const role of PresentationRole.values)
      if (entity.classes.includes(role)) return role;
    return PresentationRole.summary;
  }
}
