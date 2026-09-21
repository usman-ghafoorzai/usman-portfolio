# Quality

## Verified Phase 1 handoff

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

## Quality gate and CI

Use Node 24. GitHub Actions runs on push and pull request, using SHA-pinned checkout v7.0.1 and setup-node v7.0.0 actions, read-only contents permissions, and this sequence:

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

For an installed working tree, the quality gate is the four `npm run` commands above. Lint is not bypassed or suppressed to make CI pass.

## TypeScript and architecture checks

`npm run typecheck` runs `tsc -b` over the project references with no emitted application JavaScript. Vite handles production transpilation and bundling; a successful build does not replace the typecheck.

The architectural core uses strict TypeScript, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Existing JSX remains part of an intentional staged migration through `allowJs: true` and `checkJs: false`; this does not mean the entire UI is typechecked. ESLint checks both JavaScript and TypeScript and enforces the domain, gateway, application and UI import boundaries described in [Architecture](ARCHITECTURE.md).

## Tests

The 51 tests cover pure project filtering, the local content gateway and application loading, TechStack progress, and React behavior for the TechStack cloud, Projects and terminal typing. React behavior tests use Testing Library and jsdom; pure tests use the Node environment. These tests complement the production browser/request checks recorded at the Phase 1 handoff.

## Understood build output

Tailwind uses Preflight only; the earlier unprocessed Tailwind directive warnings are resolved. The build intentionally retains the >500 kB warning for the approximately 891 kB deferred Three.js/React Three Fiber chunk. The initial JavaScript entry is approximately 388 kB minified. This warning is distinct from ESLint's zero-warning result. See [Performance](PERFORMANCE.md) for the measured assets and activation checks.

## Manual checks for future behavior changes

When UI behavior changes, check desktop and mobile layouts, typing sequences, viewport activation, TechStack selection, project filtering/show-all, CurrentWork and external links. For changes to 3D loading, verify the request begins after activation and the disable flag prevents it. These are follow-up checks for relevant changes, not checks performed by this documentation-only update.
