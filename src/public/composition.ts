import { ComponentResolver } from "../policy/component/resolver";
import { StandardRegistry } from "../policy/component/standard";
import { LabelResolver } from "../policy/labels/resolver";
import { PredicateCompiler } from "../policy/predicate/compiler";
import { MonitorResult } from "../policy/result/monitor";
import { NavigateResult } from "../policy/result/navigate";
import { NoneResult } from "../policy/result/none";
import { RefreshResult } from "../policy/result/refresh";
import { ResultStrategies } from "../policy/result/registry";
import { ReplaceResult } from "../policy/result/replace";
import { EntityIndexer } from "../projection/entity-indexer";
import { EntityNormalizer } from "../projection/entity-normalizer";
import { ActionFactory } from "../projection/factories/action";
import { FieldFactory } from "../projection/factories/field";
import { PropertyFactory } from "../projection/factories/property";
import { RelationFactory } from "../projection/factories/relation";
import { RegionPlanner } from "../projection/region-planner";
import { UiProjector } from "../projection/ui-projector";
import { ProfileValueReader } from "../projection/value-reader";
import type { SirenUiOptions } from "./options";
import { DiagnosticCollector } from "../projection/diagnostic-collector";

export class Composition {
  readonly projector: UiProjector;
  readonly results: ResultStrategies;
  constructor(readonly options: SirenUiOptions) {
    const reader = new ProfileValueReader();
    const labels = new LabelResolver();
    const components = new ComponentResolver(
      new StandardRegistry().create(options.components),
    );
    const predicates = new PredicateCompiler(reader);
    const fields = new FieldFactory(reader, labels, predicates, components);
    const properties = new PropertyFactory(reader, labels, components);
    const actions = new ActionFactory(reader, labels, fields, components);
    const relations = new RelationFactory(reader, labels, components);
    const regions = new RegionPlanner(reader, labels, components);
    this.projector = new UiProjector(
      new EntityNormalizer(
        reader,
        new EntityIndexer(),
        properties,
        actions,
        relations,
        regions,
        labels,
        components,
      ),
      new DiagnosticCollector(),
    );
    const fallback = new NoneResult();
    this.results = new ResultStrategies(
      [
        new ReplaceResult(),
        new RefreshResult(),
        new NavigateResult(),
        new MonitorResult(),
        fallback,
      ],
      fallback,
    );
  }
}
