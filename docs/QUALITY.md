# Quality

## Historical Phase 1 handoff

Approved baseline: `388784c4fe94d5ade5d47c8b1e16489d5763d9ac`.

| Check | Result |
| --- | --- |
| ESLint | 0 errors, 0 warnings |
| TypeScript | PASS |
| Tests | 51/51 PASS |
| Production build | PASS |
| GitHub Actions | Green |
| npm audit at handoff | 0 known vulnerabilities |

The former React lint violations have been resolved. The audit result is historical, not a new advisory check; see [Dependency audit](DEPENDENCY_AUDIT.md) for scope and the cross-platform lockfile correction.

## Current Phase 2 quality state

Phase 2.6 acceptance established 69 valid published portfolio documents, zero Studio
validation errors/warnings, resolved public capability references, and live semantic
parity with one shared fetch, including cached slug lookups. Phase 2.7 switched
composition to Sanity and was subsequently verified in a real Vercel Preview browser
after environment configuration, redeployment and exact-origin CORS setup. This is
not a claim that final Production release checks have completed.

Phase 2.8A adds a static accessible fatal bootstrap state and offline coverage of
configuration, transport and validation failures. The original error is logged;
technical diagnostics are not rendered, and there is no local content fallback.
Root and Studio dependency audit results in [Dependency audit](DEPENDENCY_AUDIT.md)
are historical and separate; no fresh audit is claimed here.

## Offline quality gate and CI

Use Node 24. GitHub Actions runs on push and pull request, using SHA-pinned checkout v7.0.1 and setup-node v7.0.0 actions, read-only contents permissions, and this sequence:

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

For an installed working tree, the quality gate is the four `npm run` commands above,
followed by `cd studio`, `npm run typecheck`, and `cd ..`. Build with the intended
public `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` supplied by the process or
ignored local environment. Vite embeds these values at build time. Keep
`SANITY_LIVE_PARITY` unset for normal tests: they remain network-independent and
the live test is skipped. Lint is not bypassed or suppressed to make CI pass.

## TypeScript and architecture checks

`npm run typecheck` runs `tsc -b` over the project references with no emitted application JavaScript. Vite handles production transpilation and bundling; a successful build does not replace the typecheck.

The architectural core uses strict TypeScript, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Existing JSX remains part of an intentional staged migration through `allowJs: true` and `checkJs: false`; this does not mean the entire UI is typechecked. ESLint checks both JavaScript and TypeScript and enforces the domain, gateway, application and UI import boundaries described in [Architecture](ARCHITECTURE.md).

## Tests

The historical 51-test baseline has expanded to cover Sanity query/client contracts,
runtime validation and mapping, shared gateway snapshots, deterministic migration,
semantic comparison, production configuration/composition and bootstrap failure UI,
alongside the original filtering and component tests. React behavior tests use
Testing Library and jsdom; pure tests use the Node environment. Use the actual
Vitest summary for the current count rather than treating the historical baseline
as the current suite size.

## Opt-in live integration check

Follow [ADR 012](adr/012-live-sanity-semantic-parity-verification.md) to set
`SANITY_LIVE_PARITY=1`, `SANITY_LIVE_PROJECT_ID`, and `SANITY_LIVE_DATASET`, then run
`npm test -- sanity-live-parity` and clear the variables afterwards. It is read-only
and uses published direct-API reads, validating domain parity and one shared fetch.
Run it deliberately for content-boundary changes, separately from offline gates.
Accepted Phase 2.6 outcomes supersede the initial blocker recorded in ADR 012;
the production source decision is recorded in ADR 013.

## Understood build output

Tailwind uses Preflight only. Phase 2.7's build emitted approximately 514 kB initial
JavaScript with Sanity and 891 kB deferred Three.js/React Three Fiber, both over the
500 kB warning threshold. Phase 2.8A does not optimize bundles or change activation.
Build warnings are distinct from lint results. [Performance](PERFORMANCE.md) records
the historical Phase 1 measurement (approximately 388 kB entry), not current CMS sizes.

## Manual checks for future behavior changes

For CMS source/deployment changes, use a real browser on the target deployment:
confirm public build configuration, exact-origin CORS with credentials disabled,
successful published Sanity requests, visible content and a clean console. Node/CLI
success does not prove browser CORS behavior. Verify the fatal screen using a
controlled missing-config or blocked-request scenario, including its heading/alert
and absence of technical visitor copy. Check desktop/mobile layouts and keyboard
access; do not change production data merely to force an error.

For relevant UI changes, also check typing, viewport activation, TechStack selection,
project filtering, CurrentWork and links. For 3D changes, verify activation and the
disable flag. These are required smoke procedures, not a claim they ran in this
handoff. [CMS operations](CMS_OPERATIONS.md) covers final Production CORS hygiene.
