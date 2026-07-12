import type { JsonObject, SirenResponse } from "@modwire/siren-client";
import type { FixtureObject } from "../fixture";

export class ResponseCase {
  document(body: FixtureObject, status = 200): SirenResponse {
    return { kind: "document", status, headers: {}, body: body as JsonObject };
  }

  problem(body: FixtureObject, status = 422): SirenResponse {
    return { kind: "problem", status, headers: {}, body: body as JsonObject };
  }

  empty(): SirenResponse {
    return { kind: "empty", status: 204, headers: {} };
  }

  hostile(value: object): SirenResponse {
    return value as SirenResponse;
  }
}
