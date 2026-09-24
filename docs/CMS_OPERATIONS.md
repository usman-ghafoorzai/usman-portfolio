# CMS operations

## Architecture and ownership

Sanity Studio (`studio/`) is the editor UI and schema. Content Lake stores published
production content and provides its API. The React frontend reads through the
existing Sanity gateway, runtime validator, and mapper before mounting the content
provider. Vendor data stays behind that boundary. Browser reads are public and
tokenless; there is no automatic local fallback. A bootstrap failure logs the
original error and displays a short, accessible fatal message without technical details.

## Start Studio locally

Use repository-supported Node 24. From the repository root:

```powershell
cd studio
npm ci
# On first setup only; do not overwrite an existing local configuration.
Copy-Item .env.example .env.local
npm run dev
```

Before starting the dev server, set these values in `studio/.env.local`:

```dotenv
SANITY_STUDIO_PROJECT_ID=19bhyjyc
SANITY_STUDIO_DATASET=production
```

Sign in to Studio with an authorized editor account. Studio/CLI authentication is
separate from the anonymous frontend: never put editor credentials or tokens in
`VITE_*` values. Do not commit `.env.local`, credentials, exports, generated migration
files, or `node_modules`. Studio generated artifacts belong under ignored `.sanity/`.

## Edit, validate, publish

Open the relevant editor in the Studio sidebar:

- **Profile:** identity, title, availability, contact and links.
- **Site Content:** hero roles, About and education, Current Work; preserve editorial array order.
- **Projects:** semantic content, links, technology references, capability evidence and priority.
- **Experiences:** organization/role, year precision, optional location/end year and references.
- **Technologies:** stable identity and label; presentation grouping/icons remain code-owned.
- **Capability Areas:** seven fixed editors; change labels/descriptions, never the taxonomy.

Resolve validation errors and review warnings before publishing. Publish intended
reference targets as well as the documents that reference them, then check the
frontend. Saving a draft does not publish it. Fixed Profile, Site Content and
Capability Area documents do not offer normal duplicate/delete actions; capability
creation uses fixed templates, not a freely creatable collection.

## Identity and ordering rules

| Identity | Meaning and rule |
| --- | --- |
| Sanity `_id` | Storage identity and reference target. ID changes require a reviewed migration. |
| `stableId` | Domain identity; assign deliberately before first publication and do not casually change it. Published identity changes and duplicates are rejected. |
| Project slug | Editable routing identity, independent of title and stableId; keep it unique. |
| Array `_key` | Identity of an embedded array item; preserve it when editing/reordering, rather than recreating items unnecessarily. |

Capability taxonomy is code-owned: `frontend`, `backend`, `databases`, `integration`,
`mobile`, `systems`, `workflow`. Their storage IDs are `capability-<stableId>`.
Do not reintroduce dotted capability IDs: they caused unauthenticated reference
resolution failures. Capability stableId is read-only. Education stableIds also
remain stable once published.

Projects sort by `displayOrder` ascending; ties use `stableId` ascending. Array
order for technologies, capability evidence, highlights and editorial text is
meaningful. Capability priorities are 1 (strongest), 2 (supporting), 3 (additional).

## Published reads and freshness

Production uses `perspective: "published"`, `useCdn: true`, API version
`2026-09-22`. Unpublished drafts are intentionally invisible. Publishing can have a
short propagation/cache delay; no fixed TTL is promised here. The gateway also
retains one mapped snapshot for the page lifetime, so reload to request new content.
Do not change `useCdn` merely because an edit is not instantly visible. For diagnosis,
the existing opt-in [live parity check](adr/012-live-sanity-semantic-parity-verification.md)
uses the direct API (`useCdn: false`) without changing production defaults. Its
fixture comparison may legitimately fail after reviewed editorial content changes.

## Vercel public configuration

Both Preview and Production environments need appropriate `VITE_SANITY_PROJECT_ID`
and `VITE_SANITY_DATASET` values. These are public Config values, not secrets. Vite
embeds them at build time: changing deployment environment values requires a new
deployment. Never add a browser Sanity token as a workaround for configuration,
content, or CORS problems.

## CORS policy and release hygiene

Browser reads require allowed frontend origins in the Sanity project. Before final
Production release, ensure the **exact production origin** (scheme, host, and port
where applicable) exists. Manage Preview origins deliberately; do not add broad
`*.vercel.app` access as a shortcut. Credentials remain disabled for public portfolio
reads. Node/CLI success does not establish browser CORS success.

After release, review temporary Preview origins and retain only origins actually
required. Production CORS review/cleanup belongs to the final Phase 2.8 release
verification. This runbook does not authorize or apply any CORS change.

## Troubleshooting

| Symptom | Check / action |
| --- | --- |
| Black/fatal content screen | Inspect the browser console for the original bootstrap error; a black page with no alert can also indicate a missing/failed JS bundle. |
| Missing/invalid `VITE_SANITY_PROJECT_ID` | Verify the target Vercel environment value, then redeploy. |
| Missing/invalid `VITE_SANITY_DATASET` | Verify the target Vercel environment value and dataset name, then redeploy. |
| CORS / no `Access-Control-Allow-Origin` | Compare the actual browser origin with the exact Sanity CORS entry; keep credentials disabled. |
| Snapshot validation failed | Inspect published document/schema integrity, required values and reference targets; do not weaken validation or fall back to fixtures. |
| Edit not immediately visible | Check publish state, reload the page, and consider CDN propagation before changing code. Compare with direct API tooling if needed. |
| CLI works but browser fails | Compare authentication, CORS and browser security boundaries; authenticated CLI reads can see data anonymous reads cannot. |
| Network failure | Check browser Network/console and service connectivity; visitors may reload or retry later. No indefinite application retry loop is provided. |

Do not paste credentials into bug reports. Visitor-facing UI never displays raw
errors, project IDs, dataset names, queries or stack traces.

## Backup and restore policy

Always export before schema migrations, bulk imports, ID changes or destructive
cleanup. Use the installed Studio CLI and explicit project/dataset arguments.
Choose a fresh filename; never overwrite an existing backup accidentally.

From `studio/`, a PowerShell export pattern is:

```powershell
New-Item -ItemType Directory -Force .sanity/backups | Out-Null
$backup = ".sanity/backups/production-$(Get-Date -Format 'yyyyMMdd-HHmmss-fffffff').tar.gz"
if (Test-Path $backup) { throw 'Backup already exists' }
npx sanity dataset export production $backup --project-id 19bhyjyc
if ($LASTEXITCODE -ne 0) { throw 'Export failed; stop before mutation' }
if (!(Test-Path $backup) -or (Get-Item $backup).Length -eq 0) { throw 'Missing or empty backup' }
Get-FileHash $backup -Algorithm SHA256
tar -tzf $backup
```

Record the full path and SHA-256 in the change record. Inspect archive metadata and
parse its NDJSON to confirm expected documents/counts and usable content before
destructive work; a filename alone is insufficient. Calculate and record SHA-256
for migration artifacts too. Keep backups access-controlled and out of Git.

Prefer testing restoration into a separately provisioned recovery dataset first.
After explicit review, the installed CLI import pattern is:

```powershell
# MUTATING: run only with explicit recovery authorization and a confirmed target.
npx sanity dataset import <backup.tar.gz> --dataset <recovery-dataset> --project-id <project-id> --replace
```

Replace angle-bracket placeholders before execution. Verify recovered counts,
references, assets and schema validity before considering a production restore.
`--replace` overwrites matching IDs but does not remove extra documents; an import
alone is not necessarily an exact rollback. Production restoration/cleanup needs
its own reviewed plan. No export, import or restore is performed by this handoff.

## Local fixture policy

Local fixtures remain golden semantic test/reference data for now, not a production
fallback or a second independently edited production source of truth. Coordinate
changes to the parity baseline with reviewed CMS content changes. Future fixture
retirement/reduction requires a reviewed decision after CMS operation is stable.

For offline gates, opt-in integration checks and browser release smoke checks, see
[Quality](QUALITY.md). Historical root/Studio dependency audit scopes and deferred
Studio findings remain documented in [Dependency audit](DEPENDENCY_AUDIT.md);
this handoff does not claim a fresh audit.
