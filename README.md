# @modwire/siren-ui

A strict, framework-neutral semantic UI engine for Siren documents and the Modwire
Siren UI Profile.

The package projects immutable `SirenDocument` values into deterministic UI graphs,
resolves local component semantics, evaluates safe predicates, and drives relation
and action transitions without depending on a rendering framework.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the engine design.

## Why this package

- Deterministic projection from Siren documents to immutable semantic UI graphs
- Transactional sessions driven by commands and observed through snapshots
- Local component resolution with explicit specificity and ambiguity diagnostics
- Safe presentation predicates without executable profile code
- Advertised-relation and advertised-action I/O only
- Framework-neutral ports for transports, schedulers, observers, and renderers
- Curated root API with deliberate `commands`, `model`, and `extensions` subpaths
- Adversarial black-box tests against published package entrances
- ESM-only output with declarations and source maps

## Installation

The package and its Siren client dependency are published to GitHub Packages.
Configure the `@modwire` scope in the consuming project:

```ini
@modwire:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Install with a GitHub token that can read packages:

```sh
npm install @modwire/siren-ui
```

## Project a document

Parse untrusted Siren JSON with `@modwire/siren-client`, then pass the client-owned
document contract through the UI adapter boundary:

```ts
import { SirenClient, type JsonObject } from "@modwire/siren-client";
import { SirenUiEngine, type ClientDocumentInput } from "@modwire/siren-ui";

const source: JsonObject = {
  class: ["record"],
  properties: { id: "one", title: "Architecture" },
  links: [{ rel: ["self"], href: "https://api.example.com/records/one" }],
};

const parsed = new SirenClient().parse(source);
const input: ClientDocumentInput = {
  source: parsed.source,
  root: parsed.root,
  profile: parsed.profile,
};

const document = new SirenUiEngine().project(input);
console.log(document.root.label);
```

Projection is pure and performs no transport I/O. Missing or invalid optional profile
metadata falls back to a usable generic graph with deterministic diagnostics.

## Open a session

Applications provide transport behavior and dispatch semantic commands. Commands
target node identities, never URLs:

```ts
import {
  SirenUiEngine,
  type ClientDocumentInput,
  type ClientTransportInput,
} from "@modwire/siren-ui";
import { LoadRelationCommand } from "@modwire/siren-ui/commands";

declare const input: ClientDocumentInput;
declare const transport: ClientTransportInput;

const session = new SirenUiEngine().open(input, transport);
const relation = session.snapshot.document.root.relations.values[0];

if (relation) {
  await session.dispatch(new LoadRelationCommand(relation.identity.value));
}
```

A session publishes pending state before I/O, accepts only the current operation
result, and exposes immutable snapshots suitable for React or any other renderer.

## Public API

- `@modwire/siren-ui` — engine, options, client adapter, session, and snapshot
- `@modwire/siren-ui/commands` — renderer-to-session command objects
- `@modwire/siren-ui/model` — immutable graph, values, diagnostics, and visitor
- `@modwire/siren-ui/extensions` — component rules, ports, and public errors

Internal paths are not exported and are deliberately unavailable to consumers.

## Requirements

- Node.js 22.14 or newer at runtime
- ECMAScript modules
- npm 11 when developing the repository
- GitHub Packages read access for installation

Node.js 22.18 and 24.11 are verified in CI.

## Development

```sh
npm ci
npm run verify
```

Behavioral tests exercise only the published package entrances. They threat-model
failure modes and invariants before proving happy paths; internal modules and private
state are deliberately outside the test boundary.

`npm run verify` checks formatting, linting, strict TypeScript compilation, lockfile
provenance, public-contract tests, declaration compatibility, and the exact npm
artifact.

## Release

1. Set the package version and update `package-lock.json`.
2. Merge a green pull request to `main`.
3. Publish a GitHub release tagged with the exact `v<version>` value.

The release workflow verifies the tag, runs the complete verification matrix, builds
one tarball, uploads it as the workflow artifact, and publishes that exact artifact to
GitHub Packages.

## License

[MIT](./LICENSE)
