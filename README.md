# Usman Portfolio

A polished personal developer portfolio built with React, Vite and custom interactive UI sections.

## Purpose
This portfolio is built to present my developer profile through interactive, project-based evidence instead of a static CV-style page. The site connects skills, technology stacks and selected projects through a data-driven filtering flow.

## Focus Areas
- Backend and API development
- Full-stack application development
- System integration
- Healthcare interoperability concepts
- Data-driven project evidence

## Tech Stack
- React
- Vite
- JavaScript
- CSS
- Motion
- React Icons
- Three.js / @react-three/fiber

## Features
- Interactive hero with typed role rotation
- Terminal-inspired About section
- Animated technical profile scan
- Stack-based project evidence filtering
- Data-driven project and stack configuration
- Current work terminal outro
- Responsive dark glassmorphism interface
- Optional Three.js / React Three Fiber background effects

## Project Structure
- `src/components`: Section and UI components used across the portfolio.
- `src/data`: Source-of-truth data for profile, stack groups and project evidence.
- `src/hooks`: Reusable hooks for viewport triggers, tilt behavior and typing primitives.
- `src/utils`: Pure helper functions and filtering logic.
- `src/components/common`: Small shared primitives such as external links.

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

## Quality Notes
- `npm run build` passes.
- Strict linting currently reports 9 existing errors in behavior-sensitive animation and Three.js patterns. These are documented in `docs/QUALITY.md` and intentionally kept stable until they can be refactored safely.
- TypeScript 6.0 provides the strict foundation for incremental migration. `vite.config.ts` is checked now; existing application JS/JSX remains unchecked by TypeScript until migrated. ESLint continues checking both languages.
- Pure project filtering logic is covered by lightweight automated tests.
- GitHub Actions gates installation, lint, typecheck, tests and production build on pushes and pull requests. The existing lint errors currently block CI; they are not suppressed.
- See `docs/ENGINEERING_FOUNDATION.md` for the baseline, validation results and dependency security findings.

## Links
- GitHub: [https://github.com/usman-ghafoorzai](https://github.com/usman-ghafoorzai)
- LinkedIn: [https://www.linkedin.com/in/usman-ghafoorzai/](https://www.linkedin.com/in/usman-ghafoorzai/)
- Email: [usmangha@hotmail.com](mailto:usmangha@hotmail.com)
