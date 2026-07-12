import { describe, expect, it } from "vitest";
import { SetFieldCommand } from "@modwire/siren-ui/commands";
import { ActionCase } from "../support/actions";
import { ScriptedTransport } from "../support/client/transport";
import { RecordingObserver, ToggleObserver } from "../support/observer";

describe("session observation", () => {
  const cases = new ActionCase();

  it("contains a throwing observer and still notifies healthy observers", async () => {
    const session = cases.open(new ScriptedTransport());
    const broken = new ToggleObserver();
    const healthy = new RecordingObserver();
    session.subscribe(broken);
    session.subscribe(healthy);
    broken.enabled = true;
    const action = cases.action(session);
    await expect(
      session.dispatch(
        new SetFieldCommand(action.identity.value, "title", "Changed"),
      ),
    ).resolves.toBe(session.snapshot);
    expect(healthy.snapshots.at(-1)).toBe(session.snapshot);
  });

  it("does not notify an unsubscribed observer", async () => {
    const session = cases.open(new ScriptedTransport());
    const observer = new RecordingObserver();
    const subscription = session.subscribe(observer);
    const count = observer.snapshots.length;
    subscription.unsubscribe();
    subscription.unsubscribe();
    const action = cases.action(session);
    await session.dispatch(
      new SetFieldCommand(action.identity.value, "title", "Changed"),
    );
    expect(observer.snapshots).toHaveLength(count);
  });

  it("immediately gives a subscriber the current complete snapshot", () => {
    const session = cases.open(new ScriptedTransport());
    const observer = new RecordingObserver();
    session.subscribe(observer);
    expect(observer.snapshots).toEqual([session.snapshot]);
  });
});
