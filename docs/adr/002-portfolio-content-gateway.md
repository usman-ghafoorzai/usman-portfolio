# 002: Portfolio content gateway

## Status

Accepted — implemented in Phase 1.

## Context

Local content is sufficient today, but a future CMS should not become a dependency of feature UI.

## Decision

Expose asynchronous domain-facing queries through `PortfolioContentGateway`. Use the existing `localPortfolioContentGateway` adapter for local fixtures. Keep the application loader dependent on the interface.

## Consequences

A Phase 2 CMS adapter can replace the source at the composition root while preserving consumers' contracts. Source-specific translation belongs in the adapter. CMS integration and runtime validation have not started.
