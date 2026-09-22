# 008: Validate CMS query results at the infrastructure boundary

## Decision

Treat future CMS query results as unknown input. Use Valibot at the Sanity infrastructure boundary for field-level runtime validation, followed by explicit snapshot invariants. Reject the entire snapshot on failure. Map the validated external DTO into the existing domain contracts; keep domain, application and UI independent of Valibot and Sanity storage shapes.

The DTO describes a controlled query projection, not arbitrary raw documents: project slugs are strings; documents and resolved references retain `_id`, `_type` and stableId where needed to check published source identity and snapshot membership. Fixed singleton/capability IDs are checked. Unknown object metadata is discarded; no semantic coercion or fallback is applied. Optional live links/location must be omitted when absent; only experience endYear accepts null. A future projection must honor that distinction.

The parser exposes a branded DTO only after structural and cross-document validation. The mapper accepts that type, preserves editorial arrays, applies deterministic collection sorting and drops storage/ordering metadata. The brand guides TypeScript callers; it is not a security mechanism against casts or subsequent mutation. Callers must pass the parser's unmodified result to the mapper.

## Alternatives and reasons

- Regular Zod / Zod Mini: viable validation libraries, but Valibot's modular API fits the intended browser boundary and bundle discipline without adding a second validator.
- Handwritten validators: avoid a library, but require maintaining repetitive type checks and inference alongside the content model.

Valibot provides readable schemas and inferred DTO types; explicit invariant checks keep reference/taxonomy rules understandable. No comparative bundle benchmark is claimed. The dependency is confined to infrastructure, and this task does not wire it into the production entry graph.

## Consequences

Studio validation remains editor-facing; runtime validation protects the later application boundary independently. Schema evolution must update projection expectations, validators and tests together. Fetching, query implementation, a Sanity gateway, migration and production source selection remain separate tasks. The local gateway stays selected.
