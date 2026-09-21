# 007: Stop foundation before architecture theater

## Status

Accepted — Phase 1 completion boundary.

## Context

The domain contracts, gateway, composition root, passive provider, import rules and quality gate provide the foundation required for the next phase.

## Decision

Stop foundation work at these implemented boundaries. Add abstractions only when concrete requirements justify them; do not prebuild a CMS framework, generic repository hierarchy or speculative loading infrastructure.

## Consequences

Phase 1 is complete without requiring every JSX file to migrate. Phase 2 can introduce a CMS adapter against the existing contract when that work begins. New needs may justify later decisions, but this documentation update adds no architecture or CMS implementation.
