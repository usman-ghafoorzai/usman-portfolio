# Production bundle measurement — 2026-09-18

Baseline: `33399c4`, after `npm ci`, using Node 24.19.0, npm 11.6.2 and Vite 8.0.16 on Windows. One production optimization: defer the decorative TechStack 3D background until the existing one-shot viewport signal activates.

## Measurements

Sizes below are decimal kB. Minified bytes are measured from emitted files; gzip kB are Vite's displayed production-build figures.

| Build | Emitted file | Loading role | Minified bytes | Vite gzip kB |
| --- | --- | --- | ---: | ---: |
| Before | `index-BVJWruHQ.js` | Sole initial JS entry | 1,277,779 | 363.66 |
| Before | `index-pLv0n3_y.css` | Initial stylesheet | 84,609 | 35.54 |
| After | `index-DBaVAM_v.js` | Sole initial JS entry | 388,003 | 125.90 |
| After | `TechStackBackground3D-KuWN22TP.js` | Deferred 3D graph | 890,705 | 237.36 |
| After | `index-pLv0n3_y.css` | Initial stylesheet, unchanged | 84,609 | 35.54 |

The baseline Vite console displayed **1,277.77 kB JS / 363.66 kB gzip** and **84.60 kB CSS / 35.54 kB gzip**. JS chunk count changed from **1 to 2**. Initial entry reduction: **889,776 bytes (69.6346%)**; Vite-reported initial gzip reduction: **237.76 kB**. Total emitted JS is **1,278,708 bytes**, an increase of 929 bytes; total per-file Vite gzip is 363.26 kB. The code was deferred, not eliminated.

For reproducible byte-level compression measurements, Node's default `gzipSync` gave: baseline entry 360,168 bytes; new entry 124,640; deferred chunk 235,318; CSS 35,507 in both builds. Under that compressor, initial gzip reduction is **235,528 bytes**. These differ slightly from Vite/Rolldown's reporter; do not mix compressor measurements when calculating deltas.

## Attribution and confirmed import boundary

Temporary Vite programmatic builds used `build.sourcemap: true`, `write: false`, and a `generateBundle` inspection plugin. Source-map generated spans were grouped by originating package; Rolldown chunk module membership and static/dynamic imports independently established the loading graph. No analyzer dependency, generated report, production source map, or Vite configuration change was retained.

Approximate baseline minified source-mapped attribution:

| Contributor | Mapped bytes |
| --- | ---: |
| Three.js | 576,076 |
| React / React DOM / scheduler | 190,215 |
| React Three Fiber, including its bundled reconciler | 148,787 |
| Motion / Framer Motion / motion-dom / motion-utils | 121,336 |
| Application modules | 56,440 |
| React Icons | 18,707 |
| Vercel Analytics | 2,525 |
| Other mapped helpers | 7,776 |

This is approximate attribution, not independently compressible package sizes. Source-map gaps and generated code leave 155,917 baseline bytes unattributed. Even the mapped Three/R3F portion alone is material: 724,863 bytes.

Before: `App.jsx → TechStack.jsx → TechStackBackground3D.jsx → three / @react-three/fiber` was entirely static. The only entry had no static chunk dependencies and no dynamic imports; both Three build modules and both Fiber distribution modules were members of that initial chunk.

After: the entry has **no static chunk imports** and one dynamic import of the 3D chunk. All four Three/Fiber modules occur only in that deferred chunk; none occur in the initial entry. The deferred chunk imports shared React/application exports from the already-loaded entry. `dist/index.html` references only the entry JS and stylesheet; it does not preload the 3D chunk.

## Implementation and behavior

Only `TechStack.jsx` changes production behavior: module-scope `React.lazy`, a narrow `Suspense fallback={null}`, and the existing `!isThreeJSDisabled && hasStarted` rendering gate. The existing observer threshold remains 0.28. Scan effects, shaders, Canvas configuration, mobile mode, pointer behavior and CSS are unchanged.

An application-level dynamic import changes when the heavy code is requested. Arbitrary vendor chunks would not establish that deferral. No manual chunk groups, warning-threshold changes, or rendering-quality reductions were used.

## Browser/request verification

Production assets were served on fresh local QA origins with **`Cache-Control: no-store`** and timestamped HTTP request logs. The browser API did not expose a DevTools cache toggle; fresh origins and no-store responses prevented cache reuse instead. These headers and the request logger were temporary test-server behavior, not production caching changes.

- Desktop: only the entry JS was requested at page load (13:35:58 UTC); the 3D request began after TechStack activation (13:36:36). Before activation there was no canvas and no typed scan command.
- Deliberately held the 3D response: the terminal still completed its scan. After release, the canvas appeared. Layout offsets and dimensions were identical before/after arrival: layout 1060×544, terminal 406×544 at (0,0), cloud 634×544 at (426,0). No layout movement attributable to loading was observed.
- Mobile: fresh load at 390×844 configured viewport requested the entry at 13:37:34, with no canvas/3D request. After scrolling to TechStack, the deferred request arrived at 13:38:06; the mobile blob layer and canvas rendered.
- Cloud selection continued to select Frontend project evidence. No console errors were recorded in desktop/mobile checks.
- A separate temporary production build with `VITE_DISABLE_THREEJS=true` completed its scan after viewport activation with no blob layer or canvas, no 3D chunk request, and no console errors. Its request log contained only the entry JS and the unrelated analytics script request.

The existing 51 tests are retained. No heavily mocked unit test was added for a bundler/network boundary; build-graph and actual browser-request checks provide direct evidence instead.

Final quality gate: `npm ci` passed; `npm audit --json` and `npm audit --omit=dev --json` both reported zero vulnerabilities; lint had zero errors/warnings; typecheck, all 51 tests and build passed. The final clean-install artifacts matched the measurements above. Package manifests, lockfile and Vite configuration remained unchanged.

## Remaining work

The >500 kB warning remains, now caused solely by the **890.705 kB deferred 3D chunk**, rather than the initial entry. No `@theme` or `@tailwind` warnings returned. Occasional build-plugin timing notices are diagnostic output, not a new runtime issue.

The largest measured remaining initial contributors are React/React DOM/scheduler (~189.9 kB mapped) and Motion (~121.2 kB mapped). A future investigation could measure which Motion functionality the page needs before proposing another change. No further optimization is included here. Lighthouse, Core Web Vitals, CPU time and real-user latency were not measured; no improvement in those metrics is claimed.

## Phase 2 CMS production measurement — 2026-09-24

Measured clean branch `feat/cms-integration`, HEAD
`55ea9ff49eae1ffa3299914d565b0980d4dbe6ea`, after a successful root `npm ci`.
Windows, Node **24.19.0**, npm **10.9.2**, Vite **8.0.16**. The npm version is the
actual installed CLI used with the Node 24 executable, not the historical npm 11
version above. `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` were supplied only
as process-level build values for the accepted public project/dataset. No tracked
environment, package, lockfile, runtime source, or bundler configuration changed.

### Current emitted assets and delta

Minified bytes are filesystem byte lengths. Decimal gzip kB below are the production
Vite reporter's figures, not Node's default gzip measurements.

| Emitted asset | Loading role | Minified bytes | Vite gzip kB |
| --- | --- | ---: | ---: |
| `index-DdCGAB9u.js` | Sole initial JS entry; no static chunk imports | 514,612 | 163.20 |
| `TechStackBackground3D-DjTNLL7p.js` | Dynamic; gated by viewport activation and disable flag | 890,710 | 237.36 |
| `browserUpload-BTQyjHMj-BOqjuU08.js` | Dynamic Sanity upload helper; not used by portfolio reads | 1,574 | 0.83 |
| `stegaEncodeSourceMap-Dj29aWKG-Dt0IfXWD.js` | Dynamic Sanity stega helper; not enabled by production config | 3,491 | 1.58 |
| `index-gaUbAANB.css` | Initial stylesheet | 84,920 | 35.61 |

Compared with the Phase 1 table: initial JS grows **126,609 bytes (+32.63%)** and
**37.30 kB Vite gzip (+29.63%)**. Deferred 3D changes by **5 bytes**, with the same
reported gzip size. CSS grows **311 bytes**, or **0.07 kB Vite gzip**. The Phase 2.7
approximation is superseded by this exact HEAD measurement. The initial entry and
3D chunk both exceed Vite's 500 kB warning threshold. A plugin-timing diagnostic
also appeared; no Tailwind directive warnings appeared.

`dist/index.html` loads the entry and CSS, with no 3D module preload. The three
dynamic chunks import shared exports from the entry. Installed client source gates
the two small Sanity chunks behind upload/stega operations, not ordinary `fetch`.
Their emitted presence does not mean the portfolio enables uploads or Visual Editing.
The pre-render JavaScript graph is therefore one 514,612-byte entry, plus the
subsequent Content Lake request before the provider can render. CSS/fonts, API
response bytes and later analytics are separate from this JS accounting.

### Attribution methodology and results

Temporary programmatic Vite builds used `build.write: false`, hidden source maps
in memory, and inspection of final Rolldown output after Vite post-processing.
The current build's four JavaScript chunks were **byte-identical** to disk output.
Source-map generated-column spans were decoded and counted as UTF-8 bytes, grouped
by originating package/source. Module membership and static/dynamic import graphs
were inspected independently. No analyzer dependency or production source map was
added. Analysis scripts/reports stayed under ignored `studio/.sanity/phase28b/`.

| Initial contributor | Approximate mapped bytes |
| --- | ---: |
| React DOM | 178,501 |
| React + scheduler | 11,501 |
| Motion DOM + Framer Motion + motion-utils | 121,288 |
| `@sanity/client` (including code bundled within that package) | 79,028 |
| RxJS | 20,407 |
| get-it | 8,658 |
| eventsource + eventsource-parser | 8,829 |
| tslib | 3,978 |
| Valibot | 7,016 |
| Application Sanity query/validator/mapper/client/gateway | 6,267 |
| Other application code, including bootstrap | 44,789 |
| React Icons | 18,707 |
| Vercel Analytics | 2,542 |
| Unmapped / generated remainder | 3,101 |

The client and its listed transport/observable helpers account for approximately
**120,900 bytes**; adding Valibot and the application Sanity adapter gives
**134,183 bytes**. These are mapped spans, not independently removable or gzip-able
sub-bundles. That subtotal exceeds net entry growth because Phase 1/2 also differ
in application content: local fixtures left the production graph, and bootstrap,
site content and failure UX evolved. The cross-phase delta is not a controlled
single-dependency experiment. React and Motion remain the largest other contributors.

Both Three build modules and both `@react-three/fiber` ESM modules occur **only** in
the deferred TechStack chunk, never in the initial entry. The existing
`React.lazy`, `hasStarted` and `!isThreeJSDisabled` gates are unchanged. Sanity,
Valibot and application adapter modules are in the initial entry. Package-root
inspection found no package represented by multiple installed roots in the emitted
graph, and no module ID emitted into multiple chunks. There is no evidence of a
new duplicate vendor copy caused by the source switch; multiple files from one
package and Fiber's existing bundled reconciler are not a newly duplicated package.

### Optimization options and measured experiment

For option B only, a temporary pre-transform removed the static bootstrap-helper
import and inserted `await import('./bootstrap-content')` immediately before gateway
creation. This ran entirely in memory with identical dependencies/configuration;
no source edit was retained. The resulting entry was **378,715 bytes**, but the
content load additionally required:

| Experimental bootstrap dependency | Bytes |
| --- | ---: |
| `bootstrap-content-D8_FwMKF.js` | 99,015 |
| `request-CYLhJzOA-BFnvOvJe.js` | 31,570 |
| `resolveEditInfo-Cz-smq3a-CVFgkdcf.js` | 5,700 |
| `isRecord-Kfmt-nk--BGze3w87.js` | 79 |

Static dependency closure plus the entry totals **515,079 bytes across five files**,
**467 bytes more** than current. Entry size alone falls 135,897 bytes, but the same
CMS work is still required before rendering. Using Node `gzipSync` consistently,
current pre-render JS is **161,597 bytes** versus **163,734 bytes** summed across
the experimental closure (+2,137 bytes). These compressor figures must not be mixed
with Vite's displayed gzip figures. Vite can preload the new static dependencies
together once the dynamic import executes, but that step follows initial entry
loading/evaluation and precedes the CMS request. No browser latency benefit was measured.

| Option | Bytes avoided vs moved; startup and caching | Complexity / semantics / decision |
| --- | --- | --- |
| A. Retain eager client | No bytes moved or removed. One initial JS request; CMS request starts after entry evaluation. Entry caching couples app and client updates. | Existing tested production semantics; lowest maintenance. **Retain.** |
| B. Dynamic composition import | Measured entry reduction, but five-file pre-render total and gzip increase as above. Adds a dependency-discovery stage before CMS fetch. Separate cache reuse is possible, not proven; shared entry imports can couple hashes. | Small code change, but additional loading-failure/request behavior needs browser testing. Same client/query semantics if preserved. No demonstrated material startup win. |
| C. Manual vendor chunking | Could move roughly 121 kB mapped client/transport or 134 kB including validation/adapter; eliminates none. Exact output not measured. Static module preloads may parallelize requests; total required evaluation/content fetch remains. Stable vendor caching might help repeat releases. | Chunk policy and shared dependencies add maintenance. Does not inherently change query/CDN semantics, but can introduce cycles/loading regressions. Warning cosmetics alone do not justify it. |
| D. Direct fetch/GROQ HTTP | Potential upper bound is the roughly 121 kB mapped client/transport contribution, minus replacement transport code; not a measured net saving. Could truly reduce transfer/parse work while preserving one content request. | Would reimplement URL/query encoding, error/retry handling and public/published/CDN/API-version semantics. High maintenance and regression risk at the verified boundary. Not justified by bundle size alone. |
| E. Narrower supported read client or Motion reduction | Installed client exports no dedicated fetch-only entry; deep-importing internal modules is not a supported solution. Motion occupies ~121 kB mapped, but only a separately measured feature audit could establish removable bytes. | An upstream supported lean client could be evaluated later. Replacing/removing animation behavior requires a separate visual/interaction scope. Neither is a safe evidenced change here. |

**Decision: intentionally retain the current production bundle.** No option tested
meets the material-startup-improvement bar at low risk. In particular, removing the
entry warning by moving required code would not establish a performance improvement.

### Limits and verification

Source-map spans are approximate allocation, affected by minification, inlining,
shared helpers and unmapped generated code. Compression is non-additive; package
contributions cannot be independently subtracted from total gzip. Installed module
identity checks do not prove absence of every internally bundled duplicate algorithm.
This task measures local production artifacts and dependency graphs, not deployed
HTTP compression/caching, FCP/LCP, Core Web Vitals, CPU time or real-user latency.
No new browser/deployment success or speedup is claimed. The Phase 1 browser evidence
above remains historical. The source gates and current chunk graph establish that
Three/R3F deferral remains structurally intact; no 3D behavior/configuration changed.

Final Node 24 quality gate: lint, root typecheck, **183 offline tests** (one opt-in
live test skipped), production build and Studio typecheck all passed. The final
build reproduced the measured asset names and sizes. Whitespace checks passed;
only this document and the fresh dependency-audit section changed.
