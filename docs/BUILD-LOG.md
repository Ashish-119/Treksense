# Peak Finder v2 — build log

Tracking the 7-stage build from [`peak-finder-ar-blueprint.html`](peak-finder-ar-blueprint.html).
Preview of the target UI: [`peak-finder-preview.html`](peak-finder-preview.html).

| Stage | Scope | Status | Date | Notes |
|---|---|---|---|---|
| **0** | Foundations & sensor spike | 🟢 iOS done · Android deferred | 2026‑09‑11 | iPhone 17 passes indoor **and outdoor** (drift + known‑bearing, user‑reported "full green"). Android device + `WMM.COF` carried forward — see risk note below. See [`spike/STAGE-0.md`](spike/STAGE-0.md) · reference: [`spike/reading-the-spike.html`](spike/reading-the-spike.html) |
| **1** | Backend + data layer (`/api/peaks?bbox=`) | ✅ done | 2026‑09‑12 | `api/peaks.js` + `api/_fallback-peaks.json` + `js/tiles.js` + `docs/PEAKS-API.md`. Tested against live Overpass and the fallback path via `scripts/dev-server.py`. |
| **2** | On-device store + preparation | ✅ done | 2026‑09‑16 | `js/peakstore.js` (IndexedDB) + `sw.js` + `docs/spike/stage-2-store-test.html`. DoD verified in-browser, including a real bug found and fixed mid-test. |
| **3** | AR projection engine | ⬜ not started | — | |
| **4** | Automatic rolling window | ⬜ not started | — | |
| **5** | Fallbacks, polish, a11y | ⬜ not started | — | |
| **6** | Field test → harden → launch | ⬜ not started | — | |

**Legend:** ⬜ not started · 🟡 in progress · ✅ done · 🔴 blocked

## Stage 0 — closed for iOS, carried-forward risk
Proceeding to Stage 1 on iOS-only verification, per go-ahead 2026‑09‑12. Still open,
folded into later work rather than blocking:
- [ ] **Android device** — full spike run (audit + drift + jitter + known-bearing). Do this
  before/alongside Stage 3 (AR projection engine) — that's where a wrong true/magnetic
  assumption or heavy Android jitter would actually bite. D‑0.1 (smoothing) and D‑0.2
  (declination) in `spike/STAGE-0.md` are provisionally iOS-only until then.
- [ ] Download `WMM.COF`, confirm size — needed before Stage 3 task 3‑1 (declination
  correction), not before.

## Stage 0 — findings
- iOS `webkitCompassHeading` = **true north** → declination is Android-only.
- iOS gives **GPS altitude** (±30 m) — not null as the blueprint feared.
- iPhone 17 compass **σ ≈ 0.6°** steady-state indoors; outdoor drift + known-bearing
  checks also passed ("full green", exact numbers not logged — fine for provisional
  D‑0.1/D‑0.3, revisit if Stage 3 calibration disagrees).
- Spike updated 2026-09-11: jitter test trims 3 s settling + weights σ; auto-selects
  "heading already true" on iOS; adds `webkitCompassAccuracy` readout.

## Stage 1 — what shipped
- **`api/peaks.js`** — `GET /api/peaks?bbox=s,w,n,e`. Overpass QL bbox query (2-endpoint
  failover, 12 s each), noise filter (`ele ≥ 1000` or wikidata/wikipedia), dedupe,
  sorted by elevation desc. Validates bbox range/ordering/size (≤ 3° side, ≤ 1 deg²
  area ≈ 4 tiles). Edge-cached (`s-maxage=86400`). Falls back to
  `api/_fallback-peaks.json` (~130 peaks) with `degraded:true` on provider failure —
  verified both the live-provider and forced-fallback paths return `200`.
- **`js/tiles.js`** — frozen 0.5° tile grid, shared (browser global + `require()`-able)
  between this API and the Stage 2+ on-device store. `tileKeyFor`, `tileKeyToBbox`,
  `bboxToTileKeys`, `tilesCoveringDisc`.
- **`docs/PEAKS-API.md`** — the frozen response schema, request limits, caching
  behaviour, and curl examples.
- **`vercel.json`** — function timeout (30 s).
- **`scripts/dev-server.py`** — updated to the bbox contract for local testing without
  a Vercel deploy.
- Not yet done: connecting the repo to Vercel and a live deployment smoke test (needs
  your Vercel account) — the function is deploy-ready but unexercised on the real
  platform.

## Stage 2 — first real-browser run, 2026‑09‑16

Tested locally via `scripts/dev-server.py` (not Live Server — that only serves
static files and 404s on `/api/peaks`, which is a trap worth remembering).

1. **Online prepare**, 25 km around Sankri (31.05, 78.28): 4 tiles fetched, 45
   deduped peaks stored correctly (real OSM data — Thalaiyasagar, Gangotri I–III,
   Kedar Kantha, etc). One tile came back `degraded` (provider hiccup for that
   specific square) and was still correctly counted as fetched, not failed.
2. **Offline read** (`peaksForBox()` with DevTools Network → Offline): returned
   the same 45 peaks. Expected and correct, but not by itself strong evidence —
   `peaksForBox()` never touches the network at all, online or off.
3. **Offline prepare of a brand-new area** (Everest region, never cached) — the
   decisive test. Network panel showed the real fetch failing at the service-worker
   level (`sw.js:71`, genuinely blocked by Offline mode), `sw.js` catching that and
   returning a clean synthesized `503` instead of an unhandled rejection,
   `peakstore.js` correctly treating the `503` as a failure and marking those 4
   tiles `stale`. Every layer degraded exactly as designed — no crash, no silently
   wrong data.

**Bug found by that same test, fixed same day:** `prepareArea()` was evicting
tiles >250 km from the requested centre and moving the `prep` pointer
*unconditionally* — including when every fetch in the attempt failed. The failed
Everest attempt wiped the just-prepared Sankri tiles. Real product bug, not a
test-harness artifact: a hiker walking into patchy signal, triggering an
auto-prepare that fails, would have had their last-good offline data deleted
right as they need it most. Fixed — `prepareArea()` now only evicts/moves the
prep centre when at least one tile in the attempt actually succeeded (or nothing
needed fetching); a total failure leaves existing data untouched and reports
`aborted: true` in the summary. **Your Sankri data is gone from the earlier test
(evicted before the fix existed) — re-run "Prepare this area" for it once, then
optionally repeat the offline-failure test to confirm it now survives.**

Unlike Stage 1 (which I could curl-verify myself against the live API), Stage 2 is
IndexedDB + a service worker — both need a real browser, so this first pass was
genuinely the first time this code ran anywhere.

**Re-verified after the fix:** unregistered the stale service worker (`SW_VERSION`
bumped to `pf-stage2-v2` so the browser actually noticed `peakstore.js` had
changed — see the lesson below), repopulated Sankri online, then repeated the
offline-Everest-attempt test. Confirmed: `evicted 0`, the abort note fires, all 4
Sankri tiles remain `prepared` with their original peak counts and untouched
ages, and the `prep` centre stays at Sankri rather than jumping to the failed
Everest attempt. Stage 2 DoD genuinely met.

**Lesson for the rest of this build:** a service worker only re-checks for updates
by byte-comparing `sw.js` itself. Editing any file inside `APP_SHELL` (like
`peakstore.js`) without bumping `SW_VERSION` means testers keep silently running
the old cached code with no error — exactly what happened on the first re-test
attempt here (the fix was on disk but not what the browser was running). Bump
`SW_VERSION` in the same change as any `APP_SHELL` file edit, always.

- **`js/peakstore.js`** — `peaks` / `tiles` / `prep` object stores exactly matching
  the blueprint's data model. `prepareArea(center, radiusKm, {onStatus})`: resolves
  covering tiles via `Tiles.tilesCoveringDisc`, skips tiles already `prepared` and
  younger than 30 days, fetches the rest from `/api/peaks`, upserts peaks by stable
  id, evicts tiles farther than 250 km from the new centre, records a `prep`
  singleton. `peaksForBox(center, radiusKm)` reads stored peaks for the covering
  tiles — zero network. Plus `requestPersistence()` / `isPersisted()` /
  `estimateUsage()` / `clearAll()`.
- **`sw.js`** — cache-first app shell, network-first `/api/peaks` (falls back to
  the last cached response offline). `APP_SHELL` currently covers the Stage 2 test
  page; Stage 3 will extend it with the real AR page once it exists.
- **`docs/spike/stage-2-store-test.html`** + **`stage-2-store-test.js`** — a test
  harness: prepare an area, watch per-tile progress, inspect stored tiles/peaks,
  query offline, and the exact steps for the DoD test are printed on the page
  itself.
- **Caught while building:** the page's CSP (`script-src 'self'`, no
  `unsafe-inline`) would have silently killed an inline `<script>` block — moved
  all the logic to the external `.js` file instead of weakening the CSP. Also
  caught the SW's precache list missing that same new file, which would have
  broken the offline test in a way that's easy to miss (page loads from cache,
  script silently doesn't).

## Hosting decision — 2026‑09‑13

**The whole site now deploys to Vercel, not GitHub Pages.** GitHub Pages can't run
`/api/peaks`; running the API on Vercel while keeping the static pages on GitHub
Pages would need CORS headers and two deployments to keep in sync. One deployment,
one origin, no CORS — matches the `connect-src 'self'` CSP already in place.

- `docs/spike/index.html`, `STAGE-0.md`, `stage-0-runbook.html` updated to point at
  `<your-project>.vercel.app` instead of the old `ashish-119.github.io` links.
- The historical GitHub Pages deployment (if still enabled) is a stale mirror as of
  this date — fine to leave on or turn off, doesn't affect the app.
