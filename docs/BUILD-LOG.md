# Peak Finder v2 — build log

Tracking the 7-stage build from [`peak-finder-ar-blueprint.html`](peak-finder-ar-blueprint.html).
Preview of the target UI: [`peak-finder-preview.html`](peak-finder-preview.html).

| Stage | Scope | Status | Date | Notes |
|---|---|---|---|---|
| **0** | Foundations & sensor spike | 🟢 iOS done · Android deferred | 2026‑09‑11 | iPhone 17 passes indoor **and outdoor** (drift + known‑bearing, user‑reported "full green"). Android device + `WMM.COF` carried forward — see risk note below. See [`spike/STAGE-0.md`](spike/STAGE-0.md) · reference: [`spike/reading-the-spike.html`](spike/reading-the-spike.html) |
| **1** | Backend + data layer (`/api/peaks?bbox=`) | ✅ done | 2026‑09‑12 | `api/peaks.js` + `api/_fallback-peaks.json` + `js/tiles.js` + `docs/PEAKS-API.md`. Tested against live Overpass and the fallback path via `scripts/dev-server.py`. |
| **2** | On-device store + preparation | ✅ done | 2026‑09‑16 | `js/peakstore.js` (IndexedDB) + `sw.js` + `docs/spike/stage-2-store-test.html`. DoD verified in-browser, including a real bug found and fixed mid-test. |
| **3** | AR projection engine | 🟡 code done, awaiting your test | 2026‑09‑16 | `peak-finder.html` + `js/peakfinder.js` — real page, wired into the nav. **Zero browser testing possible on my end for this stage** (camera/GPS/orientation need a real device) — this is the riskiest handoff yet. See below. |
| **4** | Automatic rolling window | 🟡 code done, awaiting your test | 2026‑09‑17 | Manual "Prepare" button removed from the real page, replaced with an automatic drift detector + online gate/backoff in `js/peakstore.js`. Testable on a **desktop browser, no phone needed** — see `docs/spike/stage-4-rolling-window-test.html`. |
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
