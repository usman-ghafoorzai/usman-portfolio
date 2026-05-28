# Architecture

## Overview
This portfolio uses a component-driven React frontend with data-driven project evidence and curated stack filtering.

## Dependency Direction
The intended dependency direction is:

`src/data` + `src/utils` + `src/hooks`  
↓  
`src/components/common`  
↓  
feature components  
↓  
`App.jsx`

This keeps data, pure logic and reusable behavior separate from visual section components.

## High-Level Flow
- `App.jsx` owns high-level section composition and active stack state.
- `TechStack` emits selected stack through `onStackSelect`.
- `Projects` receives `activeStack` and filters project evidence.
- `CurrentWork` and `Footer` render after `Projects` as the closing sequence.

## Data And Logic Boundaries
- Data lives in `src/data`.
- Shared reusable hooks live in `src/hooks`.
- Shared primitives live in `src/components/common`.
- Pure helpers live in `src/utils`.
- Visual config for TechStack lives in `src/components/TechStack/techStackVisualConfig.js`.

## Why Project Evidence Is Data-Driven
Project entries, stack relationships and evidence metadata are centralized in data files. This keeps content updates predictable and avoids coupling UI rendering with hardcoded evidence logic.

## Why Stack Filtering Is Curated
Stack filtering is curated through `stackEvidencePriority` per project. This allows the portfolio to show the strongest matching evidence (top two projects) for a selected stack instead of only doing broad keyword matching.

## Lint And Animation Stability
Animation-heavy sections and shader-driven Three.js code use patterns that can trigger strict hook/immutability lint rules. These areas are not blindly refactored because aggressive lint-driven rewrites can change timing, sequencing or rendering behavior.

## Future Improvements
- TypeScript migration for data models.
- Stricter lint cleanup where behavior can be preserved safely.
- Animation context for shared timing/feature toggles.
- Broader tests for data utilities and behavior-sensitive interaction logic.
- Deployment headers for security and caching.
