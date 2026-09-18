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
