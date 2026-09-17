# Quality

## Build Status
Quality commands (Node 24 LTS):

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Typecheck, all 5 tests and the production build pass. Lint currently fails on the 9 baseline errors below. Build warnings about two `@theme` directives, one `@tailwind` directive and the large JavaScript chunk predate the TypeScript foundation.

## Lint Status
Lint is available through:

```bash
npm run lint
```

Some strict lint rules currently flag animation-heavy hooks and Three.js uniform mutation patterns. These areas are intentionally kept stable to avoid behavior drift in interactive sections.

Known baseline (9 errors, 0 warnings; no rule exceptions):

| File | Lines | Rule |
| --- | --- | --- |
| `src/components/About/About.jsx` | 152 | `react-hooks/set-state-in-effect` |
| `src/components/CurrentWork/CurrentWork.jsx` | 66 | `react-hooks/set-state-in-effect` |
| `src/components/Hero/Hero.jsx` | 48 | `react-hooks/set-state-in-effect` |
| `src/components/TechStack/TechStack.jsx` | 286, 294 | `react-hooks/set-state-in-effect` |
| `src/components/TechStack/TechStackBackground3D.jsx` | 263, 264, 304, 305 | `react-hooks/immutability` |

Keep the Hooks recommended flat preset (including Compiler diagnostics) and React Refresh checks active for JS/JSX and TS/TSX. Refactor state initialization and the imperative R3F uniform boundary separately with animation/interaction validation.

## TypeScript Boundary

`npm run typecheck` runs `tsc -b` against the root project references. Both application and tooling configurations use `noEmit`; only disposable build metadata is written under `node_modules/.tmp`.

`tsconfig.app.json` includes `src`, browser libraries, the automatic React JSX runtime and Vite client types. `allowJs: true` and `checkJs: false` intentionally admit the legacy JS/JSX application without migrating it in this step. New TS/TSX files are checked strictly, including when they import legacy JavaScript. Inferred JavaScript types are not a substitute for the future leaf-first migration.

`tsconfig.node.json` checks `vite.config.ts` with Node 24 types, separate from browser globals. Both configurations enable `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `isolatedModules`, `verbatimModuleSyntax` and bundler module resolution. `skipLibCheck` skips dependency declaration internals, as in Vite's template; it does not disable checking application TypeScript.

Vite still only transpiles: `npm run build` does not replace the explicit typecheck gate.

## Automated Tests
```bash
npm run test
```

Current automated tests cover pure project filtering logic in `src/utils/projectFilters.js`.

## Deployment Readiness
- Production build should pass with `npm run build`.
- Lightweight automated tests should pass with `npm run test`.
- Basic security headers are configured for deployment.
- CSP is intentionally left for a later, separately tested hardening pass.

## Continuous Integration
- GitHub Actions uses Node 24 LTS and npm caching on push and pull requests.
- Gates run in order: `npm ci`, lint, typecheck, tests, build. A failed gate fails the job; there is no install fallback or `continue-on-error`.
- Existing lint errors therefore stop the job before later gates until the separate component cleanup is complete.
- The token has only `contents: read`; checkout does not persist credentials. Official action release tags were resolved to full commit SHAs.

## Manual QA Checklist
- Hero typing works.
- About terminal starts in viewport.
- TechStack scan completes.
- Tech tokens select projects.
- Projects filter without layout shift.
- Show all resets.
- CurrentWork terminal starts in viewport.
- Footer links work.
- Mobile layout works.
