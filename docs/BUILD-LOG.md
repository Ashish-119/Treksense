# Peak Finder v2 — build log

Tracking the 7-stage build from [`peak-finder-ar-blueprint.html`](peak-finder-ar-blueprint.html).
Preview of the target UI: [`peak-finder-preview.html`](peak-finder-preview.html).

| Stage | Scope | Status | Date | Notes |
|---|---|---|---|---|
| **0** | Foundations & sensor spike | 🟡 in progress | 2026‑09‑11 | iPhone 17 indoor test done — passes API audit, iOS heading is TRUE, jitter σ≈0.6°. Pending: outdoor drift + known‑bearing, Android device, `WMM.COF`. See [`spike/STAGE-0.md`](spike/STAGE-0.md) |
| **1** | Backend + data layer (`/api/peaks?bbox=`) | ⬜ not started | — | Blocked on Stage 0 exit |
| **2** | On-device store + preparation | ⬜ not started | — | |
| **3** | AR projection engine | ⬜ not started | — | |
| **4** | Automatic rolling window | ⬜ not started | — | |
| **5** | Fallbacks, polish, a11y | ⬜ not started | — | |
| **6** | Field test → harden → launch | ⬜ not started | — | |

**Legend:** ⬜ not started · 🟡 in progress · ✅ done · 🔴 blocked

## Stage 0 — open items
- [x] Deploy spike to HTTPS — live at `ashish-119.github.io/Treksense/docs/spike/`
- [x] iPhone 17 — API audit + indoor jitter
- [ ] iPhone 17 — **outdoor**: 60 s drift watch + known-bearing check (≥ 3 landmarks)
- [ ] Android device — full run (audit + drift + jitter + known-bearing)
- [ ] Low-end Android — jitter + audit
- [ ] Download `WMM.COF`, confirm size (~5–6 KB)
- [ ] Fill decisions D‑0.1 … D‑0.4 in `spike/STAGE-0.md`
- [ ] Tick the Stage 0 exit checklist

## Stage 0 — findings so far
- iOS `webkitCompassHeading` = **true north** → declination is Android-only.
- iOS gives **GPS altitude** (±30 m) — not null as the blueprint feared.
- iPhone 17 compass **σ ≈ 0.6°** steady-state → light EMA sufficient on iOS.
- Spike updated 2026-09-11: jitter test trims 3 s settling + weights σ; auto-selects
  "heading already true" on iOS; adds `webkitCompassAccuracy` readout.
