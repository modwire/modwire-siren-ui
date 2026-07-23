import type { SourceDocument } from "../domain/source/document";
import { SirenUiError } from "../errors/error";
import type { UiObserver } from "../ports/observer";
import type { UiSubscription } from "../ports/subscription";
import type { SirenGateway } from "../ports/gateway";
import type { UiScheduler } from "../ports/scheduler";
import { CancellationSource } from "../adapters/cancellation";
import type { ResultStrategies } from "../policy/result/registry";
import { ResultContext } from "../policy/result/context";
import type { UiProjector } from "../projection/ui-projector";
import type { CancelActionCommand } from "./commands/cancel-action";
import type { CommandVisitor } from "./commands/visitor";
import type { ConfirmActionCommand } from "./commands/confirm-action";
import type { LoadRelationCommand } from "./commands/load-relation";
import type { RequestActionCommand } from "./commands/request-action";
import type { ResetActionCommand } from "./commands/reset-action";
import type { SetFieldCommand } from "./commands/set-field";
import type { UiCommand } from "./commands/base";
import { ActionDraft } from "./draft";
import { NodeIndex } from "./node-index";
import { ObserverSubscription } from "./subscription";
import { UiSnapshot } from "./snapshot";
import { SirenUiCode } from "../errors/code";

export class UiSession implements CommandVisitor<Promise<UiSnapshot>> {
  private current: UiSnapshot;
  private readonly observers = new Set<UiObserver>();
  private readonly confirmations = new Set<string>();
  private readonly operations = new Map<string, number>();
  private readonly cancellation = new CancellationSource();
  private sequence = 0;
  private closed = false;

  constructor(
    private readonly projector: UiProjector,
    private readonly gateway: SirenGateway,
    private readonly scheduler: UiScheduler,
    private readonly results: ResultStrategies,
    document: SourceDocument,
  ) {
    const projected = projector.project(document);
    this.current = new UiSnapshot(
      0,
      projected,
      new Map(),
      new Set(),
      "",
      "",
      projected.diagnostics,
    );
  }

  get snapshot(): UiSnapshot {
    return this.current;
  }
  async dispatch(command: UiCommand): Promise<UiSnapshot> {
    this.assertOpen();
    return command.accept(this);
  }
  subscribe(observer: UiObserver): UiSubscription {
    this.assertOpen();
    this.observers.add(observer);
    if (!this.notify(observer, this.current)) this.observers.delete(observer);
    return new ObserverSubscription(this, observer);
  }
  unsubscribe(observer: UiObserver): void {
    this.observers.delete(observer);
  }
  close(): void {
    if (!this.closed) {
      this.closed = true;
      this.cancellation.cancel();
      this.operations.clear();
      this.confirmations.clear();
      this.current = new UiSnapshot(
        this.current.revision + 1,
        this.current.document,
        this.current.draftsCopy(),
        new Set(),
        "",
        "Session closed",
        this.current.diagnostics,
      );
      this.observers.clear();
    }
  }

  setField(command: SetFieldCommand): Promise<UiSnapshot> {
    const index = new NodeIndex(this.current.document.root);
    const action = index.action(command.target);
    if (!action.fields.values.some((field) => field.name === command.field)) {
      throw new SirenUiError(
        SirenUiCode.fieldMissing,
        `Field is unavailable: '${command.field}'`,
      );
    }
    this.publish(
      this.current.withDraft(
        command.target,
        this.current.draft(command.target).set(command.field, command.value),
      ),
    );
    return Promise.resolve(this.current);
  }

  resetAction(command: ResetActionCommand): Promise<UiSnapshot> {
    new NodeIndex(this.current.document.root).action(command.target);
    this.publish(this.current.withDraft(command.target, new ActionDraft()));
    return Promise.resolve(this.current);
  }
  requestAction(command: RequestActionCommand): Promise<UiSnapshot> {
    const action = new NodeIndex(this.current.document.root).action(
      command.target,
    );
    if (action.confirmationRequired) {
      this.confirmations.add(command.target);
      this.publish(
        new UiSnapshot(
          this.current.revision + 1,
          this.current.document,
          this.current.draftsCopy(),
          this.current.busy,
          command.target,
          "Confirmation required",
          this.current.diagnostics,
        ),
      );
      return Promise.resolve(this.current);
    }
    return this.execute(command.target);
  }
  confirmAction(command: ConfirmActionCommand): Promise<UiSnapshot> {
    if (!this.confirmations.has(command.target))
      throw new SirenUiError(
        SirenUiCode.actionConfirmation,
        "Action is not awaiting confirmation",
      );
    const action = new NodeIndex(this.current.document.root).action(
      command.target,
    );
    if (
      action.acknowledgement !== "" &&
      action.acknowledgement !== command.acknowledgement
    )
      throw new SirenUiError(
        SirenUiCode.actionAcknowledgement,
        "Action acknowledgement does not match",
      );
    this.confirmations.delete(command.target);
    return this.execute(command.target);
  }
  cancelAction(command: CancelActionCommand): Promise<UiSnapshot> {
    new NodeIndex(this.current.document.root).action(command.target);
    this.confirmations.delete(command.target);
    this.publish(
      new UiSnapshot(
        this.current.revision + 1,
        this.current.document,
        this.current.draftsCopy(),
        this.current.busy,
        command.target,
        "Action cancelled",
        this.current.diagnostics,
      ),
    );
    return Promise.resolve(this.current);
  }
  async loadRelation(command: LoadRelationCommand): Promise<UiSnapshot> {
    const relation = new NodeIndex(this.current.document.root).relation(
      command.target,
    );
    const token = this.start(command.target, "Loading relation");
    try {
      const document = (
        await this.gateway.follow(
          this.current.document.source,
          relation.owner,
          relation.relation,
        )
      ).requireDocument();
      if (this.currentOperation(command.target, token))
        this.commit(document, command.target, "Relation loaded");
    } catch (error) {
      this.fail(command.target, token);
      throw error;
    }
    return this.current;
  }

  private async execute(target: string): Promise<UiSnapshot> {
    const action = new NodeIndex(this.current.document.root).action(target);
    const token = this.start(target, "Submitting action");
    try {
      const exchange = await this.gateway.execute(
        this.current.document.source,
        action.owner,
        action.name,
        this.current.draft(target).values(),
      );
      const document = await this.results
        .select(action.resultMode)
        .apply(
          new ResultContext(
            this.current.document.source,
            action,
            exchange,
            this.gateway,
            this.scheduler,
            this.cancellation,
          ),
        );
      if (this.currentOperation(target, token))
        this.commit(document, target, "Action completed");
    } catch (error) {
      this.fail(target, token);
      throw error;
    }
    return this.current;
  }
  private start(target: string, announcement: string): number {
    this.sequence += 1;
    this.operations.set(target, this.sequence);
    const busy = new Set(this.current.busy);
    busy.add(target);
    this.publish(
      new UiSnapshot(
        this.current.revision + 1,
        this.current.document,
        this.current.draftsCopy(),
        busy,
        target,
        announcement,
        this.current.diagnostics,
      ),
    );
    return this.sequence;
  }
  private currentOperation(target: string, token: number): boolean {
    if (this.closed) return false;
    return this.operations.get(target) === token;
  }
  private commit(
    document: SourceDocument,
    focus: string,
    announcement: string,
  ): void {
    this.operations.delete(focus);
    const projected = this.projector.project(document);
    const busy = new Set(this.current.busy);
    busy.delete(focus);
    this.publish(
      new UiSnapshot(
        this.current.revision + 1,
        projected,
        this.current.draftsCopy(),
        busy,
        focus,
        announcement,
        projected.diagnostics,
      ),
    );
  }
  private fail(target: string, token: number): void {
    if (!this.currentOperation(target, token)) return;
    this.operations.delete(target);
    const busy = new Set(this.current.busy);
    busy.delete(target);
    this.publish(
      new UiSnapshot(
        this.current.revision + 1,
        this.current.document,
        this.current.draftsCopy(),
        busy,
        target,
        "Operation failed",
        this.current.diagnostics,
      ),
    );
  }
  private publish(snapshot: UiSnapshot): void {
    this.current = snapshot;
    for (const observer of this.observers) {
      if (!this.notify(observer, snapshot)) this.observers.delete(observer);
    }
  }
  private notify(observer: UiObserver, snapshot: UiSnapshot): boolean {
    try {
      observer.changed(snapshot);
      return true;
    } catch {
      return false;
    }
  }
  private assertOpen(): void {
    if (this.closed)
      throw new SirenUiError(SirenUiCode.sessionClosed, "UI session is closed");
  }
}
