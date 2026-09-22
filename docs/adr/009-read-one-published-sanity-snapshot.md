# 009: Read one published Sanity snapshot

## Decision

Use `@sanity/client` for Content Lake reads. A factory takes projectId and dataset from a future caller and fixes `perspective: "published"`, `useCdn: true` and API version `2026-09-22`. It configures no token and reads no environment variables. This supports public end-user reads; private datasets and authenticated reads are outside this decision.

Fetch the six-part portfolio snapshot with one controlled GROQ request, rather than one request per gateway method. Treat the response as unknown and immediately pass it through the Phase 2.3A runtime validator. Transport and validation errors propagate without fallback. Mapping and the future gateway remain separate concerns.

The query retains resolved reference `_id`, `_type` and stableId values, including null results for unresolved references. It omits absent/null live links and locations through conditional projections, preserves editorial arrays, and leaves collection sorting to the mapper. It fetches all capabilityArea documents so validation can detect invalid taxonomy entries.

## Consequences

Application configuration, environment wiring and source selection are deferred. The local gateway stays selected. Preview, drafts, Visual Editing and browser tokens remain out of scope.

CORS configuration is deferred until browser runtime wiring. Before the production source switch, configure explicit trusted origins for local Vite development and the deployed portfolio; do not use wildcard CORS. No project settings or content are changed in this phase.

Offline tests use fake fetch clients and the shared query-result fixture. Query fragment checks protect the projection contract, but do not replace eventual integration validation against Content Lake.
