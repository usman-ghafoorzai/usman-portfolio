# Usman Portfolio

A personal developer portfolio built with React, Vite and custom interactive UI sections.

## Purpose

This portfolio presents my developer profile through interactive, project-based evidence instead of a static CV-style page. It connects skills, technology stacks and selected projects through a data-driven filtering flow.

## Focus Areas

- Backend and API development
- Full-stack application development
- System integration
- Healthcare interoperability concepts
- Data-driven project evidence

## Tech Stack

- React and Vite
- Strict TypeScript at the architectural core, with intentional staged migration of remaining JavaScript/JSX
- Custom CSS and Tailwind Preflight only
- Motion and React Icons
- Three.js / React Three Fiber, deferred until TechStack viewport activation

## Features

- Interactive hero with typed role rotation
- Terminal-inspired About section
- Animated technical profile scan
- Stack-based project evidence filtering
- Data-driven project and stack configuration
- Current work terminal outro
- Responsive dark glassmorphism interface
- Optional Three.js / React Three Fiber background effects

## Architecture and Phase Status

Phase 1 Engineering Foundation and Phase 2.6 live CMS parity verification are complete. Phase 2.7 now selects published Sanity content in the application; deployment/browser verification remains a separate step.

`src/main.tsx` is the composition root: its small bootstrap helper validates configuration and creates the published Sanity client and gateway. It calls `loadPortfolioContent(gateway)` and passes the resulting `PortfolioContent` snapshot to `PortfolioContentProvider` before rendering the UI. Feature components consume that snapshot through `usePortfolioContent`. CMS failures remain bootstrap failures; there is no automatic local fallback.

- `src/domain`: Readonly portfolio contracts independent of React and content sources.
- `src/content`: Async gateway contract, production Sanity adapter, and local adapter retained for tests/reference.
- `src/application`: Source-independent loading of the portfolio snapshot.
- `src/app/providers`: Passive snapshot provider and consumer hook.
- `src/data`: Local test/reference fixtures plus separate stack presentation configuration.
- `src/components`: Feature UI and shared primitives.
- `src/hooks` and `src/utils`: Reusable behavior and pure helpers.

Presentation choices such as colors, icons and stack grouping remain separate from domain/content contracts. ESLint import restrictions enforce the established boundaries; feature UI does not import canonical fixtures, adapters or the application loader directly. See [Architecture](docs/ARCHITECTURE.md) and its linked decision records.

## How To Run

Use Node 24 LTS (`.nvmrc`; `package.json` restricts the supported major to 24).

Copy the root `.env.example` to `.env.local` (ignored by Git) and set
`VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` to the intended public dataset.
Both are required public configuration values, not secrets. Vite embeds them at
dev-server/build time; deployment builds must supply them too. No Sanity token is
required. Missing or blank configuration fails application bootstrap clearly.
The independent Sanity Studio remains under `studio/` with its own configuration.

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview
```

## Quality and Performance

The quality commands are unchanged. Normal tests run offline; live Sanity parity is explicitly opt-in, as documented in [ADR 012](docs/adr/012-live-sanity-semantic-parity-verification.md). GitHub Actions uses Node 24 and runs `npm ci → lint → typecheck → test → build` on pushes and pull requests. See [Quality](docs/QUALITY.md) for historical foundation checks.

At the Phase 1 handoff, npm audit reported **0 known vulnerabilities**; this is a point-in-time result documented in [Dependency audit](docs/DEPENDENCY_AUDIT.md).

The Phase 2.7 production build emits an approximately **514 kB** minified JavaScript entry with the Sanity client. The approximately **891 kB** decorative 3D chunk loads after TechStack viewport activation. Both exceed Vite's 500 kB warning threshold; this source switch does not change chunking. See [Performance](docs/PERFORMANCE.md) for the earlier foundation measurements and verification.

## Links

- GitHub: [usman-ghafoorzai](https://github.com/usman-ghafoorzai)
- LinkedIn: [usman-ghafoorzai](https://www.linkedin.com/in/usman-ghafoorzai/)
- Email: [usmangha@hotmail.com](mailto:usmangha@hotmail.com)
