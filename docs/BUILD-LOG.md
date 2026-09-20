# Peak Finder v2 — build log

Tracking the 7-stage build from [`peak-finder-ar-blueprint.html`](peak-finder-ar-blueprint.html).
Preview of the target UI: [`peak-finder-preview.html`](peak-finder-preview.html).

| Stage | Scope | Status | Date | Notes |
|---|---|---|---|---|
| **0** | Foundations & sensor spike | 🟢 iOS done · Android deferred | 2026‑09‑11 | iPhone 17 passes indoor **and outdoor** (drift + known‑bearing, user‑reported "full green"). Android device + `WMM.COF` carried forward — see risk note below. See [`spike/STAGE-0.md`](spike/STAGE-0.md) · reference: [`spike/reading-the-spike.html`](spike/reading-the-spike.html) |
| **1** | Backend + data layer (`/api/peaks?bbox=`) | ✅ done | 2026‑09‑12 | `api/peaks.js` + `api/_fallback-peaks.json` + `js/tiles.js` + `docs/PEAKS-API.md`. Tested against live Overpass and the fallback path via `scripts/dev-server.py`. |
| **2** | On-device store + preparation | ✅ done | 2026‑09‑16 | `js/peakstore.js` (IndexedDB) + `sw.js` + `docs/spike/stage-2-store-test.html`. DoD verified in-browser, including a real bug found and fixed mid-test. |
| **3** | AR projection engine | 🟡 code done, awaiting your test | 2026‑09‑16 | `peak-finder.html` + `js/peakfinder.js` — real page, wired into the nav. **Zero browser testing possible on my end for this stage** (camera/GPS/orientation need a real device) — this is the riskiest handoff yet. See below. |
| **4** | Automatic rolling window | ✅ done | 2026‑09‑19 | Manual "Prepare" button removed from the real page, replaced with an automatic drift detector + online gate/backoff in `js/peakstore.js`. Verified on the test harness (two real routes, several real bugs found and fixed) and on `peak-finder.html` itself on a phone — chip correctly cycles "no peaks prepared" → "preparing…" → "prepared just now · here" with zero taps. |
| **5** | Fallbacks, polish, a11y | ✅ done | 2026‑09‑20 | Map mode (camera/compass denied), manual location entry (GPS denied), accessible peak list, permission priming, low-accuracy banner, horizon placement for unknown-elevation peaks, PWA manifest/icons/service-worker registration. Verified end-to-end on a real device: camera-denied → map mode, GPS-denied → manual location, offline load via Airplane Mode, Lighthouse (99/94/100/100 on `peak-finder.html`), manifest installability, N-up toggle + live rotation, and three real bugs found through live testing and fixed (map-mode responsiveness twice, untappable dots, manifest icon error). |
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

## Stage 3 — what shipped, and why this handoff is different from Stages 1–2

Stage 1 I could `curl`-verify myself. Stage 2 needed a browser but I could at
least reason about IndexedDB transactions precisely. Stage 3 needs a live
camera, a live compass, live GPS, and a phone held outdoors — **none of which
exist in this environment**. Everything below is careful code review and
cross-checking against the Stage 0 spike's already-validated sensor logic, not
execution. Treat your first real test as the actual first run, same as Stage 2 —
except this time expect to find more than one thing, not because the code is
careless but because there's simply more surface area (camera + 3 sensors +
projection math + a two-point calibration flow) than any prior stage.

**Shipped:**
- **`peak-finder.html`** + **`js/peakfinder.js`** — the real AR view. Camera
  feed, compass HUD, live peak labels (bearing → x, elevation angle → y with
  earth curvature + refraction, matching the blueprint's geometry figure
  exactly), tap-to-detail sheet with an embedded map, drag-to-align field
  correction (persisted per device), and a two-point FOV calibration flow.
- **Sensor fusion is ported, not reinvented** — the exact heading-source
  detection (`webkitCompassHeading` true vs W3C absolute-magnetic vs
  unreliable-relative), the same coarse declination stand-in, and the same EMA
  smoothing approach from `docs/spike/sensor-spike.html`, which *was*
  validated on your iPhone 17. Default smoothing α is still the iOS-only
  provisional value from D‑0.1 (Stage 0) — Android's number isn't in yet, so
  this default may need revisiting once you've collected it.
- **Nav wiring** (per your instruction, added to Stage 3's checklist in the
  blueprint): "Peak Finder" is now a real bottom-nav / header-nav item across
  the whole site, not a hidden URL. `js/shared.js`, `css/styles.css`,
  `index.html` footer updated (same pattern as the original ask — this had
  been reverted once already, see memory).
- **Deliberately not built** (matches the plan's own stage boundaries, not
  cut corners): no map-mode fallback for denied camera (that's Stage 5 t5‑1),
  no manual-location entry for denied GPS (Stage 5 t5‑3), no background-tab
  camera release (Stage 5 t5‑6). Denied permissions currently just show a
  plain error screen with a retry button. This is intentional scoping, not an
  oversight — flagging so it's not mistaken for one.

**Two real bugs caught during review, fixed before handoff (not found by
testing — nothing here has run yet):**
1. **Calibration math was reading the heading at the wrong moment.** The
   two-point FOV calibration needs the compass reading from the instant peak A
   was centred in the reticle — the first draft re-read the *current* heading
   at the end of the whole 3-step flow instead, silently assuming the phone
   never moved in between. Fixed to capture and store the reading at step 1.
2. **The gate and error screens had a CSS bug that would have made them
   permanently visible or permanently stuck.** `.pkf-gate` and `.pkf-error`
   both set `display: flex` unconditionally; author CSS beats the browser's
   default `[hidden]{display:none}`, so toggling the `hidden` property from
   JS would have done nothing. Concretely: the error screen would have shown
   on *every* page load overlapping the gate, and the gate would never have
   disappeared after a successful boot, overlapping the live AR view. Added
   explicit `[hidden]{display:none}` overrides for both. Worth remembering as
   a pattern for the rest of this build: any element toggled via the `hidden`
   attribute must never get its own unconditional `display` in CSS.

**The calibration flow's math, for the record** (so it's checkable): centring
peak A gives one reading; without moving the phone, tapping peak B's on-screen
position at fraction `x₂` of the width gives a second. The heading/offset terms
cancel algebraically between the two, leaving
`hFOV = normalize180(trueBearing_B − trueBearing_A) / (x₂ − 0.5)` — the field
of view is recovered from the angular separation of two known peaks and their
relative screen positions alone. Guards against a near-zero denominator (peaks
too close together on screen) and an out-of-range result (25°–100°).

## Stage 3 — manual test plan (yours — nothing here can run without a phone)

1. **Load the page.** `peak-finder.html` should open from the bottom nav
   ("Peaks" → now "Peak Finder"). Preflight checklist should read all green
   outdoors on a real phone over HTTPS (Vercel or `localhost`).
2. **Start it.** Grant motion/orientation (iOS gesture), camera, location in
   that order. Camera feed should appear with a compass ribbon and heading
   readout on top.
3. **If no peaks are prepared for your area**, the banner should appear
   automatically — tap "Prepare this area" and watch the same per-tile log
   behaviour as the Stage 2 harness (this reuses `PeakStore.prepareArea()`
   unchanged).
4. **Pan slowly across the skyline.** Labels should track smoothly, nearest
   peak on top when they'd overlap, with a leader line down to the summit.
5. **Tap a label** → detail sheet should show real elevation/distance/bearing
   and an embedded map.
6. **Try the field correction**: drag the camera view — labels should shift
   with your finger (not the reverse). Tap "Reset correction" to zero it.
7. **Try calibration**: tap "Calibrate," centre a peak you can identify in the
   reticle, pick it from the list, then — without moving the phone — tap where
   a second known peak appears and pick *that* from the list. Watch for the
   "calibrated — field of view ≈ N°" toast. A wildly wrong number (very close
   to the 25° or 100° clamp) means something about the pick was off — redo it.
8. **Deny a permission on purpose** (camera or location) to confirm the error
   screen appears cleanly and "Try again" recovers.

Send me what breaks — logs, screenshots, or just "the labels are off by about
30°" — and we'll work through it the same way we did Stages 0 and 2.

**Also:** `sw.js`'s `APP_SHELL` now includes `peak-finder.html` and
`js/peakfinder.js` (the real page can open offline too, not just the Stage 2
test harness), `SW_VERSION` bumped to `pf-stage3-v1` accordingly. If you test
Stage 3 on a device that already visited this site under an older
`SW_VERSION`, do the same unregister-and-hard-reload dance from Stage 2 first.

## Coverage check — 2026-09-17

User asked directly: does the app detect peaks everywhere (Dhauladhar, Zanskar,
Ladakh, Nepal, Sikkim, Arunachal), or is it restricted to wherever we'd been
testing (mostly Uttarakhand)? Checked the code first rather than assert:
**`api/peaks.js` has no regional restriction anywhere** — `parseBbox()` is
purely mathematical, `isMountainPeak()` filters on elevation/notability only.
It queries OSM globally for whatever bbox it's given.

Proved it live against the deployed API:

| Region | Result |
|---|---|
| Dhauladhar, Himachal (McLeod Ganj) | ✅ live OSM, 12 peaks |
| Zanskar | ✅ live OSM, 26 peaks |
| Sikkim (Kangchenjunga) | ✅ live OSM, 72 peaks |
| Arunachal Pradesh (Tawang) | ❌ → fixed → ✅ live OSM, 5 peaks (bilingual OSM tags, disputed-border area) |
| Ladakh (Leh town, narrow bbox) | ❌ still falls back — see below |

**Two real bugs found and fixed, both pushed:**
1. `PER_ENDPOINT_TIMEOUT_MS` (12s) was too tight for genuinely dense/slow
   Overpass responses — Arunachal and (partially) Ladakh were timing out and
   silently falling back. Raised in two steps: 12s → 13.5s (fixed Arunachal)
   → 20s + `vercel.json` maxDuration 30s → 45s (Overpass itself has
   `[timeout:25]` baked into the query — no point the client aborting before
   the server would).
2. `api/_fallback-peaks.json` had **zero** Arunachal Pradesh entries — a real
   gap in the degraded-path dataset. Added Kangto, Nyegi Kangsang, Gorichen
   Peak, Gorichen II, Nyegyi Kangsang II.

**Known remaining case, left as-is (working as designed, not a bug):** the
exact bbox centred on Leh town consistently takes 30s+ even with the extended
budget — confirmed with a cache-busted fresh request, not an edge-cache
artifact. Chasing this further with even longer timeouts has a real cost (a
40–60s wait on "Prepare this area" is bad UX even on success). This is
precisely the scenario the fallback dataset exists for: it degrades to
**Stok Kangri** — the actual best-known trekking peak immediately visible
from Leh — rather than erroring or showing nothing. Correct designed
behaviour, not a gap to keep closing with bigger timeouts.

**Bottom line for coverage:** the app is not Himalaya-region-restricted in
any way — it works anywhere OSM has peak data, which is effectively global.
Some specific dense areas may take longer or briefly show the offline set
while Overpass catches up; that degrades gracefully rather than failing.

## Stage 4 — what shipped

Reused rather than rebuilt: **t4-3 (tile diff/merge) and t4-4 (eviction) were
already correct in `prepareArea()` since Stage 2** — including the eviction
bug fix from that stage (a failed attempt never touches existing data). Stage
4 only needed to add the *policy* that decides *when* to call it automatically.

- **`js/peakstore.js` — `autoPrepareIfNeeded(center, opts)`** (t4-1, t4-2): the
  drift detector. Cheap to call on every position update — one IndexedDB read
  (`getPrep()`) decides in a moment whether anything needs to happen (nothing
  prepared yet, or drifted > 15 km). If so, it online-gates the attempt with
  **`pingOnline()`**: checks `navigator.onLine` first (fast, but known
  unreliable — reflects the OS network interface, not real reachability),
  then a real, cheap same-origin request (`/api/peaks` for a 1×1 km ocean box
  — guaranteed no peaks, resolves fast, but genuinely round-trips through
  Vercel to Overpass) before committing to a full multi-tile prepare. A
  failed ping (or an attempt where every tile fails) triggers exponential
  backoff — 30 s, 60 s, 120 s... capped at 20 min — so a flaky connection
  doesn't cause a retry storm; a real success resets the backoff to zero.
- **`peak-finder.html` / `js/peakfinder.js`**: the manual "Prepare this area"
  banner and button are gone, exactly as the blueprint's own Stage 4
  description says ("remove the manual prepare button"). Every geolocation
  update now feeds `autoPrepareTick()` (throttled to at most once per 3 s),
  which calls `autoPrepareIfNeeded()` and refreshes the peak list only when
  something actually changed. A new **staleness chip** (t4-5) shows
  `"prepared 12m ago · 8 km away"` in steady state, `"preparing…"` with live
  per-tile progress while a fetch is running, or `"offline — retrying
  automatically"` during a backoff window.
- **`docs/spike/stage-4-rolling-window-test.html`** + **`.js`**: a step-through
  harness driving a real ~290 km Delhi → Sankri route through
  `autoPrepareIfNeeded()`, one waypoint at a time — this is the blueprint's
  own DoD language ("feeding a 300 km mock travel track") made literal.
  **Testable entirely on a desktop browser** — DevTools' Network → Offline
  toggle stands in for a connectivity gap, same technique already proven in
  Stage 2. No phone required for this stage's DoD, unlike Stage 3.
- **Caught proactively before handoff, not found by testing:** the same class
  of `[hidden]` bug from Stage 3 — `.pkf-chip` sets `display: inline-flex`
  unconditionally, which would have defeated the new staleness chip's
  `hidden` attribute the same way `.pkf-gate`/`.pkf-error` broke last stage.
  Checked for it this time before it shipped; added the `[hidden]` override.
- **Deliberately skipped: t4-6, Background Sync.** The blueprint marks it
  optional and the DoD doesn't require it — implementing it properly means
  duplicating prepare logic into the service worker's execution context
  (IndexedDB access there is fine, but the cross-context plumbing is real
  work for a "finish an interrupted prepare after the tab closes" edge case).
  Same scoping discipline as Stage 3's map-mode/manual-location deferrals —
  flagging so it reads as a decision, not an oversight.
- `sw.js` `SW_VERSION` bumped to `pf-stage4-v1` (`peakstore.js` and
  `peakfinder.js`, both in `APP_SHELL`, changed).

## Stage 4 — manual test plan

**No phone needed for this one** — the rolling window is pure data-layer
logic, same as Stage 2.

1. `python3 scripts/dev-server.py 8000`, open
   `http://localhost:8000/docs/spike/stage-4-rolling-window-test.html`.
2. Click **"Next waypoint →"** a few times. Watch the log — early steps
   (Delhi, Panipat, Ambala) should prepare with few/no real peaks (correct —
   real geography, see the 2026‑09‑17 coverage check above); later ones
   (Rishikesh onward) should start finding real mountain data, and once
   you're deep into the Garhwal foothills, tiles from the very first
   (Delhi-area) waypoints should **evict** as they fall outside the 250 km
   keep-box — watch the "Tiles in store" table shrink on the Delhi end while
   it grows on the Sankri end.
3. Try **"Run all remaining"** to step through automatically.
4. Test the connectivity gap: DevTools → Network → **Offline**, click "Next
   waypoint" — should log `skipped: offline` with a backoff time, and the
   store must stay untouched. Go back **Online**, keep stepping — should
   resume normally once the backoff window passes.
5. **Reset + clear**, confirm the table/log both go back to empty.
6. Separately, on `peak-finder.html` itself (phone, whenever convenient): the
   "Prepare this area" button should simply be gone. On first load with an
   empty store, a status chip near the top should read something like
   `"no peaks prepared yet — waiting for a connection"`, then automatically
   flip to `"prepared just now · here"` without you tapping anything.

## Stage 4 — bug found in real testing: ping was measuring Overpass's mood

Your first rolling-window run (real browser, real internet) showed
`pingOnline()` timing out and the gate reporting "offline" even though the
connection was fine. Root cause: the ping hit `/api/peaks?bbox=1,1,1.01,1.01`
on the theory that a tiny bbox would resolve fast — wrong, because
`/api/peaks` *always* calls Overpass regardless of bbox size, and that
session Overpass was taking 20–26 s to answer. The 6 s ping timeout fired
first every time. Your Network-panel screenshot showed the exact mechanism:
the ping fetch shown as "(cancelled)" at 6.01 s, right next to the service
worker's own `/api/peaks` fetch for the same tile finally landing a 200 at
23 s — same slow backend, two different callers, only one of them timing out.

Fix: a new, dependency-free endpoint, **`api/peaks.js`'s sibling
`api/ping.js`**, that does nothing but echo `{ ok: true, t: Date.now() }`
with no Overpass call at all. `pingOnline()` now hits `/api/ping` instead.
`sw.js` treats `/api/ping` as network-only (never cache-fallback — a stale
cached "ok" would be actively wrong for an online-gate). `scripts/dev-server.py`
got a matching route. Verified locally: old approach ~26 s, new one ~0.01 s.
Pushed and confirmed live on Vercel. `SW_VERSION` → `pf-stage4-v2`.

## Stage 4 — bug found in real testing: fast browser-side 503s on tile fetches

Your next run (Delhi → Panipat) showed Delhi fully succeed (25/25 tiles,
confirming the ping fix worked) but Panipat's prepare fail completely — all
10 needed tiles came back `503` in DevTools' Network panel, each in
0–5 ms. That's too fast to be a real server response, and it was: I curled
`/api/peaks` directly against the live Vercel deployment with the exact same
10 bboxes Panipat needed, and all 10 came back `200` (a couple slow, via the
30 s Overpass-timeout → fallback path, but never a failure). The server
never once returned a 503 for these tiles.

That means the 503s in your browser were synthesized entirely by `sw.js`'s
own `networkFirst()` catch block — the underlying browser `fetch()` call
itself was erroring near-instantly, for a reason I couldn't pin down without
live browser access (candidates: some browser/SW-level cap on how long a
`respondWith()` promise is allowed to hang, or interference from an unrelated
extension visible in your Network panel — `tag_assistant_api_bin.js`,
`dapp-interface.js`). I can't confirm which, and chasing it further isn't
productive without a way to inspect it live.

What held up correctly regardless: the Stage 2 eviction-safety fix. Delhi's
25 prepared tiles were completely untouched by Panipat's total failure, all
10 Panipat tiles were correctly left `stale` rather than corrupted, the prep
pointer stayed at Delhi, and the exponential backoff kicked in and counted
down predictably through the rest of the route.

Fix (pragmatic, not root-cause): each per-tile fetch inside `prepareArea()`
now has its own client-side timeout (`TILE_FETCH_TIMEOUT_MS = 20000`, via
`AbortController`), so a tile that's going to fail, fails on a bound I
control rather than whatever opaque browser mechanism was producing the fast
failures. This doesn't explain the 0–5 ms 503s, but it makes the prepare
loop's worst case deterministic (max ~20 s per stuck tile, not indefinite)
regardless of cause. `SW_VERSION` → `pf-stage4-v3` (`peakstore.js` changed).

**Ask for you:** re-run the same Delhi → Panipat step on the rolling-window
harness once this is live. If the 503s were a one-off (flaky extension,
transient browser hiccup), it should just work now. If they recur, watch
whether they still resolve in 0–5 ms (still not-a-real-timeout, needs more
digging) or now take closer to 20 s (my timeout is the one firing, and we
know the true cause is upstream of my code, most likely that extension
interference — worth a re-test in an Incognito window with extensions off
to confirm).

## Stage 4 — re-test against live Vercel, plus a real latency fix

Testing `localhost:8000` in Incognito produced a different, unrelated
failure: every tile came back `(offline dataset)`. Direct `curl` from that
machine to `overpass-api.de:443` returned **connection refused** on all four
IPs (v4 and v6) while `google.com` and `treksense.vercel.app` both answered
instantly — the local network simply couldn't reach Overpass at that moment.
`scripts/dev-server.py` calls Overpass directly from whatever machine runs
it, so this was a local-network condition, not a code path shared with the
deployed site (Vercel's serverless functions reach Overpass from Vercel's
own network, not yours). Re-tested against the live site instead
(`https://treksense.vercel.app/docs/spike/stage-4-rolling-window-test.html`,
phone + laptop, both in real conditions) and got two useful, different
results:

- **The `TILE_FETCH_TIMEOUT_MS` fix is confirmed working.** Failures now show
  up as `"Fetch is aborted"` / `"signal is aborted without reason"` — a
  clean, bounded timeout — instead of the old instant fake `503`. Exactly
  the intended behavior: a tile that can't complete now fails predictably
  instead of hanging or lying about the reason.
- **New, legitimate finding: a fresh area took 20–40 s to fully prepare**,
  and you asked for this to feel closer to instant, since Peak Finder's
  whole premise is "prepare before you lose signal." Root cause was two
  compounding design choices in `prepareArea()`, not a bug: (1) tiles were
  fetched in whatever order the grid happened to list them, not ordered by
  distance from the user, so the tile someone is actually standing in could
  be fetched last; (2) tiles were fetched **one at a time**, so a 25-tile
  first-time prepare paid the full sum of 25 round-trips serially, and Stage
  4 field data has repeatedly shown individual Overpass calls can genuinely
  take several seconds to tens of seconds.

  Fix, both in `js/peakstore.js`'s `prepareArea()`: **(a)** `toFetch` is now
  sorted nearest-tile-first via a new `tileCenterDistanceKm()` helper, so
  the tile under the user's feet is requested before the outer edge of the
  100 km disc; **(b)** replaced the sequential loop with a small worker pool
  (`TILE_FETCH_CONCURRENCY = 5`) — up to 5 tiles in flight at once, each
  worker pulling the next (already nearest-first) tile off the queue as it
  frees up. This is a genuine architectural change, not new product surface
  — same public API, same progress events, same eviction-safety guarantee
  (still evicts/finalizes only when at least one tile actually succeeded).
  Expected effect: wall-clock time for a first-time area drops roughly by
  the concurrency factor, and the *useful* part — data for right where the
  user is — should be ready well before the rest of the disc finishes.
  `SW_VERSION` → `pf-stage4-v4` (`peakstore.js` changed again).

- **Also asked: why do so many tiles show `0 peaks (offline dataset)`?**
  Not a bug — `api/_fallback-peaks.json` is a curated list of 132 named
  Himalayan peaks, not an area-complete dataset. `(offline dataset)` only
  appears on a tile where Overpass failed *for that specific request* and
  the fallback kicked in; most individual 0.5° tiles, even genuinely
  mountainous ones, simply don't contain one of those 132 named peaks in
  their exact grid cell. It's a safety net for "give a real, correct answer
  when the live provider is down," not full coverage — when Overpass
  actually answers (no tag), results are much richer, as seen in the same
  logs (44 peaks in one tile, 20+ in others). Already documented as a known
  characteristic in the 2026‑09‑17 coverage-check section above; not
  something to keep chasing tile-by-tile.

## Stage 4 — the concurrency fix needed its own fix

First real run on the new Kathmandu → Khumbu route (dense real peak data —
71 peaks in one tile, 86 in another) surfaced a problem in the speed fix
itself: 14 of 25 tiles on the first waypoint, 12 of 19 on the second, failed
with `"signal is aborted without reason"` — every single one at exactly
`20.00s` in the Network panel, not near-instant like the original mystery
bug. That timing is the tell: `TILE_FETCH_TIMEOUT_MS` was 20000, but
`api/peaks.js`'s own comment says its worst case is `2 endpoints × 20s =
40s` before it even reaches the fallback. The client was giving up before
the server had finished trying. No data corruption (failed tiles were
honestly marked `stale`, never falsely marked `prepared`), but real
coverage gaps — tiles that would have returned genuine peak data got cut
off mid-flight.

Likely made worse by the concurrency fix itself: `TILE_FETCH_CONCURRENCY`
was 5, meaning up to 5 simultaneous Overpass queries could fire from Vercel
at once. The public Overpass API's documented fair-use policy caps
concurrent requests per client at ~2 — plausible that going to 5 tripped
that throttling and made individual requests slower, not faster.

Fix, both in `js/peakstore.js`: `TILE_FETCH_TIMEOUT_MS` 20000 → **42000**
(comfortably above the server's documented 40s worst case, just under
`vercel.json`'s 45s hard cap); `TILE_FETCH_CONCURRENCY` 5 → **2** (matching
Overpass's stated fair-use limit). `SW_VERSION` → `pf-stage4-v6`.

**Ask for you:** re-run the same Nepal route (Reset route + clear store
first, since Kathmandu's tiles are now marked `stale`). Expect fewer aborts
this time; any that remain should now represent genuinely stuck requests
worth a closer look, not premature cutoffs.

**Verified 2026‑09‑18:** re-ran the Nepal route live — 0 failures, real peak
data throughout (86, 71, 28, 27 peaks in various tiles), drift/skip/eviction
logic all correct. `TILE_FETCH_TIMEOUT_MS`/`TILE_FETCH_CONCURRENCY` fix
confirmed working. The rolling-window DoD (items 1-5 of the Stage 4 manual
test plan above) is now fully verified across two real routes and multiple
real bugs found-and-fixed through live testing. Only item 6 — confirming
the staleness chip's behavior directly on `peak-finder.html` on a phone —
remains untested this stage.

## Stage 4 — closed, 2026‑09‑19

Item 6 verified: after clearing the leftover Nepal test data
(`PeakStore.clearAll()` from the console, a dev-only technique, then
reload), a fresh phone test of the real AR page showed the chip cycle
correctly and automatically, no taps: `"no peaks prepared yet — waiting
for a connection"` → `"preparing — 28.5_76 (11/20)"` (with live per-tile
progress) → `"prepared just now · here"`, in well under two minutes. "0
peaks loaded" for this particular indoor/urban test location is expected —
same known characteristic as every other non-mountainous test location
throughout this project, not a bug. **Stage 4's DoD is fully met.** Next:
Stage 5 (fallbacks, polish, a11y), whenever you're ready to start it.

## Stage 5 — what shipped

All seven build items (t5-1 through t5-7) are code-complete. Same handoff
shape as Stage 3: everything here depends on camera/GPS/orientation, which
means **zero of it can be exercised from where I'm building** — I've code
reviewed it carefully (every element ID referenced in JS cross-checked
against the HTML, brace/paren balance verified, manifest JSON validated),
but the actual behavior needs a real device.

- **Map mode (t5-1, t5-2) — `enterMapMode()` / `renderMapPlot()` in
  `js/peakfinder.js`, `.pkf-map-view` in `peak-finder.html`.** A radial SVG
  plot: you're the centre dot, peaks are placed by real bearing/distance
  (range rings at ~1/3, 2/3, and max distance of whatever's loaded), no
  basemap, no camera dependency at all. Rotates with the live compass when
  one's available; a **Manual N-up** toggle (t5-2) locks it north-up
  instead — and locks automatically, toggle disabled, when there's no
  compass reading at all rather than offering a control that can't do
  anything. Entered automatically whenever camera OR orientation isn't
  available (not just camera — a phone with a working camera but no usable
  compass can't do real AR either, so it gets the same graceful landing).
  A **"Try camera again"** button lets you retry without reloading.
- **Low-accuracy banner (t5-2) — `updateChips()`.** The existing small
  sensor chip already showed compass confidence; this adds a more visible
  banner once it's been genuinely bad for ~1.5s continuous (not a flicker
  on every noisy frame), reusing the existing figure-eight recalibration
  guidance.
- **Manual location (t5-3) — `openManualLocation()` / `useManualLocation()`,
  `.pkf-manual-loc` in `peak-finder.html`.** A "No GPS?" link appears on the
  gate **only after a real GPS failure** (denied, timed out, or genuinely
  unsupported), leading to a panel with a free-text "latitude, longitude"
  field (paste from a Google Maps long-press) plus nine curated Himalayan
  trailhead quick-picks (Manali, Leh, Joshimath, Munsiyari, Darjeeling,
  Gangtok, Pahalgam, Namche Bazaar, Kathmandu). No map library — the site's
  CSP only allows scripts from `'self'`, and adding an external mapping
  library would've meant loosening that for one panel. Whatever's picked
  feeds `enterBestAvailableMode()` exactly like a real GPS fix would; the
  only difference is there's no live tracking afterward (a manual location
  is static by definition), so the rolling window prepares once for it and
  stops, correctly.
- **Permission priming (t5-4) — the gate's new `<ul class="pkf-perm-primer">`
  in `peak-finder.html`.** Three lines explaining camera/location/motion
  *before* `Start Peak Finder` is tapped, i.e. before any OS permission
  dialog fires.
- **Accessible peak list (t5-5) — `renderPeakList()` / `compassWord()`.** A
  real `<ul>`, not the AR labels (which are positioned purely by screen
  geometry and reshuffle every frame — unusable for a screen reader).
  Reachable from both AR view and map mode via a **Peak list** button.
  Format matches the blueprint's own example exactly: "Nanda Devi, 7,816 m,
  42 km, north-east".
- **`prefers-reduced-motion` / camera release / idle throttle (t5-6).**
  The reduced-motion rule turned out to already exist site-wide
  (`css/styles.css` line ~883, a blanket `*{animation:none;transition:none}`
  under the media query) — nothing to add there. Idle-based frame-rate
  throttling also already existed from Stage 3 (`currentFrameInterval()`).
  What was missing: releasing the camera when the tab is hidden
  (`document.visibilitychange` now stops every track and clears
  `S.camStream`) and reacquiring it when the tab's visible again — a
  background tab holding the camera open is a real battery/resource cost,
  and nothing was doing this before.
- **Horizon placement for unknown-elevation peaks (t5-7) —
  `placeLabels()`.** Previously a `null` elevation was silently treated as
  sea-level, which for most real distances put the label *below* the true
  horizon — technically "some" position, but a wrong and misleading one,
  not "unknown." Now pinned explicitly to the horizon line (elevation angle
  forced to 0°) and marked: a distinct label style (`.no-elev`, muted
  border instead of amber), the existing "elev n/a" text extended to "elev
  n/a — on horizon", and the same "reduced vertical accuracy" note carried
  into the accessible peak list.
- **PWA infrastructure (DoD requirement, not its own build item).**
  `manifest.json` (name, icons, `start_url: /peak-finder.html`,
  `display: standalone`), real icon assets in `icons/` (192px/512px, both
  a plain and a "maskable"-safe-zone variant, rasterized from an SVG
  source matching the site's actual logo mark and brand green `#2f6b4e` —
  generated locally via macOS's built-in `qlmanage` QuickLook thumbnailer,
  no external tool needed), and — the one genuine gap found while building
  this — **`peak-finder.html` itself never registered the service worker**.
  Only the Stage 2 test harness ever called `serviceWorker.register()`;
  the real product page never did, which means the PWA installability and
  app-shell offline caching this whole build has been assuming were never
  actually live on the one page that matters. Fixed in
  `registerServiceWorker()`, called on boot. `sw.js`'s `APP_SHELL` extended
  to precache the manifest and icons. `SW_VERSION` → `pf-stage5-v1`.
- **Small a11y pass beyond the explicit build list**, since it directly
  serves the DoD's axe requirement: added `aria-modal="true"` to every
  overlay dialog (including the pre-existing calibration overlay, which had
  no ARIA role at all before this), and a global **Escape** key handler to
  close whichever dialog is open.

**Deliberately not built:** a real drop-a-pin map widget for manual
location (see above — CSP + no-new-dependency reasoning); WMM-based true
declination (still the coarse stand-in from Stage 0, unchanged — Android
Stage 0 data still hasn't landed, tracked since Stage 0/3).

## Stage 5 — manual test plan (yours — nothing here can run without a device)

**Camera-denied path (t5-1):** on a fresh permission state (or via browser
site-settings → reset permissions for this site), tap Start, deny camera
when prompted, allow location/motion. Should land in **map mode**, not an
error screen — a radial plot with you at the centre, a rotating N marker,
peaks as dots. Tap **Try camera again**; granting this time should switch
you into the normal AR view.

**Compass-denied/unavailable path (t5-1/t5-2):** if your device/browser
doesn't expose orientation, or you deny the motion permission prompt (iOS
Safari asks separately), you should also land in map mode, with the
**Manual N-up** toggle disabled and reading "North-up (no compass)" rather
than offering a non-functional option.

**GPS-denied path (t5-3):** deny location. The gate should show the error
message and reveal **"No GPS? Set your location manually"**. Tap it, try
an invalid entry (e.g. "abc") — should show a validation error, not crash.
Try a real "lat, lon" paste and a quick-pick town — both should proceed
into AR or map mode (whichever camera/compass state allows) with peaks
loading for that location.

**Permission priming (t5-4):** just visually confirm the three
camera/location/motion explanation lines appear on the gate *before* you
tap Start — i.e. before any OS permission dialog.

**Accessible peak list (t5-5):** tap **Peak list** from either AR view or
map mode. Confirm entries read like "Nanda Devi, 7,816 m, 42 km,
north-east" and are ordered nearest-first. If you have a screen reader
handy (VoiceOver/TalkBack), turn it on and confirm the list reads
sensibly — this is the one part of Stage 5 I genuinely cannot evaluate at
all without one.

**Camera release on tab hide (t5-6):** while Peak Finder's camera view is
active, switch to another app/tab for a few seconds, then come back.
Camera should resume (possibly a brief black flash while it reacquires),
not stay frozen on the last frame. Bonus check: if your OS shows a
camera-in-use indicator, confirm it disappears while backgrounded.

**Reduced motion (t5-6):** turn on "Reduce Motion" in your OS accessibility
settings, reload the page, confirm the detail sheet and labels appear
without a slide/fade animation (should just snap into place).

**Missing elevation (t5-7):** hard to force deliberately, but if you ever
see a label reading "elev n/a — on horizon" with a greyish left border
instead of the usual amber one, that's this working — it should sit right
on the horizon strip, not below it.

**PWA install (DoD):** open `peak-finder.html` in Chrome, DevTools →
Lighthouse tab → run a report with the "Progressive Web App"/installability
checks included (exact panel name varies by Chrome version — look for
"Installable" in the report). Separately, DevTools → Lighthouse also has an
**Accessibility** category that runs axe-core under the hood — run that
too and report back what it finds. On mobile, check whether your browser
offers an actual "Add to Home Screen" / "Install" prompt for the page.

**Note on testing this stage at all:** like Stage 3, the permission-denial
paths need a way to actually deny each permission, which usually means
resetting the site's permissions between tests (browser site-settings, or
a fresh Incognito window per test) rather than relying on whatever you
answered the first time.

## Stage 5 — bug found in real testing: map mode unreadable at high peak density

First real device test (iPhone, Safari + Web Inspector, both camera and
location denied → manual location → a genuinely dense real area, 141
peaks) surfaced a real gap: `renderMapPlot()` labelled every single peak
unconditionally. The AR camera view already solves exactly this problem —
`placeLabels()` pushes overlapping labels apart — but that logic never got
carried into map mode, so 141 names piled on top of each other into
illegible noise. A separate, compounding issue: the plot's distance scale
was set by the single farthest peak in range (seen live at "147 km"),
which crushed everything nearer into a tight knot near the centre.

Fix, both in `renderMapPlot()`: **(1)** peaks are now sorted by distance
and only the nearest `MAP_MAX_LABELS` (15) get a text label; every peak
still gets a tappable dot (dimmer past the labelled cutoff), and the full
list remains one tap away via **Peak list**. **(2)** the distance scale is
now capped at `PREPARE_RADIUS_KM` (100 km) regardless of how far the
single farthest peak is, so a rare distant outlier can't compress
everything else near the centre.

Also confirmed working correctly by this same test round, worth recording
since it wasn't obvious from the screenshots alone: camera-denied shows
*no* visible error (silently lands in map mode — there's nothing
actionable to tell the user), while location-denied *does* show a visible
error and the "No GPS?" link, because that failure has no automatic
substitute and genuinely needs the user to act. Both are intentional, not
inconsistent.

## Stage 5 — bug found in real testing: map mode became unresponsive with a large real dataset

Reported live: the Peak list button worked with an earlier, smaller test
but "became static and non-clickable" after a slow (2-3 minute, real
Overpass conditions) manual-location prepare that landed 170 real peaks
(Munsiyari area, India/Nepal/Tibet border — a genuinely dense region).

Root cause: `mapLoop()` called `renderMapPlot()` unconditionally on every
animation frame (up to 20/sec), and `renderMapPlot()` tears down and fully
rebuilds the *entire* plot every time — every dot, every label, and a
fresh click listener on every dot. With 170 peaks that's hundreds of SVG
nodes recreated continuously, **forever, even when nothing could possibly
change** — the test had no live compass and a static manual location, so
the plot was 100% visually static the whole time, yet still being torn
down and rebuilt 20 times a second. That's almost certainly what made the
Peak list button feel unresponsive — not broken, just starved, competing
with a main thread that was busy doing pointless work.

Fix, in `js/peakfinder.js`: the animation loop now only runs at all when
there's an actual live heading to track (`S.hasOrientation && !mapNupManual`)
— it stops itself the instant that's no longer true, and
`startMapLoopIfNeeded()` restarts it if the user switches back to live
compass via the N-up toggle. Since the loop no longer fires on every
frame unconditionally, two places now explicitly trigger a repaint instead
of relying on it: the N-up toggle itself (immediate feedback), and
`autoPrepareTick()` when new peaks actually finish loading (previously
relied on the loop picking it up within the next ~50ms, which no longer
holds now that the loop may not be running at all).

**Also, for the record — not a bug:** the radial plot was never designed
to be pannable/draggable (the blueprint's own words: "no basemap" — it's
a simple schematic, not an interactive map). Tapping any dot (labelled or
not) opens the full detail sheet, and the Peak list button gives the
complete text list — between those two, all 170 peaks are reachable even
though only the nearest 15 get an on-canvas label.

**Separately noted, not acted on:** testing in Safari (which had
accumulated months of prior-stage IndexedDB data) behaved differently
from a fresh Chrome-on-iOS session — expected, since iOS sandboxes each
browser app's storage completely separately even though they share the
same WebKit engine. Recommended clearing Safari's site data for a clean
comparable test rather than switching browsers (Chrome-on-iOS tabs aren't
visible in Mac Safari's Web Inspector, so switching loses log visibility).

## Stage 5 — bug found in real testing: map mode's dots weren't actually tappable

After the responsiveness fix, live testing confirmed the plot itself
worked, but tapping a dot did nothing. Two compounding bugs, both in
`renderMapPlot()`:

1. **The visible dot was far too small to hit.** `r=2-3` SVG units on a
   plot up to 420px wide works out to roughly 5-6px on screen — a fraction
   of Apple's own 44x44pt minimum touch target guideline. It was never
   reliably tappable on a real finger, mouse-click testing in a desktop
   browser wouldn't have caught this.
2. **The text label — the visually larger, more obvious target — had no
   click handler at all.** Only the tiny dot did, so tapping the name
   itself, which looks like the thing you'd tap, did nothing either.

Fix: each peak now gets an invisible, generously-sized (`r=9`) hit circle
carrying the actual click handler, layered under a purely-cosmetic small
visible dot (`pointer-events: none`, so it doesn't shadow the hit circle).
The text label also got its own click handler pointing at the same
`openSheet()` call. One CSS wrinkle caught before it shipped: a
pre-existing `.peak-lbl` rule further down the stylesheet already set
`pointer-events: none` on labels, which would have silently cancelled the
new handler (same specificity, later rule in the cascade wins) — merged
into one correct rule instead of leaving two conflicting ones.

Also independently confirmed in this same test round, worth recording:
**offline mode works as designed.** Airplane Mode after preparing an area
still loaded peaks normally — confirms the core architecture end-to-end
on a real device: peak data downloaded once while online into IndexedDB,
then both AR view and map mode read exclusively from that local store
with zero network dependency at the point of actual use.

## Stage 5 — Lighthouse + manifest audit results

Both run against the live site, DevTools Lighthouse tab: `plan.html` (not
part of this feature, checked for comparison) 89/93/100/100;
**`peak-finder.html` — 99 Performance / 94 Accessibility / 100 Best
Practices / 100 SEO.** No PWA category shown — recent Chrome moved
installability checks into the Application → Manifest panel instead of
the old Lighthouse PWA score.

That panel confirmed the service worker registration fix is genuinely
live (`#28 activated and is running` for `sw.js`) and surfaced one real,
fixable issue: **the SVG manifest icon (`peak-finder-icon.svg`, declared
with `sizes: "any"`) failed to load in Chrome's manifest checker**, even
though the file itself serves correctly (verified directly — HTTP 200,
correct `image/svg+xml` content-type, valid SVG content). This is a known
browser-side inconsistency with SVG icons under `sizes: "any"`, not a
file/path bug. Since the manifest already declares proper PNG icons at
192px and 512px (both `any` and `maskable` purpose) which loaded without
issue, the SVG entry was pure redundancy — removed it from both
`manifest.json` and `sw.js`'s `APP_SHELL` precache list rather than chase
a browser quirk for no functional gain. Also added the manifest's
optional `id` field (`/peak-finder.html`) per the panel's own suggestion,
so the app's identity stays stable across any future manifest edits
regardless of `start_url`. `SW_VERSION` → `pf-stage5-v5`.

Two remaining "errors and warnings" in that panel are optional, not
blockers: Chrome's *richer* install UI (a bigger install card with app
screenshots) needs `screenshots` entries in the manifest, which we don't
have — the page is still fully installable without them, just with the
plain/standard install prompt instead of the richer one. Not building
this now; flagging so it reads as a scope decision, not an oversight.

## Stage 5 — the map-mode performance fix needed a second pass

The earlier fix (stop the animation loop entirely when there's nothing to
animate) only covered the *static* case — no live compass, or Manual N-up
locked. Live testing on the real deployment with camera denied but
location + motion granted put it back in exactly the failure mode from
before: a live compass **correctly** keeps the loop running continuously
to track rotation, and every one of those frames was still doing a full
teardown-and-rebuild of the whole plot (worse than before, since the
tappable-dot fix roughly doubled the element count with invisible hit
circles). Confirmed live: rotation itself tracked phone movement
correctly the whole time — proof the loop was running fine — while Peak
list, Try camera again, and the N-up toggle were all completely
unresponsive simultaneously, the same "main thread busy doing pointless
repeated work" signature as the original bug.

Real fix this time, not a workaround: separated **building** the plot
(every dot, label, hit-circle, listener — expensive, but only needs to
happen once per actual data change) from **rotating** it (cheap, needs to
happen every frame while tracking). Everything that depends on heading —
the cardinal N/E/S/W markers and every peak marker — now lives inside one
SVG `<g>` built at a fixed north-up baseline; the per-frame loop
(`mapLoop()`) just sets that single group's `transform="rotate(...)"`
attribute instead of recreating ~200 DOM nodes with fresh listeners 20
times a second. Verified the math is equivalent to the old per-point
formula (SVG's rotation matrix distributes over a group exactly like
adding the same angle to each point individually would), not just visually
similar. Range rings and the centre "you" marker don't depend on heading
at all, so they stay outside the rotating group and are never touched by
the per-frame update. `renderMapPlot()` stays the public entry point
everything else calls (N-up toggle, `autoPrepareTick()` on new data);
internally it now just does one full build + one rotation update, same as
before for those less-frequent callers — only the continuous per-frame
path changed.

Also clarified during this round: testing briefly hit
`ashish-119.github.io/Treksense/` — a separate, live, auto-updating
GitHub Pages mirror of this repo with no backend at all (`/api/peaks` and
`/api/ping` both 404 there), unrelated to Vercel and apparently
publicly reachable this whole time. Not a code issue, but worth the user
checking their repo's Pages settings — flagged, not acted on (repo
configuration, not code).

## Stage 5 — closed, 2026‑09‑20

Retest after the rotation-group fix: radial plot rotation tracks live
phone movement correctly, all three action buttons (Peak list, Try
camera again, N-up toggle) stayed responsive throughout, the accessible
peak list rendered correctly formatted entries for the already-cached
Munsiyari data, and toggling between locked/live compass behaved exactly
as designed (frozen when locked, tracking when live). **Every item on the
Stage 5 test plan is now confirmed working on a real device**, including
recovery from three real bugs found only through live testing this round
— two rounds of map-mode responsiveness (first: an unconditional
continuous re-render loop; second, more subtly: the same loop's per-frame
cost even when it correctly needed to keep running) and untappable dots
below Apple's minimum touch target. **Stage 5's DoD is fully met.** Next:
Stage 6 (field test → harden → launch), whenever ready to start it.
