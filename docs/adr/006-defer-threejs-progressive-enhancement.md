# 006: Defer Three.js progressive enhancement

## Status

Accepted — implemented and measured in Phase 1.

## Context

Decorative Three.js/React Three Fiber code dominated the initial JavaScript bundle despite being needed only when TechStack activates.

## Decision

Lazy-load the existing 3D background after TechStack viewport activation. Retain the disable flag and a null Suspense fallback so the terminal can proceed independently. Keep the rendering behavior and quality unchanged.

## Consequences

Initial JavaScript is approximately 388 kB minified; approximately 891 kB is deferred. Total code is not eliminated. The deferred chunk's >500 kB warning is understood and intentionally retained. See [Performance](../PERFORMANCE.md) for measurements and request verification.
