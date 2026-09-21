# 005: Enforce architecture with ESLint

## Status

Accepted — implemented in Phase 1.

## Context

Documented boundaries can erode when feature code imports convenient local fixtures or adapters.

## Decision

Use ESLint import restrictions to enforce the established domain, gateway, application and UI boundaries. Feature UI consumes the snapshot instead of importing canonical fixtures, content infrastructure or the loader. Keep permitted presentation configuration separate from those restrictions.

## Consequences

Forbidden imports fail the existing lint gate locally and in CI. The rules check import paths; they do not validate content at runtime. New source integrations must respect the same boundaries without adding bypasses.
