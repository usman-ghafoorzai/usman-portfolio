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
