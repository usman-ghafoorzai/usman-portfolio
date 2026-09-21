# Sanity content model

Phase 2.2B implementation contract, based on `c936dc728de9e07f90be767d821cf7a164b26bc8`. This document defines the first CMS slice; it installs and implements nothing. Ownership follows [CMS content ownership](CMS_CONTENT_OWNERSHIP.md), with the boundaries established in [Architecture](ARCHITECTURE.md).

## 1. Architectural rule

Sanity is an external content source. The data direction remains:

```text
Sanity documents
    -> Sanity query / external DTOs
    -> runtime validation
    -> mapper
    -> Portfolio domain types
    -> PortfolioContentGateway
    -> PortfolioContent
    -> UI
```

The future Sanity adapter owns queries, external DTOs, runtime validation and mapping behind the existing gateway. Sanity-generated types and document shapes must never become the domain contract. Studio schema validation is editor-facing and does not replace runtime validation at the application boundary. Runtime validation and mapping implementation belong to a later task.

The current snapshot remains `{ profile, siteContent, projects, experiences, technologies, capabilityAreas }`. The existing gateway, including `getSiteContent()` and project-by-slug lookup, remains domain-facing; a missing project slug returns `null`. UI continues to consume the loaded snapshot through the existing provider.

## 2. Document types and shared validation policy

Use exactly six document types: `profile`, `siteContent`, `project`, `experience`, `technology`, `capabilityArea`. Nested objects described below are embedded values, not additional document types. Do not introduce generic Page, Block, Section, SEO, Asset or Settings documents.

The following rules define publishable content, not partially authored drafts:

- Required strings must contain non-whitespace text. Optional strings must be non-empty when supplied.
- All listed parent objects and arrays are required unless explicitly optional. An allowed-empty array is represented as `[]`; it does not make its elements optional. Every string array item must contain non-whitespace text.
- URL fields must be valid absolute HTTP(S) URLs. Profile email must be a valid email address.
- Year fields must be integers in the inclusive range 1900-2100. This bounds the first portfolio model without inventing month/day precision. End years must not precede start years.
- System identifiers use lowercase letters, digits and hyphen-separated segments (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Preserve all existing identifiers. Document `stableId` values must be unique within their document type; education `stableId` values must be unique within `about.education`.
- Uniqueness checks must treat a document's draft and published version as the same logical document, while rejecting collisions with other documents. Slug uniqueness is scoped to projects.
- References must target the declared document type and resolve to valid published content before the production adapter accepts the snapshot. Use strong references; do not silently discard unresolved relationships.
- Duplicate technology references and duplicate capabilities within a project's evidence are invalid, regardless of array-item keys or differing evidence priorities. The later mapper must also detect collisions after resolving domain IDs.

## 3. Singletons

### Profile

One `profile` document, with fixed published document ID `profile`.

| Field | Sanity value | Validation |
| --- | --- | --- |
| `name` | string | Required |
| `professionalTitle` | string | Required |
| `email` | string | Required; email validation |
| `availabilityStatus` | string | Required |
| `links` | embedded object | Required |
| `links.github` | URL | Required |
| `links.linkedin` | URL | Required |

These map directly to the existing Profile responsibilities. Do not move section content into Profile or add an unnecessary `stableId` to this singleton.

### Site content

One `siteContent` document, with fixed published document ID `siteContent`. Its required embedded `hero`, `about` and `currentWork` objects correspond to the existing SiteContent model.

| Field | Sanity value | Validation / cardinality |
| --- | --- | --- |
| `hero.roles` | ordered string array | Required; minimum 1 |
| `about.label` | string | Required |
| `about.heading` | string | Required |
| `about.intro` | string | Required |
| `about.story` | ordered string array | Required; minimum 1 |
| `about.beyondCode` | ordered string array | Required; minimum 1 |
| `about.currentFocus` | ordered string array | Required; minimum 1 |
| `about.currentFocusSummary` | string | Required |
| `about.strengths` | ordered string array | Required; minimum 1 |
| `about.education` | ordered embedded education array | Required; minimum 1 |
| `currentWork.primaryWork` | string | Required |
| `currentWork.buildLog` | ordered string array | Required; minimum 1 |
| `currentWork.clientWork` | ordered string array | Required; may be empty |
| `currentWork.focus` | ordered string array | Required; minimum 1 |

Each education object contains:

| Field | Sanity value | Validation / mapping |
| --- | --- | --- |
| `stableId` | string | Required system identifier; immutable once established; maps to Education.id |
| `institution` | string | Required |
| `program` | string | Required |
| `startYear` | integer number | Required; shared year range |
| `endYear` | integer number | Required; shared year range; `endYear >= startYear` |

Education belongs only to About today, so no standalone Education documents are needed. Do not add degree, grade, URL or image fields. A Sanity array object's `_key` is infrastructure metadata, not the education domain ID.

`clientWork` can be empty when there is no client work to display. It remains semantic text, as do the other paragraph arrays. Do not store terminal commands, filenames, JavaScript-looking formatting, typing speeds or other presentation strings. React owns their construction. `currentFocusSummary` preserves the existing concise wording separately from the longer current-focus paragraphs.

## 4. Project collection

`project` is a normal document collection.

| Field | Sanity value | Validation / mapping |
| --- | --- | --- |
| `stableId` | string | Required, unique system identity; immutable once established; maps to Project.id |
| `title` | string | Required |
| `slug` | Sanity slug | Required non-empty value; generated from title by default; unique within projects |
| `label` | string | Required |
| `summary` | string | Required plain text |
| `year` | integer number | Required; 1900-2100 |
| `status` | string enum | Required; exactly `completed`, `in-progress`, `archived` |
| `featured` | boolean | Required; `false` is valid |
| `displayOrder` | integer number | Required; >= 0; CMS-only metadata |
| `technologies` | array of technology references | Required; may be empty; no duplicates |
| `capabilityEvidence` | ordered embedded object array | Required; may be empty; no duplicate capability references |
| `highlights` | ordered string array | Required; minimum 1 |
| `links` | embedded object | Required |
| `links.github` | URL | Required in the first CMS slice |
| `links.live` | URL | Optional |

Each capability evidence object has a required `capability` reference to a fixed capabilityArea document and a required integer `priority` of 1, 2 or 3. Lower numbers indicate stronger evidence. Mapping produces `{ capabilityId, priority }` using the referenced capability's validated `stableId`; labels are not duplicated. Empty evidence is valid and preserves existing projects such as `algorithms-data-structures`.

Technology references map to `technologyIds` using the referenced documents' `stableId` values. Preserve reference array order through mapping without assigning it stack presentation semantics.

`slug.current` maps to domain `slug`. Editors may change the slug without changing `stableId`; changing the title must not silently rewrite an established slug or identity. Existing migrated projects retain their current IDs even where ID and slug currently happen to match.

`displayOrder` sorts the returned collection and is discarded during domain mapping. Do not add it to Project. Duplicate order values are valid; `stableId` ascending breaks ties.

Although the existing domain ProjectLinks type allows an absent GitHub link, this CMS slice deliberately requires it because the current Project UI renders every project as a GitHub link. Do not loosen this policy until the UI supports projects without GitHub.

## 5. Experience collection

`experience` is a normal document collection using the existing Experience contract.

| Field | Sanity value | Validation / mapping |
| --- | --- | --- |
| `stableId` | string | Required, unique system identity; immutable once established; maps to Experience.id |
| `organization` | string | Required |
| `role` | string | Required |
| `startYear` | integer number | Required; shared year range |
| `endYear` | integer number or absent/null | Optional; null/absent means ongoing; if present, shared range and >= startYear |
| `location` | string | Optional |
| `summary` | string | Required |
| `highlights` | ordered string array | Required; may be empty |
| `technologies` | array of technology references | Required; may be empty; no duplicates |

The source guarantees year precision only. Store `2017`, not a fabricated date such as `2017-01-01`. The later adapter maps startYear to the year-only domain `startDate` string, and endYear to the year-only `endDate` string or `null`. Missing optional location remains absent in the domain. Do not fabricate location, highlights or technology relationships to fill empty fields.

Sort by startYear ascending, then endYear ascending with ongoing/null values last, then stableId ascending. Do not introduce `displayOrder`. UI components may derive another presentation order from these same facts.

## 6. Technology collection

`technology` is a normal document collection with two required string fields:

- `stableId`: unique, immutable system identifier mapped to Technology.id. Retain existing IDs such as `react`, `typescript`, `postgresql`, `fhir` and `java`.
- `label`: editor-owned, human-readable text.

Projects and Experiences own their references to technologies; do not duplicate reverse relationship arrays on Technology. The later mapper resolves these references to stableId values. Return technologies deterministically by stableId ascending; there is no editorial collection-order requirement.

Do not store icon keys, colors, stack membership or visual placements. These remain code-owned presentation configuration.

## 7. Capability area model

`capabilityArea` is a document type with a code-owned taxonomy. Exactly these seven fixed documents are valid, in this code-owned order:

| Domain stableId | Fixed published Sanity document ID |
| --- | --- |
| `frontend` | `capability.frontend` |
| `backend` | `capability.backend` |
| `databases` | `capability.databases` |
| `integration` | `capability.integration` |
| `mobile` | `capability.mobile` |
| `systems` | `capability.systems` |
| `workflow` | `capability.workflow` |

Each document requires `stableId`, `label` and `description` strings. stableId must be one of the seven values, match its fixed document identity, and remain immutable/system-owned. Label and description are editor-owned. Project evidence references these documents rather than duplicating labels.

Studio must expose seven fixed editors, not a general collection for arbitrary capability creation. Creating an eighth capability requires an intentional code/domain change first. The later mapper must explicitly validate stableId against the existing taxonomy, return the existing CapabilityArea domain type, and reject missing, duplicated or unknown taxonomy entries rather than silently extending it.

## 8. Stable IDs, Sanity IDs and slugs

| Concept | Ownership and behavior |
| --- | --- |
| Sanity `_id` | Vendor/storage identity used inside Sanity infrastructure and references; not exposed as an arbitrary domain ID. |
| `stableId` | Portfolio/domain identity mapped to domain `id`; survives title, label and slug changes. Assigned deliberately at creation/migration, then treated as immutable. |
| Project `slug` | Editorially editable routing/content identifier; can change without changing stableId. |

Never derive Project.id from its slug or map arbitrary Sanity `_id` values into domain IDs. Fixed capability document IDs encode known taxonomy values, but the mapper must still validate the explicit stableId/domain value. Singleton IDs identify their storage documents; Profile and SiteContent do not gain domain ID fields. Sanity `_key` values likewise never replace stableId.

## 9. Ordering contract

| Content | Returned order |
| --- | --- |
| Hero roles | Editorial array order |
| About paragraph arrays, strengths and education | Editorial array order |
| Current-work paragraph arrays | Editorial array order |
| Project highlights and capability evidence; experience highlights | Editorial array order |
| Projects | displayOrder ascending, then stableId ascending; duplicate displayOrder values are not errors |
| Experiences | startYear ascending, then endYear ascending/null last, then stableId ascending |
| Technologies | stableId ascending; no manual order field |
| Capability areas | `frontend`, `backend`, `databases`, `integration`, `mobile`, `systems`, `workflow` |

Stack grouping, stack ordering, `all`, `systems-mobile` and visual technology placement remain code-owned. Content ordering does not configure layout or animation.

## 10. Required / optional / empty policy

The detailed field tables above are authoritative. This matrix summarizes collection and optional-field decisions so missing values are not treated as unrestricted flexibility.

| Category | Required | Optional | Allowed empty |
| --- | --- | --- | --- |
| Profile | All six identity/contact strings, including both links; links object | None | None |
| Site content | All three section objects, all scalar text, all arrays | None | Only currentWork.clientWork may be `[]` |
| Education item | All five fields | None | None |
| Project | All fields except links.live, including GitHub, featured and displayOrder | links.live | technologies and capabilityEvidence may be `[]`; highlights must contain >= 1 |
| Experience | stableId, organization, role, startYear, summary, highlights, technologies | endYear, location | highlights and technologies may be `[]`; endYear may be absent/null |
| Technology | stableId, label | None | None |
| Capability area | stableId, label, description | None | None |

Do not default missing required scalars to empty strings or invent content. Empty allowed lists map to readonly domain arrays; optional live links and location are omitted when absent. Required arrays must be present, even where `[]` is valid; missing arrays and invalid items fail validation. Partial Studio drafts are not valid published snapshots.

## 11. Later Sanity Studio responsibilities

Use standard schema and Structure functionality; custom React inputs are not part of this slice. The later Studio configuration must:

- Expose one Profile editor and one Site Content editor targeting their fixed IDs; prevent generic duplicate creation, duplication and deletion of these singleton documents through normal editor actions.
- Expose Projects, Experiences and Technologies as normal collections.
- Expose the seven fixed Capability Area editors and prevent generic creation, duplication or deletion of taxonomy documents through normal editor actions.
- Assign stableId deliberately during migration/creation and make it read-only once established. For capabilities, fix it from the code-owned taxonomy. Apply the same identity protection to embedded education entries; array reordering must not change identity.
- Provide useful field descriptions explaining identity, year precision, priority and required GitHub links, and preserve array ordering wherever editorial order matters.
- Apply the specified validation and reference target restrictions before publishing.

Studio restrictions guide editors; they are not a replacement for validation of imported/API-written content at the application boundary. Do not design custom Studio components unless standard functionality later proves insufficient.

## 12. Drafts and preview

Studio may naturally create drafts. The first production adapter must explicitly consume published content only, including referenced documents. Preview mode, Visual Editing and draft perspective are not part of this integration slice; add them only after a demonstrated editorial need.

## 13. Out of scope

- Image/asset pipeline and project screenshots.
- Localization, rich-text/Portable Text and SEO CMS modeling.
- Page-builder/block-builder architecture and speculative document types.
- Custom Studio React inputs, Visual Editing and preview mode.
- Authentication/user-facing CMS features; normal Studio access is not an application authentication feature.
- CMS-driven colors, icons, animations, layout or navigation structure.
- New capability taxonomy and changes to the existing UI design.

## 14. Migration mapping and parity

| Current local fixture | Future Sanity target |
| --- | --- |
| `src/data/profile.ts` | `profile` singleton, ID `profile` |
| `src/data/siteContent.ts` | `siteContent` singleton, ID `siteContent` |
| `src/data/projects.ts` | `project` documents |
| `src/data/experiences.ts` | `experience` documents |
| `src/data/technologies.ts` | `technology` documents |
| `src/data/capabilities.ts` | Seven fixed `capabilityArea` documents |

Migration must preserve current domain IDs as stableId, including education IDs. Preserve semantic text and editorial array order. Seed project displayOrder from the current fixture index (0-based) to retain the current project collection order. Copy existing slugs independently of stableId. Resolve technologyIds and capabilityId values into references to their corresponding documents; preserve evidence priority.

Convert the existing four-digit Experience date strings to integer years without inventing finer precision. Preserve null end dates as ongoing and leave unknown relationships or details empty/absent. The `ntnu-university-projects` Experience remains an Experience; structured education remains embedded in About.

Do not delete local fixtures during initial migration. They remain the known-good source/fallback/test fixture until CMS parity is proven; this does not introduce an automatic runtime fallback mechanism. The production application stays on the local adapter during Studio scaffolding. A later source switch must preserve visible content materially and verify gateway contract behavior, stable IDs, reference resolution and ordering before retiring the local source.

## 15. Next implementation boundary

The next implementation task after this document is approved will be:

"Install and scaffold the minimal Sanity Studio/schema foundation according to this model, without switching the production application to Sanity."
