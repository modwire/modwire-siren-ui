import type { UiValue } from "../domain/source/value";
import { ResolutionCandidate } from "../domain/component/candidate";
import type { UiActionNode } from "../domain/nodes/action";
import type { UiNodeIdentity } from "../domain/nodes/identity";
import type { UiPropertyNode } from "../domain/nodes/property";
import { UiRegionNode } from "../domain/nodes/region";
import type { UiRelationNode } from "../domain/nodes/relation";
import type { ComponentResolver } from "../policy/component/resolver";
import type { LabelResolver } from "../policy/labels/resolver";
import type { ProfileValueReader } from "./value-reader";
import { NodeKind } from "../domain/vocabulary/node-kind";
import { ProfileMember } from "../domain/vocabulary/profile-member";
import { RegionVocabulary } from "../domain/vocabulary/region";

export class RegionPlanner {
  constructor(
    private readonly reader: ProfileValueReader,
    private readonly labels: LabelResolver,
    private readonly components: ComponentResolver,
  ) {}
  plan(
    parent: UiNodeIdentity,
    layout: UiValue,
    properties: readonly UiPropertyNode[],
    relations: readonly UiRelationNode[],
    actions: readonly UiActionNode[],
  ): readonly UiRegionNode[] {
    const propertyNames = new Set<string>();
    const relationNames = new Set<string>();
    const actionNames = new Set<string>();
    const regions = this.reader
      .objects(layout, ProfileMember.regions)
      .map((source) => {
        const content = this.reader.object(source, ProfileMember.content);
        const selectedProperties = properties.filter((node) =>
          this.reader
            .strings(content, ProfileMember.properties)
            .includes(node.name),
        );
        const selectedRelations = relations.filter((node) =>
          this.reader
            .strings(content, ProfileMember.relations)
            .includes(node.relation),
        );
        const selectedActions = actions.filter((node) =>
          this.reader
            .strings(content, ProfileMember.actions)
            .includes(node.name),
        );
        selectedProperties.forEach((node) => propertyNames.add(node.name));
        selectedRelations.forEach((node) => relationNames.add(node.relation));
        selectedActions.forEach((node) => actionNames.add(node.name));
        return this.create(
          parent,
          this.reader.string(source, ProfileMember.id, RegionVocabulary.other),
          this.reader.string(source, ProfileMember.label, ""),
          this.reader.string(source, ProfileMember.message, ""),
          this.reader.number(source, ProfileMember.order, 0),
          selectedProperties,
          selectedRelations,
          selectedActions,
        );
      })
      .sort(
        (left, right) =>
          left.order - right.order || left.id.localeCompare(right.id),
      );
    const remainingProperties = properties.filter(
      (node) => !propertyNames.has(node.name),
    );
    const remainingRelations = relations.filter(
      (node) => !relationNames.has(node.relation),
    );
    const remainingActions = actions.filter(
      (node) => !actionNames.has(node.name),
    );
    if (
      remainingProperties.length +
        remainingRelations.length +
        remainingActions.length >
      0
    )
      regions.push(
        this.create(
          parent,
          RegionVocabulary.other,
          RegionVocabulary.otherLabel,
          "",
          Number.MAX_SAFE_INTEGER,
          remainingProperties,
          remainingRelations,
          remainingActions,
        ),
      );
    return Object.freeze(regions);
  }
  private create(
    parent: UiNodeIdentity,
    id: string,
    label: string,
    message: string,
    order: number,
    properties: readonly UiPropertyNode[],
    relations: readonly UiRelationNode[],
    actions: readonly UiActionNode[],
  ): UiRegionNode {
    const identity = parent.child(NodeKind.region, id);
    const component = this.components.resolve(
      new ResolutionCandidate(NodeKind.region, id, [], "", ""),
    );
    return new UiRegionNode(
      identity,
      id,
      this.labels.resolve(id, label, message),
      order,
      properties,
      relations,
      actions,
      component,
      component.diagnostics,
    );
  }
}
