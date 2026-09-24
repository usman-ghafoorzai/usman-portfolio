# ADR 013: Switch production content source to Sanity

## Decision and evidence

Phase 2.6 acceptance permits the application source switch: the real public dataset
contains 69 portfolio documents; Studio validation returned 69 valid, zero errors,
and zero warnings. All 12 capability references resolved anonymously after the
obsolete dotted document IDs were removed. The opt-in live test passed semantic
parity against local content with one fetch, including cached project slug lookups.
These are content-boundary checks, not evidence of a deployed browser application.

`main.tsx` now supplies Vite public configuration to a small composition helper,
which creates the existing published Sanity client and Sanity gateway. Main passes
that gateway to `loadPortfolioContent`, then renders the existing passive provider
and UI with `PortfolioContent`. No second content architecture is introduced.

## Configuration and failures

`VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` are required non-empty strings.
The composition helper validates them before client creation; adapters do not read
environment variables. Root `.env.example` documents placeholders. Local values
belong in ignored `.env.local`; deployment builds supply their own values. Vite
embeds these public settings during build, so a deployment configuration change
requires rebuilding. No token or secret is required for public published reads.

The client retains `perspective: "published"`, `useCdn: true`, and
`apiVersion: "2026-09-22"`. Query, validation, mapping, and shared snapshot behavior
are unchanged. Missing configuration or CMS failures reach the existing bootstrap
error handler, which logs the failure and does not mount the content UI. There is
no automatic fallback to local content.

Local fixtures and the local gateway remain for offline tests and parity reference.
Rollback is a reviewed code/configuration decision, never automatic behavior.
Normal tests remain offline, and live parity remains explicitly opt-in.

## Deployment boundary

This decision changes source composition only. Browser/deployment verification is
still required before claiming deployment success. It does not change the dataset,
Studio schema, CORS, authentication, preview behavior, or hosting configuration.

## Deployment verification outcome — Phase 2.7

The subsequent Vercel Preview browser verification, reported by the project owner,
required configuring `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` for Preview
and creating a new deployment because Vite embeds `VITE_*` values at build time.
The browser then reached Sanity, but CORS initially blocked the request. The exact
Vercel origin was added to Sanity CORS with credentials disabled; published content
subsequently rendered successfully. Phase 2.7 was therefore verified end-to-end in
Preview. This records completed verification, not a deployment performed during
the Phase 2.8A handoff. Final Production origin/release checks remain separate.

## Runtime hardening follow-up — Phase 2.8A

The fail-fast decision remains unchanged. Bootstrap now renders a static, accessible
fatal content-loading message without the provider when loading fails, while logging
the original error. It does not reveal technical details or fall back to local data.
See [CMS operations](../CMS_OPERATIONS.md) for the operational handoff.
