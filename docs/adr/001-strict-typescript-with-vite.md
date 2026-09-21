# 001: Strict TypeScript with Vite

## Status

Accepted — implemented in Phase 1.

## Context

The portfolio needs checked content contracts while existing React sections migrate incrementally.

## Decision

Use strict TypeScript at the architectural core and Vite for bundling. Run `tsc -b` separately in the quality gate. Retain `allowJs: true` and `checkJs: false` for remaining JavaScript/JSX; ESLint checks both languages.

## Consequences

Domain and application contracts receive strict checks without forcing a wholesale UI rewrite. Remaining JSX is intentionally not typechecked. A passing Vite build alone does not establish type safety.
