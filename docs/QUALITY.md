# Quality

## Build Status
Primary validation command:

```bash
npm run build
```

Expected result: successful production build.

## Lint Status
Lint is available through:

```bash
npm run lint
```

Some strict lint rules currently flag animation-heavy hooks and Three.js uniform mutation patterns. These areas are intentionally kept stable to avoid behavior drift in interactive sections.

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
- GitHub Actions runs automated tests and production build on push and pull requests.
- Lint is currently documented but not enforced in CI until animation-sensitive lint issues are cleaned up safely.

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
