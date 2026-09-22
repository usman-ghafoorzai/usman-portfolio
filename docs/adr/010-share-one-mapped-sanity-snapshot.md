# 010: Share one mapped Sanity snapshot behind the gateway

## Decision

`createSanityPortfolioContentGateway(client)` implements the existing domain-facing `PortfolioContentGateway`. All methods share one lazy, memoized promise that uses the existing snapshot transport, runtime validator and mapper. One Content Lake request supplies all getters; validation and mapping run once for the successful snapshot cached for that gateway instance's lifetime.

Concurrent callers share the in-flight load. A transport, validation or mapping failure propagates unchanged and clears the cached promise. A later explicit method call may attempt a new load; no automatic retries, timers or fallback are introduced. Successful readonly domain values are returned directly without cloning or mutation. Slug lookup searches cached mapped projects and returns null when absent.

## Reasons and consequences

`loadPortfolioContent` calls six getters concurrently. Sharing the mapped promise prevents duplicate requests and keeps all getters on one consistent snapshot while preserving the existing interface. Refreshing successfully loaded content requires a new gateway instance.

Production source selection, application environment configuration and runtime fallback remain deferred. The local gateway stays selected; this phase does not contact a real dataset or alter project settings.
