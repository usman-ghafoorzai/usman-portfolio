# 004: Passive content provider and composition root

## Status

Accepted — implemented in Phase 1.

## Context

Source selection and loading should have one owner rather than being repeated by React features.

## Decision

Make `main.tsx` the composition root. It selects the gateway, awaits `loadPortfolioContent(gateway)`, and passes the resulting `PortfolioContent` snapshot to `PortfolioContentProvider` before mounting the UI. Components consume the snapshot through `usePortfolioContent`.

## Consequences

The provider distributes supplied content without fetching or selecting adapters. Startup waits for loading; the current bootstrap logs loading failures. Refresh, retry and loading-state policies are not introduced speculatively.
