# Architecture

Phase 1 Engineering Foundation is complete. This document describes the implemented baseline; CMS integration has not started.

## Content flow

```text
main.tsx (composition root)
  → loadPortfolioContent(gateway)
  → PortfolioContent snapshot
  → PortfolioContentProvider
  → React feature components (usePortfolioContent)
```

`src/main.tsx` selects `localPortfolioContentGateway`, awaits the application loader, then mounts React with the loaded snapshot. Adapter selection and startup loading belong to this composition root.

`loadPortfolioContent` depends on the `PortfolioContentGateway` interface. It loads profile, projects, experiences, technologies and capability areas concurrently and returns a readonly `PortfolioContent` snapshot. The provider receives that snapshot as a prop; it does not select a source or fetch content.

## Gateway and source boundary

```text
PortfolioContentGateway
  → localPortfolioContentGateway today (local fixtures)
  → future CMS adapter in Phase 2 (not implemented)
```

The async gateway exposes profile, project list, project-by-slug, experience, technology and capability-area queries. A missing project slug returns null. The local implementation lives in `src/content/adapters/local/local-portfolio-content-gateway.ts` and reads the canonical fixtures in `src/data`. It is an object implementing the interface, not a class.

A future CMS adapter must supply the domain-facing contract at this boundary. Vendor schemas and clients do not belong in domain contracts or feature UI. No CMS adapter, installation or runtime validation is introduced by this documentation update.

## Domain and presentation

`src/domain` defines readonly contracts for capabilities, technologies, projects, profiles and experiences. These contracts have no React or CMS dependency. Technology IDs are strings, allowing content-managed technologies without a fixed union.

Projects reference technologies by ID and capabilities through evidence with priority 1, 2 or 3; lower numbers mean stronger evidence. Canonical content does not contain visual fields such as icon keys or accent colors.

Stack filters and visual configuration remain presentation concerns. In particular, `all` and `systems-mobile` are not capability IDs. `src/data/stacks.ts` holds stack presentation configuration, while `src/components/TechStack/techStackVisualConfig.ts` holds TechStack visual configuration. Their location does not make them canonical content. App coordinates stack selection; components derive the displayed project evidence from the snapshot and presentation mappings.

## Enforced dependency boundaries

ESLint import restrictions enforce the established separation:

- Domain modules cannot import React, fixtures or outer application/UI layers.
- The gateway contract stays domain-facing and independent of adapters, fixtures and UI.
- The application loader cannot import React, fixtures or concrete adapters.
- Feature UI cannot import canonical fixtures, content infrastructure or the application loader; it consumes `usePortfolioContent`.
- Provider modules cannot import canonical fixtures or content infrastructure.
- Shared hooks and utilities cannot select concrete adapters.

Presentation configuration remains available to UI. These are import-path restrictions, not runtime validation of content.

## TypeScript and rendering

Strict TypeScript covers the architectural core and migrated utilities, hooks and components. Remaining JSX is an intentional staged migration; `allowJs: true` and `checkJs: false` keep those files compatible while ESLint checks both languages. Vite builds the application; `tsc -b` performs the separate typecheck.

Styling uses custom CSS with Tailwind Preflight only. The decorative Three.js/React Three Fiber background is lazy-loaded after TechStack viewport activation, with a null Suspense fallback so the terminal can continue independently. The existing disable flag prevents activation. Measurements and the accepted deferred-chunk warning are recorded in [Performance](PERFORMANCE.md).

## Decision records

- [001: Strict TypeScript with Vite](adr/001-strict-typescript-with-vite.md)
- [002: Portfolio content gateway](adr/002-portfolio-content-gateway.md)
- [003: Separate domain from presentation](adr/003-separate-domain-from-presentation.md)
- [004: Passive content provider and composition root](adr/004-passive-content-provider-and-composition-root.md)
- [005: Enforce architecture with ESLint](adr/005-enforce-architecture-with-eslint.md)
- [006: Defer Three.js progressive enhancement](adr/006-defer-threejs-progressive-enhancement.md)
- [007: Stop foundation before architecture theater](adr/007-stop-foundation-before-architecture-theater.md)

Phase 2 can build on these boundaries when actual CMS requirements are addressed. No additional architecture is required to complete Phase 1.
