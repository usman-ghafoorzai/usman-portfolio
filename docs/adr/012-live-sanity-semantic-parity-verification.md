# ADR 012: Live Sanity semantic parity verification

## Decision

Before switching content sources, verify that the real published Content Lake produces
the same domain content as the local gateway. Offline adapter tests cannot establish
that imported documents, resolved references, and live query projections agree with
the current local fixtures. This ADR defines the procedure and acceptance criteria;
it does not record a successful live verification. The production source switch
remains deferred until parity passes and is separately authorized.

The opt-in Vitest test exercises the existing path:

Content Lake → `@sanity/client` → `SANITY_PORTFOLIO_QUERY` →
`fetchSanityPortfolioSnapshot()` → `parseSanityPortfolioSnapshot()` →
`mapSanityPortfolioSnapshot()` → the shared snapshot owned by
`createSanityPortfolioContentGateway()` → `loadPortfolioContent()` → `PortfolioContent`.

The comparison baseline is `loadPortfolioContent(localPortfolioContentGateway)`.
There is no second query, validator, mapper, fallback, or production source selection.

## Read configuration and safety

The test requires `SANITY_LIVE_PARITY=1`, `SANITY_LIVE_PROJECT_ID`, and
`SANITY_LIVE_DATASET`. Missing project or dataset values fail before any request.
Without the exact opt-in flag, the test is skipped and normal tests remain offline.
Client construction and fetching occur only inside the enabled test body.

The existing `createPublishedSanityClient({ projectId, dataset })` factory supplies
the API version and defaults. Its derived `withConfig` client explicitly uses
`perspective: "published"` and `useCdn: false` to read freshly imported data directly.
Only verification bypasses the CDN; production configuration is unchanged.
The public dataset requires no token. No token environment variable is read, and
the gateway receives only a counting `fetch` adapter. No mutation, import, CORS,
preview, Visual Editing, or subscription is involved.

## Acceptance criteria

- The existing runtime validator accepts the published snapshot.
- Domain counts are exactly one profile, one siteContent, seven projects, four
  experiences, 49 technologies, and seven capability areas. System documents are
  outside the portfolio query and are not counted.
- Application bootstrap's concurrent getters share one `fetch` invocation.
- An existing local project slug resolves to the identical domain project; a
  definitely missing slug returns null. Fetch count remains one after both lookups.
- All domain fields compare exactly, including optional-field presence and nested
  values. CMS IDs, keys, types, display-order metadata, and other DTO details are
  excluded by comparing mapped `PortfolioContent`, not stored documents.
- Only the top-level technology collection is copied and sorted by `technology.id`;
  its `id` and `label` compare exactly. Local declaration order and Sanity stableId
  order intentionally differ. Every other array retains strict order, including
  project/experience collections, capability areas, education, project technology
  IDs, capability evidence and priorities, highlights, and editorial arrays.
- Failures identify the first differing field/index, reason, and local/Sanity values.
  Success prints only counts and fetch count, never the entire portfolio.

Offline helper tests cover ordering restrictions, missing/unexpected fields,
collection lengths, scalar/nested changes, project slugs, technology labels, and
capability priorities. They use in-memory data and perform no network requests.

## Run explicitly from the repository root (PowerShell)

The following values select the Phase 2 production dataset; the test source reads
them exclusively from the environment and never hardcodes either value.

```powershell
$env:SANITY_LIVE_PARITY="1"
$env:SANITY_LIVE_PROJECT_ID="19bhyjyc"
$env:SANITY_LIVE_DATASET="production"
try {
    npm test -- sanity-live-parity
} finally {
    Remove-Item Env:SANITY_LIVE_PARITY -ErrorAction SilentlyContinue
    Remove-Item Env:SANITY_LIVE_PROJECT_ID -ErrorAction SilentlyContinue
    Remove-Item Env:SANITY_LIVE_DATASET -ErrorAction SilentlyContinue
}
```

A zero exit status and `LIVE PARITY PASSED` are required. Transport, validation,
count, cache, or semantic failures block acceptance; investigate them without
sorting away additional differences or modifying Content Lake as part of this check.
Record the actual run result separately. `src/main.tsx` continues to use the local gateway.
