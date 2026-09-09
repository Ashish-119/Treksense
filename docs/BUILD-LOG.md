# Peak Finder v2 — build log

Tracking the 7-stage build from [`peak-finder-ar-blueprint.html`](peak-finder-ar-blueprint.html).
Preview of the target UI: [`peak-finder-preview.html`](peak-finder-preview.html).

| Stage | Scope | Status | Date | Notes |
|---|---|---|---|---|
| **0** | Foundations & sensor spike | 🟡 in progress | 2026‑09‑09 | Spike + [runbook](spike/stage-0-runbook.html) built ([`spike/STAGE-0.md`](spike/STAGE-0.md)); awaiting device measurements + declination‑source decision |
| **1** | Backend + data layer (`/api/peaks?bbox=`) | ⬜ not started | — | Blocked on Stage 0 exit |
| **2** | On-device store + preparation | ⬜ not started | — | |
| **3** | AR projection engine | ⬜ not started | — | |
| **4** | Automatic rolling window | ⬜ not started | — | |
| **5** | Fallbacks, polish, a11y | ⬜ not started | — | |
| **6** | Field test → harden → launch | ⬜ not started | — | |

**Legend:** ⬜ not started · 🟡 in progress · ✅ done · 🔴 blocked

## Stage 0 — open items
- [ ] Deploy `docs/spike/sensor-spike.html` to HTTPS (GitHub Pages)
- [ ] Run audit + drift + jitter + known-bearing checks on iOS + Android (+ low-end)
- [ ] Download `WMM.COF`, confirm size
- [ ] Fill decisions D‑0.1 … D‑0.4 in `spike/STAGE-0.md`
- [ ] Tick the Stage 0 exit checklist
