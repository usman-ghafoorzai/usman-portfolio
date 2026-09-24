# 011: Generate deterministic local-to-Sanity migration artifacts

## Decision

Current local fixtures remain the migration source of truth. Pure tooling creates published singleton IDs `profile` and `siteContent`, fixed `capability-<stableId>` IDs, and `technology-`, `project-` and `experience-` prefixed stable IDs. References use these target IDs; array keys use semantic stable IDs. Project displayOrder is its original fixture index. Experience dates must be exactly four-digit years; ongoing end years and absent locations/live links are omitted.

Before serialization, storage checks verify unique document IDs, array keys, strong references and JSON values. A migration-only projection dereferences generated documents and flattens slugs for the existing runtime validator. Tests map that validated result and compare it with actual local semantic content. Top-level technologies intentionally sort by stableId under the approved target contract; parity compares those ID/label pairs independently of declaration order. All other semantic/editorial ordering must match.

NDJSON generation is offline and deterministic. Generated artifacts under `studio/.sanity/migrations/` are ignored and not versioned. No write token is stored in the repository.

## Procedure and boundaries

Run from the repository root using the existing Rolldown installation to bundle the TypeScript generator, then execute the local bundle:

```sh
node --input-type=module -e "import {build} from 'rolldown'; await build({input:'studio/scripts/generate-portfolio-migration.ts',platform:'node',output:{file:'studio/.sanity/migrations/generator.mjs',format:'esm'}})"
node studio/.sanity/migrations/generator.mjs
```

The generator prints the output path, counts and SHA-256. It creates no client and contacts no service. Inspect the artifact before any later import. Remote inspection, export/backup and CLI import are a separate explicit human-controlled step. Local fixtures remain until parity and a reviewed production source switch are established. This decision adds no production configuration, fallback or source switch.
