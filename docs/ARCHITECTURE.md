# Architecture

Phase 1 Engineering Foundation and Phase 2.6 live semantic parity are complete. Phase 2.7 selects Sanity at the application composition root. This describes the source implementation, not a verified deployment.

## Content flow

```text
main.tsx (composition root)
  → createPublishedSanityClient(config)
  → createSanityPortfolioContentGateway(client)
  → loadPortfolioContent(gateway)
  → PortfolioContent snapshot
  → PortfolioContentProvider
  → React feature components (usePortfolioContent)
```

`src/main.tsx` passes `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` from `import.meta.env` to the small `src/bootstrap-content.ts` composition helper. It rejects missing, non-string, or blank values before creating the existing published client and Sanity gateway. Main awaits the application loader, then mounts React with the loaded snapshot. Adapter selection and startup loading belong to this composition root; environment reading does not belong inside the adapter. Vite supplies these public values at dev-server/build time.

`loadPortfolioContent` depends on the `PortfolioContentGateway` interface. It loads profile, site content, projects, experiences, technologies and capability areas concurrently and returns a readonly `PortfolioContent` snapshot. The provider receives that snapshot as a prop; it does not select a source or fetch content.

## Gateway and source boundary

```text
PortfolioContentGateway
  → createSanityPortfolioContentGateway(client) in production
  → localPortfolioContentGateway for tests/reference
```

The async gateway exposes profile, site content, project list, project-by-slug, experience, technology and capability-area queries. A missing project slug returns null. The local implementation and fixtures in `src/data` remain available for offline tests and semantic reference; they are not the production content source.

The Sanity adapter fetches `SANITY_PORTFOLIO_QUERY`, validates the snapshot at runtime before mapping, and exposes domain values through the gateway. Vendor shapes and clients stay behind this boundary, outside domain contracts and feature UI. The gateway shares one lazy mapped snapshot across the six getters and cached slug lookups. Production reads published content without a token, using the existing CDN-enabled client and API version. Configuration, transport, and validation failures propagate to the existing bootstrap error handler; there is no silent local fallback.

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

- [008: Validate CMS query results at the boundary](adr/008-validate-cms-query-results-at-the-boundary.md)
- [009: Read one published Sanity snapshot](adr/009-read-one-published-sanity-snapshot.md)
- [010: Share one mapped Sanity snapshot](adr/010-share-one-mapped-sanity-snapshot.md)
- [011: Generate deterministic Sanity migration artifacts](adr/011-generate-deterministic-sanity-migration-artifacts.md)
- [012: Live Sanity semantic parity verification](adr/012-live-sanity-semantic-parity-verification.md)
- [013: Switch production content source to Sanity](adr/013-switch-production-content-source-to-sanity.md)
