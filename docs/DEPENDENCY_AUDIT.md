# Dependency audit — 2026-09-18

Point-in-time npm advisory review after Step 8A (React behavior tests) and Step 8B (Tailwind processing). This record is not a security guarantee.

## Baseline and scope

- Full audit: **8 affected packages: 5 high, 3 moderate**, representing 13 distinct GHSA advisories. Vitest and its mocker share one advisory.
- `npm audit --omit=dev`: **3 high affected packages** (Vite, PostCSS, Nano ID). These were reachable through the production-listed `@tailwindcss/vite` peer dependency, not application runtime imports.
- New test dependencies: Testing Library React 16.3.3, DOM 10.4.2, user-event 14.6.7 and jsdom 30.1.0. None appeared as affected packages in this audit.
- The application builds static browser assets. The affected dependency paths below run in local development, build, lint or test tooling; they are not imported by the application's browser entry graph. The production-install audit classification is therefore distinct from browser exposure. This does not establish that development machines or CI cannot be affected.

## Affected paths and exposure

| Package at baseline | Relationship / introducing path | Plausible exposure in this repository |
| --- | --- | --- |
| Vite 8.0.14 | Direct dev dependency; also peer of production-listed `@tailwindcss/vite`, and used by Vitest / React / Babel plugins | Windows development server file access and editor-opening endpoints are relevant when the dev server is running and reachable. Production static hosting does not run these endpoints. |
| PostCSS 8.5.15 | Transitive: Vite → PostCSS | CSS processing during builds can load previous source maps. Untrusted CSS or source-map references would be relevant; no user-submitted CSS processing service is present. Exact exploitability through Vite was not established. |
| Nano ID 3.3.12 | Transitive: Vite → PostCSS → Nano ID | PostCSS's `lib/input.js` calls `nanoid/non-secure` with the constant size `6`. The identified negative/zero-size cases were not observed in that call path. |
| Vitest 4.1.7 / `@vitest/mocker` 4.1.7 | Direct dev dependency / transitive child of Vitest | Mock redirect file resolution is test tooling. This project uses `vitest run` with Node/jsdom, without browser-test tooling or an exposed test server. Exploitability under other invocations was not ruled out. |
| browserslist 4.28.2 | Transitive dev: `@babel/core` → `@babel/helper-compilation-targets` → browserslist | Build-time target queries; no untrusted custom stats file or dynamically supplied query service found in repository configuration. |
| baseline-browser-mapping 2.10.32 | Transitive dev: same Babel path → browserslist → baseline-browser-mapping | Build-time baseline queries; malformed external query input was not found in the application. |
| brace-expansion 5.0.6 | Transitive dev: ESLint → minimatch → brace-expansion | Lint/config glob expansion. Hostile glob patterns could affect tooling; application visitors do not supply lint patterns. |

## Advisory inventory

Ranges and severities below are from npm's JSON advisory metadata. Fixed boundaries refer to the installed major-version line; no major upgrade was needed.

| Package | Severity | Advisory / failure mode | Affected range | Fixed boundary |
| --- | --- | --- | --- | --- |
| Vite | Moderate | [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3): launch-editor UNC path handling can disclose Windows NTLMv2 hashes | `>=8.0.0 <=8.0.15` | `8.0.16` |
| Vite | High | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff): Windows alternate paths bypass `server.fs.deny` | `>=8.0.0 <=8.0.15` | `8.0.16` |
| PostCSS | Moderate | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp): incomplete source-map file-read fix when `from` is unset | `<=8.5.22` | `8.5.23` |
| PostCSS | High | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849): previous-source-map path traversal / file disclosure | `<=8.5.17` | `8.5.18` |
| Nano ID | High | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv): non-secure generator loop with negative size | `<3.3.16` | `3.3.16` |
| Nano ID | High | [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8): custom generator loop with zero size | `<3.3.18` | `3.3.18` |
| Vitest / mocker | Moderate | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9): redirect-mock path traversal / arbitrary file read | `>=2.1.0 <4.1.11` (Vitest aggregate range also includes prereleases) | `4.1.11` |
| browserslist | High | [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx): unbounded distinct-query cache growth / OOM | `<=4.28.6` | `>4.28.6` |
| browserslist | High | [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g): untrusted custom stats crash / prototype write | `<=4.28.6` | `>4.28.6` |
| baseline-browser-mapping | Moderate | [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv): invalid input terminates process | `>=2.0.0 <2.11.0` | `2.11.0` |
| brace-expansion | High | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp): exponential expansion of non-expanding brace groups | `>=3.0.0 <5.0.7` | `5.0.7` |
| brace-expansion | High | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg): unbounded expansion / OOM | `>=4.0.0 <5.0.8` | `5.0.8` |
| brace-expansion | High | [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895): unbounded intermediate arrays bypass earlier mitigation | `>=4.0.0 <5.0.9` | `5.0.9` |

## Remediation

- Upgraded direct dev dependencies Vite **8.0.14 → 8.0.16** and Vitest **4.1.7 → 4.1.11** (including its matching internal packages). Registry engine/peer metadata supports Node 24 and the existing Vite 8 / Vitest 4 combination. Chose the Vite patch instead of the dry-run's newer 8.3.0 minor.
- Refreshed allowed transitive versions: PostCSS **8.5.15 → 8.5.28**, Nano ID **3.3.12 → 3.3.19**, browserslist **4.28.2 → 4.29.0**, baseline-browser-mapping **2.10.32 → 2.11.25**, brace-expansion **5.0.6 → 5.0.12**. Their parent ranges already permit these versions. Associated browser-data dependencies were updated by npm.
- Moved `tailwindcss` and `@tailwindcss/vite` to devDependencies without changing their 4.3.0 versions. This corrects build-tool classification; the full audit, not just `--omit=dev`, is used to verify actual remediation.
- No forced audit fix, overrides, dependency downgrades or unrelated major upgrades.

## Commands and verification

Used Node 24 with npm, `npm audit --json`, `npm audit --omit=dev --json`, `npm ls --all --json`, targeted `npm ls`, `npm explain vite`, `npm explain brace-expansion`, package manifests and `npm view` engine/peer metadata. Reviewed `npm update vite vitest baseline-browser-mapping brace-expansion browserslist nanoid postcss --dry-run --json` before applying the narrower changes:

```sh
npm install -D vite@8.0.16 vitest@4.1.11 tailwindcss@4.3.0 @tailwindcss/vite@4.3.0
npm update baseline-browser-mapping brace-expansion browserslist nanoid postcss
npm ci
npm audit --json
npm audit --omit=dev --json
npm ls --all --json
npm run lint
npm run typecheck
npm run test
npm run build
```

Final verification after `npm ci`: both audits report **0 vulnerabilities**; `npm ls --all --json` exits successfully. Lint has **0 errors / 0 warnings**, typecheck passes, **51/51 tests** pass (44 original + 7 behavior tests), and the production build passes.

Remaining reported advisories: **production/runtime: 0; dev/build/test: 0**. No remediation is deferred. Re-run both audits when dependencies change and periodically as advisories evolve; an empty report does not prove absence of risk.

The initial dependency-tree check found extraneous WASM helper packages; the clean install removed that inconsistent local state. Its first attempt encountered a Windows lock held by IntelliJ Tailwind helpers. Only helpers confirmed to have this repository's native module loaded were stopped, after which `npm ci` and the tree check succeeded.

## Build correctness and visual checks

Step 8B retained Tailwind because its Preflight reset is active, despite no utility-class usage being found. The CSS entry now imports only that reset, processed by the first-party Vite plugin. This avoids activating previously unprocessed theme defaults and preserves existing font fallbacks.

The two `@theme` warnings and one `@tailwind` warning disappeared; generated CSS contains neither directive nor unresolved `--theme(...)` calls. The >500 kB JavaScript chunk warning remains intentionally unchanged. Desktop and mobile browser smoke checks covered Navbar, Hero, About, TechStack, Projects, CurrentWork and Footer, with no console errors. Sampled typography, spacing and colors matched the pre-change computed styles in both viewports.

## Cross-platform lockfile correction — Step 8D

Linux CI subsequently exposed missing optional peer metadata after the Windows dependency installation: top-level `@emnapi/core` and `@emnapi/runtime` 1.11.3 were absent. The earlier successful Windows checks did not establish lockfile portability. Using an isolated Ubuntu/WSL checkout with no `node_modules`, Node 24.20.0 and npm 11.19.0 (matching CI), `npm install --package-lock-only --ignore-scripts` repaired the existing lock seed. npm restored those entries, bundled Tailwind WASM metadata and normalized peer flags; package.json and all existing resolved versions stayed unchanged.

A subsequent clean Linux `npm ci`, both audits (zero vulnerabilities), `npm ls --all`, lint, typecheck, all 51 tests and build passed without modifying the repaired lockfile. No dependency upgrade or advisory-analysis change was needed.

## Sanity Studio dependency audit — 2026-09-22

### Separate scope and reproduced result

The **root portfolio** retains its previously verified zero-vulnerability audit baseline recorded above. That is a historical result, not a fresh root audit or a claim that advisories cannot change. This continuation does not change or re-audit the root dependency tree. The user reports GitHub CI #55 green for the approved HEAD `b2e8c768a320cd3b27e9530289ab31893fdb93fc`; the root quality gate is not repeated for this documentation-only update.

The **Sanity Studio** is the independent `studio/` npm project. A fresh `npm audit --json` reports **13 affected packages: 3 high, 10 moderate, 0 low, 0 critical, 0 informational** (exit 1 because findings remain). These are **10 distinct GHSA advisories: 5 high and 5 moderate**, propagated through parent packages; package counts are not advisory counts.

Installed Sanity is **6.15.0**, and `npm view sanity version` still returns **6.15.0**. `npm outdated` shows no updates within declared direct dependency ranges. It does show newer out-of-range majors for `@types/node` (24.13.6 -> 26.6.2) and TypeScript (6.0.3 -> 7.0.2); neither remediates these findings. `npm ls --all` exits 0.

### Affected leaf packages and introducing paths

All four advisory-bearing leaf packages are **transitive**, introduced by the direct Studio dependency `sanity`. The first three have high aggregate severity; UUID has moderate severity. Exact parent pins/ranges below come from the lockfile and targeted `npm explain` output.

| Affected installed copy | Introducing path from direct dependency | Parent requirement | Patch covering all reported advisories for this copy | Can current parent accept it? |
| --- | --- | --- | --- | --- |
| `adm-zip@0.6.0` | sanity 6.15.0 -> @sanity/cli 8.12.0 -> @sanity/workbench-cli 2.5.2 -> @module-federation/vite 1.21.6 -> @module-federation/dts-plugin 2.9.0 -> adm-zip | Exact `0.6.0` | `0.6.1` | No; exact pin excludes patch |
| `js-yaml@3.13.1` | sanity 6.15.0 -> @sanity/cli 8.12.0 -> @vercel/frameworks 3.29.0 -> js-yaml | Exact `3.13.1` | `3.15.2` | No; exact pin excludes patches/minors |
| `smol-toml@1.5.2` | sanity 6.15.0 -> @sanity/cli 8.12.0 -> @vercel/frameworks 3.29.0 -> smol-toml | Exact `1.5.2` | `1.7.1` | No; exact pin excludes newer 1.x |
| `uuid@10.0.0` | sanity 6.15.0 -> @sanity/cli 8.12.0 -> typeid-js 1.2.0 -> uuid | `^10.0.0` | `11.1.1` | No; patched major is outside range |

The tree already contains unaffected copies of adm-zip 0.6.1 through @sanity/runtime-cli, smol-toml 1.8.0 through @sanity/cli, and UUID 11.1.1 / 14.0.2 through other Sanity dependencies. Those copies do not replace the vulnerable copies under the constrained parents.

### Advisory inventory

These are the vulnerable ranges reported for the affected installed lines, not necessarily every historical affected major. Each fixed boundary listed was confirmed to exist with `npm view <package>@<version> version`. The parent constraints in the preceding table prevent a compatible refresh for every row.

| Package | Severity | Advisory / failure mode | Vulnerable range reported | Fixed boundary |
| --- | --- | --- | --- | --- |
| adm-zip | Moderate | [GHSA-vwc7-r8mq-g2x9](https://github.com/advisories/GHSA-vwc7-r8mq-g2x9): destination symlinks permit file overwrite during extraction | `>=0.5.9 <=0.6.0` | `0.6.1` |
| adm-zip | High | [GHSA-7q85-xj36-vmfc](https://github.com/advisories/GHSA-7q85-xj36-vmfc): declared uncompressed size causes excessive allocation / DoS | `<0.6.1` | `0.6.1` |
| js-yaml | Moderate | [GHSA-mh29-5h37-fv8m](https://github.com/advisories/GHSA-mh29-5h37-fv8m): prototype pollution in merge keys | `<3.14.2` | `3.14.2` |
| js-yaml | Moderate | [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68): repeated aliases cause quadratic merge handling | `<3.15.0` | `3.15.0` |
| js-yaml | High | [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m): merge-key chains cause quadratic CPU use | `>=3.0.0 <3.15.0` | `3.15.0` |
| js-yaml | High | [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj): quadratic CPU use in ordered-map resolution | `>=3.0.0 <3.15.1` | `3.15.1` |
| js-yaml | High | [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh): empty merge sources bypass CPU limits | `>=3.0.0 <3.15.2` | `3.15.2` |
| smol-toml | Moderate | [GHSA-v3rj-xjv7-4jmq](https://github.com/advisories/GHSA-v3rj-xjv7-4jmq): many comment lines cause DoS | `<1.6.1` | `1.6.1` |
| smol-toml | High | [GHSA-7w5x-hrqm-74c2](https://github.com/advisories/GHSA-7w5x-hrqm-74c2): malformed TOML causes DoS | `<=1.7.0` | `1.7.1` |
| uuid | Moderate | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq): missing output-buffer bounds checks | `<11.1.1` | `11.1.1` |

The other nine affected packages inherit findings through dependencies, rather than adding distinct advisories. All are moderate in npm's report. Only `sanity` is direct; the other eight are transitive through it. Their aggregate npm affected ranges are recorded separately from leaf advisory ranges:

| Installed package | Introducing parent / affected dependency | npm aggregate affected range |
| --- | --- | --- |
| sanity 6.15.0 | Direct; affected via @sanity/cli | `3.94.1-next.0.6739e10a32 - 3.94.1` or `>=5.14.2-alpha.14` |
| @sanity/cli 8.12.0 | sanity -> cli; affected via cli-build, runtime-cli, workbench-cli, frameworks and typeid-js | `<=0.0.0-20260612111702` or `>=6.0.0-alpha.3` |
| @sanity/cli-build 6.4.0 | cli -> cli-build; also runtime-cli -> cli-build; affected via workbench-cli and optional Sanity peer | `>=1.1.0` |
| @sanity/runtime-cli 17.14.0 | cli -> runtime-cli -> cli-build | `17.2.0-blueprinit.g3a96975 - 17.2.0-next.ga4b9ae7` or `>=17.3.0-blueprinit.g6a63623` |
| @sanity/workbench-cli 2.5.2 | cli / cli-build -> workbench-cli -> module-federation/vite | `*` |
| @module-federation/vite 1.21.6 | workbench-cli -> vite -> dts-plugin | `>=1.9.5` |
| @module-federation/dts-plugin 2.9.0 | module-federation/vite -> dts-plugin -> adm-zip | `<=0.0.0-research-issue-4085-20251016232757` or `>=0.1.3` |
| @vercel/frameworks 3.29.0 | cli -> frameworks -> js-yaml / smol-toml | `>=0.2.1-canary.0` |
| typeid-js 1.2.0 | cli -> typeid-js -> uuid | `>=1.1.0` |

### Remediation decision and residual risk

**No compatible remediation was found under the existing dependency constraints; no dependency or lockfile change was made.** Patched leaf releases exist without requiring a Sanity major downgrade in principle, but the current graph cannot select them through a normal semver-compatible refresh:

- Latest @sanity/cli 8.12.0 and @sanity/workbench-cli 2.5.2 are already installed. Workbench pins module-federation/vite to 1.21.6, which pins dts-plugin to 2.9.0. Latest vite integration 1.22.1 still requires dts-plugin 2.9.0; latest dts-plugin 2.9.1 still pins adm-zip 0.6.0. Updating those parents would not remove the ZIP findings.
- The CLI pins @vercel/frameworks 3.29.0. Latest frameworks 3.34.0 still pins js-yaml 3.13.1 and smol-toml 1.5.2, so even replacing that parent would not resolve these findings.
- Latest typeid-js 1.2.0 still requires UUID `^10.0.0`; UUID 11.1.1 is outside that range.
- npm's `fixAvailable` proposes Sanity **5.14.1** for the affected chains, a major downgrade. That is not an acceptable remediation for this Sanity 6 task. Replacing the pinned leaves would require overrides or upstream changes; compatibility of such forced replacements has not been established. No overrides, forced fixes, downgrades or unrelated architecture changes were applied.

Studio/CLI tooling is isolated from the browser portfolio bundle, but still executes on developer and CI machines. This isolation does **not** make the findings harmless. Untrusted archive extraction, YAML/TOML processing and affected UUID buffer operations remain relevant potential exposures; this audit traces dependencies and does not prove whether every vulnerable operation is reachable through current commands.

The current operational scope limits Studio CI to installation and TypeScript checking; no configured cloud project, content import, deployment or Studio build is introduced by this task. These boundaries reduce the operations performed, but do not patch the packages or establish that CI/developer machines are safe. Avoid processing untrusted archives/configuration with the affected tooling. Remediation is deferred specifically because of upstream dependency constraints, not because Studio is separate. Future Sanity releases or dependency refreshes should trigger another full Studio audit and review of these parent pins.

### Commands and verification for this continuation

From `studio/`, ran `npm audit --json`, `npm outdated`, `npm ls --all`, `npm view sanity version`, and targeted `npm explain adm-zip`, `npm explain js-yaml`, `npm explain smol-toml`, `npm explain uuid`. Inspected the Studio manifest/lockfile and used `npm view` on relevant parent dependencies and the listed patched versions. No broad repository or upstream-source analysis was needed.

Studio `npm run typecheck` and repository `git diff --check` pass. No dependency files changed, so no reinstall or root quality-gate rerun was needed. No Sanity build was run because a real project ID/dataset is not configured. CI, schemas and production source remain unchanged; no secrets, cloud project or migrated content were added. Changes are left uncommitted for review.

## Phase 2.8B fresh dependency evidence — 2026-09-24

Measured HEAD `55ea9ff49eae1ffa3299914d565b0980d4dbe6ea` on
`feat/cms-integration`, initially clean. Windows, Node **24.19.0**, npm **10.9.2**.
Both projects were independently reinstalled with `npm ci` from their existing
lockfiles. No update, downgrade, override, forced audit fix or package/lockfile edit
was performed. Reports were saved under ignored `studio/.sanity/phase28b/`.

### Root application: fresh full and runtime scopes

| Command | Result |
| --- | --- |
| `npm ci` | Exit 0; 267 packages added, 268 audited |
| `npm audit --json` | Exit 0; **0 vulnerabilities** in all severity categories |
| `npm audit --omit=dev --json` | Exit 0; **0 vulnerabilities** in all severity categories |
| `npm ls --all --json` | Exit 0; no invalid/missing/extraneous tree problems reported |

These are fresh results, not reused Phase 1 claims. The full result includes
dev/build/test dependencies; the omit-dev result covers npm's production dependency
scope. Neither proves all runtime behavior safe or that future advisories cannot
change. Browser relevance was inspected separately in the production bundle graph:
the published Sanity client, transport/observable helpers, Valibot and adapter are
now in the entry; Studio/CLI packages are not part of that frontend graph. No root
vulnerability remediation is indicated by these reports.

### Studio: fresh result and comparison

| Command | Result |
| --- | --- |
| `npm ci` | Exit 0; 898 packages added, 899 audited; deprecated UUID 10 warning |
| `npm audit --json` | Exit 1; **13 affected packages: 3 high, 10 moderate**, zero low/critical/info |
| `npm outdated --json` | Exit 1; Sanity 6.15.0 → wanted/latest 6.16.0; other entries below |
| `npm ls --all --json` | Exit 0; no invalid/missing/extraneous tree problems reported |

Installed Sanity remains **6.15.0**. The affected-package counts and the **same ten
distinct advisories (five high, five moderate)** match the 2026-09-22 inventory above.
All ten GHSA IDs still appear in the fresh JSON; no previous finding disappeared.
Leaf aggregate severities remain high for adm-zip, js-yaml and smol-toml, moderate
for UUID. The other nine packages inherit moderate findings through their trees.
Affected-package totals must not be confused with distinct-advisory totals.

| Affected leaf / current path | Current constraint | Patched boundary covering recorded findings | Current remediation status |
| --- | --- | --- | --- |
| `adm-zip@0.6.0`: sanity → @sanity/cli → @sanity/workbench-cli → @module-federation/vite → @module-federation/dts-plugin | dts-plugin 2.9.0 pins `0.6.0` | 0.6.1 | Still blocked by exact pin, including latest checked dts-plugin 2.9.1 |
| `js-yaml@3.13.1`: sanity → @sanity/cli → @vercel/frameworks | frameworks 3.29.0 pins `3.13.1` | 3.15.2 | Still blocked; latest checked frameworks 3.34.0 retains pin |
| `smol-toml@1.5.2`: sanity → @sanity/cli → @vercel/frameworks | frameworks 3.29.0 pins `1.5.2` | 1.7.1 | Still blocked; latest checked frameworks 3.34.0 retains pin |
| `uuid@10.0.0`: sanity → @sanity/cli → typeid-js | typeid-js 1.2.0 requires `^10.0.0` | 11.1.1 | Still outside parent range; latest typeid-js remains 1.2.0 |

### Fresh upstream checks: updates exist, but no compatible security fix established

Current registry metadata (`npm view <package> version dependencies --json`) and
installed manifests establish:

- Sanity **6.16.0** is a normal compatible minor under the existing `^6.0.0` range.
  It requires `@sanity/cli: ^8.12.0`; installed 6.15.0 requires `^8.10.0` and already
  resolves to CLI **8.12.0**, also the latest checked CLI. Updating Sanity alone
  therefore does not remove these vulnerable leaf chains.
- CLI 8.12.0 still requires workbench `^2.5.2`, frameworks **3.29.0** exactly and
  typeid-js `^1.2.0`. The installed workbench is **2.5.2**, pinning federation/vite
  **1.21.6**. Latest compatible workbench **2.7.0** now pins federation/vite
  **1.22.1**, but that still pins dts-plugin **2.9.0**, which pins adm-zip **0.6.0**.
  Latest dts-plugin **2.9.1** also retains the vulnerable adm-zip pin.
- Latest frameworks **3.34.0** is outside the CLI's exact 3.29.0 requirement and
  still pins js-yaml 3.13.1 and smol-toml 1.5.2 anyway. Latest typeid-js **1.2.0**
  still requires UUID `^10.0.0`.
- `npm outdated` additionally reports `@types/node` current/wanted **24.13.6**,
  latest **26.6.2**, and TypeScript current/wanted **6.0.3**, latest **7.0.2**.
  These out-of-range major updates do not address the findings.

Compared with September 22, newer compatible Sanity and workbench releases exist,
but **no normal compatible remediation for the recorded findings was established**.
This is based on fresh registry dependency constraints, not an assertion that an
uninstalled candidate tree was audited. No upgrade was applied. A routine move to
Sanity 6.16.0 or workbench 2.7.0 would be a separate reviewed update, not an evidenced
security fix. npm still proposes Sanity **5.14.1** as a breaking `fixAvailable`;
that downgrade remains outside the accepted scope.

### Residual risk and handling

The unchanged Studio findings concern archive extraction/file overwrite and
allocation, YAML/TOML denial of service/prototype pollution, and UUID buffer writes
as detailed in the linked advisory inventory above. They are in Studio/CLI tooling,
not the portfolio browser graph, but developer/CI execution remains relevant.
Do not treat frontend separation as remediation or process untrusted archives and
configuration casually. Reachability/exploitability of every vulnerable function
was not established by this audit. Keep tracking upstream pins and review a future
compatible fix with a clean install and fresh audits before adoption.

No dataset, CORS, Vercel or deployment operation was performed. No dependency change
was made; historical audit sections above remain point-in-time records rather than
being rewritten as current results.

After both clean installs, Node 24 lint, root typecheck, **183 offline tests** (one
live test skipped), build and Studio typecheck passed. `git diff --check` passed;
only the performance and dependency-audit documentation is modified.
