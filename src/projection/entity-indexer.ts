import type { SourceEntity } from "../domain/source/entity";
import type { UiValue } from "../domain/source/value";
import { EntityIndex } from "./entity-index";
import { RelationVocabulary } from "../domain/vocabulary/relation";
import { SirenVocabulary } from "../domain/vocabulary/siren";

export class EntityIndexer {
  index(entity: SourceEntity, relationMetadata: UiValue): EntityIndex {
    const names = new Set<string>(
      relationMetadata.entries().map((entry) => entry.name),
    );
    const entities = new Map<string, SourceEntity[]>();
    for (const child of entity.entities) {
      if (child.classes.includes(SirenVocabulary.profileEntityClass)) continue;
      for (const relation of child.relations) {
        names.add(relation);
        let values: SourceEntity[] = [];
        for (const [name, current] of entities) {
          if (name === relation) values = current;
        }
        values.push(child);
        entities.set(relation, values);
      }
    }
    for (const link of entity.links)
      for (const relation of link.relations)
        if (
          relation !== RelationVocabulary.self &&
          relation !== RelationVocabulary.profile
        )
          names.add(relation);
    return new EntityIndex([...names].sort(), entities);
  }
}
