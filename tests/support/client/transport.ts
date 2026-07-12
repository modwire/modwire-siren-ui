import type { SirenRequest, SirenResponse } from "@modwire/siren-client";
import type { ClientTransportInput } from "@modwire/siren-ui";

export class ScriptedTransport implements ClientTransportInput {
  readonly requests: SirenRequest[] = [];
  private readonly outcomes: (SirenResponse | Error | Promise<SirenResponse>)[];

  constructor(
    outcomes: readonly (SirenResponse | Error | Promise<SirenResponse>)[] = [],
  ) {
    this.outcomes = [...outcomes];
  }

  send(request: SirenRequest): Promise<SirenResponse> {
    this.requests.push(request);
    const outcome = this.outcomes.shift();
    if (outcome instanceof Error) {
      return Promise.reject(outcome);
    }
    if (outcome instanceof Promise) {
      return outcome;
    }
    if (outcome) {
      return Promise.resolve(outcome);
    }
    return Promise.reject(new Error("No scripted transport response"));
  }
}
