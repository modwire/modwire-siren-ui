import type {
  JsonObject,
  ProfileDiscovery,
  SirenEntity,
} from "@modwire/siren-client";

export interface ClientDocumentInput {
  readonly source: JsonObject;
  readonly root: SirenEntity;
  readonly profile: ProfileDiscovery;
}
