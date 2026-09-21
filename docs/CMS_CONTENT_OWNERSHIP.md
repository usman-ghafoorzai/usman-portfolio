# CMS content ownership

Phase 2.1 decision, based on approved Phase 1 commit `5427d0ae01d6b7490741c6e177c0d6caeb695dd8`. This document defines future editorial ownership; it does not implement CMS integration.

## Fixed boundary

All CMS and other content sources must remain behind `PortfolioContentGateway`. Domain models remain independent of CMS vendor types, and presentation configuration stays separate from editable content. The [Phase 1 architecture](ARCHITECTURE.md) remains the baseline.

## CMS-owned / editor-owned content

| Area | Editable content |
| --- | --- |
| Profile | `name`, `professionalTitle`, `email`, `availabilityStatus`, GitHub and LinkedIn links; hero role/rotating-word content and its editorial order. |
| About | Heading/title text, intro text, personal story/content, beyond-code content, current-focus content, strengths and education information. |
| Current work | Current primary project/work title, build-log/body content, client-work content and current focus content. |
| Projects | Title, label, summary, year, status, featured flag, highlights and their order, GitHub/live links, technology relationships, capability evidence and priority, slug with uniqueness validation, and project display/content order. |
| Experiences | Organization, role, dates, location, summary, highlights and technology relationships. |
| Technologies | Human-readable label and project/experience relationships. |
| Capability areas | Human-readable label and description. |

Editorial ownership describes semantic information, even where that information is currently hardcoded inside a component.

## Code / system-owned concerns

- Animation timing and behavior, typing speeds and tilt behavior.
- Terminal commands and formatting, including `> whoami`, `> status`, filenames and code-like UI syntax.
- Icons / React icon components and accent colors.
- Three.js / R3F configuration, floating 3D placements, lazy-loading / performance boundaries and `VITE_DISABLE_THREEJS` behavior.
- Navbar structure, anchors and UI navigation.
- Stack presentation grouping and ordering, `all`, `systems-mobile`, and visual technology placement/grouping. These are presentation concerns, not editable capability taxonomy.
- Capability taxonomy IDs: `frontend`, `backend`, `databases`, `integration`, `mobile`, `systems`, `workflow`.

Editors may change capability labels and descriptions. Introducing a new capability ID requires an intentional code/domain change. Technology IDs and project stable identities must likewise remain stable system identifiers rather than casually editable labels; editing a label or project slug must not redefine that identity.

## Semantic content and ordering rules

The CMS must store semantic content, not preformatted terminal/UI strings. For example, the following illustrates good content (not a proposed schema):

```text
currentProject = "Portfolio V3"
buildLog = [...]
```

The following is inappropriate as stored terminal content:

```text
"> currently_working_on"
"Portfolio V3"
"> build_log"
```

React remains responsible for presenting semantic content in the terminal UI, including commands, formatting and animation behavior.

Project collection order may be editor-controlled through the CMS query/adapter returning an ordered collection; this does not require an `order` field in the domain model. Hero rotating words and project highlights retain their editorial order. Experience ordering should initially be derived from dates, without speculative manual ordering.

## Migration scope

The currently empty Experience source is intentional technical debt to address during CMS migration. Employment and education facts currently hardcoded in About should eventually use structured content instead of duplicated presentation strings. The contract work must determine their appropriate structure without inventing it here.

Images/assets are out of scope for the first CMS slice; do not design an asset pipeline yet. Localization is also out of scope; do not design multilingual schemas without a requirement. Local content must remain available until the CMS adapter and migrated content are verified stable.

## Implication for PortfolioContent

The existing `PortfolioContent` snapshot contains `profile`, `projects`, `experiences`, `technologies` and `capabilityAreas`. Real editable content also currently exists inside Hero, About and CurrentWork.

Phase 2 will therefore likely require a deliberate evolution of the content contract so those sections receive semantic content through the same content boundary. Final TypeScript types and Sanity schemas belong to Phase 2.2, not this ownership decision. This task introduces no Sanity installation or changes to production code, dependencies, configuration, tests, schemas or architecture.
