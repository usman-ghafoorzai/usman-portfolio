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

Phase 1 Engineering Foundation is complete. Phase 2 CMS integration has not started.

`src/main.tsx` is the composition root: it selects the local implementation of `PortfolioContentGateway`, calls `loadPortfolioContent(gateway)`, and passes the resulting `PortfolioContent` snapshot to `PortfolioContentProvider` before rendering the UI. Feature components consume that snapshot through `usePortfolioContent`.

- `src/domain`: Readonly portfolio contracts independent of React and content sources.
- `src/content`: Async gateway contract and the current local adapter, exported as `localPortfolioContentGateway`.
- `src/application`: Source-independent loading of the portfolio snapshot.
- `src/app/providers`: Passive snapshot provider and consumer hook.
- `src/data`: Local canonical fixtures plus separate stack presentation configuration.
- `src/components`: Feature UI and shared primitives.
- `src/hooks` and `src/utils`: Reusable behavior and pure helpers.

Presentation choices such as colors, icons and stack grouping remain separate from domain/content contracts. ESLint import restrictions enforce the established boundaries; feature UI does not import canonical fixtures, adapters or the application loader directly. See [Architecture](docs/ARCHITECTURE.md) and its linked decision records.

## How To Run

Use Node 24 LTS (`.nvmrc`; `package.json` restricts the supported major to 24).

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

The verified Phase 1 handoff has **0 lint errors / 0 warnings**, passing typecheck, **51/51 tests**, a passing production build and green CI. GitHub Actions uses Node 24 and runs `npm ci → lint → typecheck → test → build` on pushes and pull requests. See [Quality](docs/QUALITY.md).

At the Phase 1 handoff, npm audit reported **0 known vulnerabilities**; this is a point-in-time result documented in [Dependency audit](docs/DEPENDENCY_AUDIT.md).

The measured initial JavaScript entry is approximately **388 kB** minified. The approximately **891 kB** decorative 3D chunk loads after TechStack viewport activation; its >500 kB build warning is understood and intentionally retained. See [Performance](docs/PERFORMANCE.md) for measurements and verification.

## Links

- GitHub: [usman-ghafoorzai](https://github.com/usman-ghafoorzai)
- LinkedIn: [usman-ghafoorzai](https://www.linkedin.com/in/usman-ghafoorzai/)
- Email: [usmangha@hotmail.com](mailto:usmangha@hotmail.com)
