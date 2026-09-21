# 003: Separate domain from presentation

## Status

Accepted — implemented in Phase 1.

## Context

Content must remain useful independently of the portfolio's stack filters, icons and visual effects.

## Decision

Keep readonly domain contracts free of React, CMS and visual fields. Represent project evidence using capability IDs and priorities; use string technology IDs. Keep colors, icons and stack grouping in presentation configuration. Neither `all` nor `systems-mobile` is a domain capability.

## Consequences

Content sources do not need to encode this UI's rendering choices. UI maps canonical evidence to presentation groups. The existing stack configuration remains presentation data even though it lives under `src/data`.
