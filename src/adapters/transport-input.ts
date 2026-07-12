import type { SirenRequest, SirenResponse } from "@modwire/siren-client";

export interface ClientTransportInput {
  send(request: SirenRequest): Promise<SirenResponse>;
}
