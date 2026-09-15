# Peak Finder v2 — build log

Tracking the 7-stage build from [`peak-finder-ar-blueprint.html`](peak-finder-ar-blueprint.html).
Preview of the target UI: [`peak-finder-preview.html`](peak-finder-preview.html).

| Stage | Scope | Status | Date | Notes |
|---|---|---|---|---|
| **0** | Foundations & sensor spike | 🟢 iOS done · Android deferred | 2026‑09‑11 | iPhone 17 passes indoor **and outdoor** (drift + known‑bearing, user‑reported "full green"). Android device + `WMM.COF` carried forward — see risk note below. See [`spike/STAGE-0.md`](spike/STAGE-0.md) · reference: [`spike/reading-the-spike.html`](spike/reading-the-spike.html) |
| **1** | Backend + data layer (`/api/peaks?bbox=`) | ✅ done | 2026‑09‑12 | `api/peaks.js` + `api/_fallback-peaks.json` + `js/tiles.js` + `docs/PEAKS-API.md`. Tested against live Overpass and the fallback path via `scripts/dev-server.py`. |
| **2** | On-device store + preparation | ⬜ not started | — | |
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

## Hosting decision — 2026‑09‑13

**The whole site now deploys to Vercel, not GitHub Pages.** GitHub Pages can't run
`/api/peaks`; running the API on Vercel while keeping the static pages on GitHub
Pages would need CORS headers and two deployments to keep in sync. One deployment,
one origin, no CORS — matches the `connect-src 'self'` CSP already in place.

- `docs/spike/index.html`, `STAGE-0.md`, `stage-0-runbook.html` updated to point at
  `<your-project>.vercel.app` instead of the old `ashish-119.github.io` links.
- The historical GitHub Pages deployment (if still enabled) is a stale mirror as of
  this date — fine to leave on or turn off, doesn't affect the app.
